import { Injectable, signal, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, delay, tap, catchError, map, throwError, switchMap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { User, Project, Organization, CreateUserDTO, UpdateUserDTO, CreateProjectDTO, CreateOrganizationDTO, PaginatedResponse, ProjectRequest, ApiResponse } from '../../../core/models/domain.models';
import { AuthService } from '../../../core/auth/services/auth.service';
import { RegisterRequest } from '../../../core/auth/models/auth.models';

@Injectable({
  providedIn: 'root'
})
export class AdminDataService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private apiUrl = environment.apiUrl;

  // State Signals (acting as cache/store)
  private users = signal<User[]>([]);
  private projects = signal<Project[]>([]);
  private organizations = signal<Organization[]>([]);

  constructor() {}

  // --- Users Methods ---

  getUsers(page: number = 1, pageSize: number = 25, query: string = '', role: string | null = null, status: string | null = null): Observable<PaginatedResponse<User>> {
    let params: any = {
      page: page,
      limit: pageSize
    };

    // Don't send search query to backend (filter in frontend instead)
    if (role) params.role = role;
    if (status) params.status = status;

    return this.authService.getUsers(params).pipe(
      map(response => {
        if (response.success && response.data) {
          let allUsers = response.data.data;

          // Frontend filter for search by name or email
          if (query) {
            const q = query.toLowerCase();
            allUsers = allUsers.filter((user: User) => {
              return user.name.toLowerCase().includes(q) || user.email.toLowerCase().includes(q);
            });
          }

          return {
            data: allUsers,
            meta: {
              totalItems: query ? allUsers.length : response.data.total,
              itemCount: allUsers.length,
              itemsPerPage: response.data.limit,
              totalPages: query ? Math.ceil(allUsers.length / pageSize) : response.data.totalPages,
              currentPage: page
            }
          };
        }
        // Fallback to empty if fails
        return {
          data: [],
          meta: {
            totalItems: 0,
            itemCount: 0,
            itemsPerPage: pageSize,
            totalPages: 0,
            currentPage: page
          }
        };
      }),
      catchError(error => {

        return of({
          data: [],
          meta: {
            totalItems: 0,
            itemCount: 0,
            itemsPerPage: pageSize,
            totalPages: 0,
            currentPage: page
          }
        });
      })
    );
  }

  // Legacy support if needed, but prefer paginated
  getAllUsers(): Observable<User[]> {
    return of(this.users()).pipe(delay(500));
  }

  createUser(dto: CreateUserDTO): Observable<User> {
    const registerData: RegisterRequest = {
      name: dto.name,
      email: dto.email,
      role: dto.role
    };

    return this.authService.register(registerData).pipe(
      tap(newUser => {
        this.users.update(current => [...current, newUser]);
      })
    );
  }

  updateUser(dto: UpdateUserDTO): Observable<User> {
    return this.authService.updateUser(dto).pipe(
      tap(updatedUser => {
        this.users.update(current => current.map(u => u.id === dto.id ? updatedUser : u));
      })
    );
  }

  toggleUserStatus(id: string, currentStatus: string): Observable<User> {
    const newStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    return this.authService.toggleUserStatus(id, newStatus).pipe(
      tap(updatedUser => {
        this.users.update(current => current.map(u => u.id === id ? updatedUser : u));
      })
    );
  }

  getAdvisors(): Observable<User[]> {
    return of(this.users().filter(u => u.role === 'ASESOR')).pipe(delay(300));
  }
  
  // New methods for Project Wizard
  private readonly MAX_BACKEND_ITEMS_BEFORE_FRONTEND_PAGINATION = 25;
  private cachedProjects = signal<Project[] | null>(null);
  private cachedQuery = signal<string>('');
  private cachedStatus = signal<any>(null);
  private cachedTotal = signal<number>(0);

  getProjects(page: number = 1, pageSize: number = 25, query: string = '', status: any = null): Observable<PaginatedResponse<Project>> {
    // Check if we have cached data with same filters
    const cachedData = this.cachedProjects();
    const sameQuery = this.cachedQuery() === query;
    const sameStatus = this.cachedStatus() === status;

    // Don't use cache if there's a search query (filtering changes results)
    if (cachedData && sameQuery && sameStatus && !query) {
      // Use cached data and paginate in frontend
      const totalItems = this.cachedTotal();
      const totalPages = Math.ceil(totalItems / pageSize);
      const startIndex = (page - 1) * pageSize;
      const paginatedData = cachedData.slice(startIndex, startIndex + pageSize);



      return of({
        data: paginatedData,
        meta: {
          totalItems,
          itemCount: paginatedData.length,
          itemsPerPage: pageSize,
          totalPages,
          currentPage: page
        }
      });
    }

    // No cached data or filters changed, fetch from backend
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', pageSize.toString());

    // Don't send search query to backend (backend doesn't support it properly)
    // We'll filter in frontend instead
    if (status) params = params.set('status', status);


    return this.http.get<any>(`${this.apiUrl}/projects`, { params }).pipe(
      map(response => {
        if (response.success && response.data) {
          const apiResponse = response.data;

          // Mock progress values to 0% to avoid errors
          let allProjects = (apiResponse.data || []).map((project: any) => ({
            ...project,
            progress: project.progress || {
              technical: 0,
              legal: 0,
              financial: 0,
              social: 0
            }
          }));

          // Frontend filter for search by organization name or project description
          if (query) {
            const q = query.toLowerCase();
            allProjects = allProjects.filter((project: any) => {
              const orgName = project.organizationName || project.organization?.name || project.organization || '';
              const description = project.description || '';
              return orgName.toLowerCase().includes(q) || description.toLowerCase().includes(q);
            });
          }

          const totalItems = query ? allProjects.length : (apiResponse.total || allProjects.length);

          // Backend workaround: If backend returns more items than expected, cache and paginate in frontend
          const itemsReturned = allProjects.length;
          const needsFrontendPagination = itemsReturned > this.MAX_BACKEND_ITEMS_BEFORE_FRONTEND_PAGINATION;

          if (needsFrontendPagination) {
            // Cache all projects for future pagination
            this.cachedProjects.set(allProjects);
            this.cachedQuery.set(query);
            this.cachedStatus.set(status);
            this.cachedTotal.set(totalItems);

            // Paginate in frontend
            const totalPages = Math.ceil(totalItems / pageSize);
            const startIndex = (page - 1) * pageSize;
            const paginatedData = allProjects.slice(startIndex, startIndex + pageSize);



            return {
              data: paginatedData,
              meta: {
                totalItems,
                itemCount: paginatedData.length,
                itemsPerPage: pageSize,
                totalPages,
                currentPage: page
              }
            };
          }

          // Backend is correctly paginating, don't cache
          return {
            data: allProjects,
            meta: {
              totalItems,
              itemCount: allProjects.length,
              itemsPerPage: apiResponse.limit || pageSize,
              totalPages: apiResponse.totalPages || 0,
              currentPage: apiResponse.page || page
            }
          };
        }
        return {
          data: [],
          meta: { totalItems: 0, itemCount: 0, itemsPerPage: pageSize, totalPages: 0, currentPage: page }
        };
      }),
      catchError(error => {

        return of({
          data: [],
          meta: { totalItems: 0, itemCount: 0, itemsPerPage: pageSize, totalPages: 0, currentPage: page }
        });
      })
    );
  }

  createProject(request: ProjectRequest): Observable<ApiResponse<Project>> {
    
    return this.http.post<ApiResponse<Project>>(`${this.apiUrl}/projects`, request).pipe(
      tap(response => {
        if (response.success && response.data) {
          this.projects.update(current => [response.data, ...current]);
        }
      }),
      catchError(error => {
        return throwError(() => error);
      })
    );
  }

  updateProject(id: string, request: ProjectRequest): Observable<ApiResponse<Project>> {
    return this.http.post<ApiResponse<Project>>(`${this.apiUrl}/projects`, request).pipe(
      tap(response => {
        if (response.success && response.data) {
          this.projects.update(current => current.map(p => p.id === id ? response.data : p));
        }
      }),
      catchError(error => {
        return throwError(() => error);
      })
    );
  }

  assignAdvisor(projectId: string, axisId: string, userId: string, isActive: boolean): Observable<Project> {
    const payload = {
      user: { id: userId },
      axis: { id: axisId },
      project: { id: projectId },
      isActive
    };
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/projects/adviser`, payload).pipe(
      switchMap(() => this.http.get<ApiResponse<Project>>(`${this.apiUrl}/projects/${projectId}`)),
      map(response => response.data),
      tap(updatedProject => {
        if (updatedProject?.id) {
          this.projects.update(current => current.map(p => p.id === updatedProject.id ? updatedProject : p));
        }
      }),
      catchError(error => {
        return throwError(() => error);
      })
    );
  }

  getAllOrganizations(): Observable<Organization[]> {
    return of(this.organizations()).pipe(delay(500));
  }

  // --- Organizations Methods ---

  getOrganizations(page: number = 1, pageSize: number = 10, query: string = ''): Observable<PaginatedResponse<Organization>> {
    let data = this.organizations();

    // Filter
    if (query) {
      const q = query.toLowerCase();
      data = data.filter(o => o.name.toLowerCase().includes(q) || o.identifier.includes(q) || o.email.toLowerCase().includes(q));
    }

    // Pagination
    const totalItems = data.length;
    const totalPages = Math.ceil(totalItems / pageSize);
    const startIndex = (page - 1) * pageSize;
    const paginatedData = data.slice(startIndex, startIndex + pageSize);

    return of({
      data: paginatedData,
      meta: {
        totalItems,
        itemCount: paginatedData.length,
        itemsPerPage: pageSize,
        totalPages,
        currentPage: page
      }
    }).pipe(delay(500));
  }

  getOrganizationUsers(organizationId: string): Observable<User[]> {
    return of(this.users().filter(u => u.role === 'ORGANIZACION')).pipe(delay(300));
  }

  createOrganization(dto: CreateOrganizationDTO, file: File): Observable<Organization> {
    const newOrg: Organization = {
      id: Math.random().toString(36).substr(2, 9),
      name: dto.name,
      type: dto.type,
      identifier: dto.identifier,
      verificationDigit: dto.verificationDigit,
      email: dto.email,
      website: dto.website,
      municipality: { id: '', nombre: dto.municipality, codigo: '', tipo: '', padreId: null, deletedAt: null, createdAt: '', updatedAt: null },
      region: { id: '', nombre: dto.region, codigo: '', tipo: '', padreId: null, deletedAt: null, createdAt: '', updatedAt: null },
      contactName: dto.contactName,
      status: dto.status || 'ACTIVE',
      userId: 'temp-user-id'
    };

    // console.log('Uploading file:', file.name, 'Size:', file.size); // REMOVED FOR SECURITY (A02)
    
    this.organizations.update(current => [newOrg, ...current]);
    return of(newOrg).pipe(delay(1500)); // Simulate upload delay
  }

  updateOrganization(id: string, dto: Partial<CreateOrganizationDTO>): Observable<Organization> {
    let updatedOrg: Organization | undefined;
    
    this.organizations.update(current => current.map(o => {
      if (o.id === id) {
        updatedOrg = { ...o };
        if (dto.name !== undefined) updatedOrg.name = dto.name;
        if (dto.type !== undefined) updatedOrg.type = dto.type;
        if (dto.identifier !== undefined) updatedOrg.identifier = dto.identifier;
        if (dto.verificationDigit !== undefined) updatedOrg.verificationDigit = dto.verificationDigit;
        if (dto.email !== undefined) updatedOrg.email = dto.email;
        if (dto.website !== undefined) updatedOrg.website = dto.website;
        if (dto.contactName !== undefined) updatedOrg.contactName = dto.contactName;
        if (dto.status !== undefined) updatedOrg.status = dto.status;
        
        if (dto.municipality !== undefined) {
          updatedOrg.municipality = { ...o.municipality, nombre: dto.municipality };
        }
        if (dto.region !== undefined) {
          updatedOrg.region = { ...o.region, nombre: dto.region };
        }
        if (dto.municipalityId !== undefined) {
          updatedOrg.municipality = { ...o.municipality, id: dto.municipalityId };
        }
        if (dto.regionId !== undefined) {
          updatedOrg.region = { ...o.region, id: dto.regionId };
        }
        
        return updatedOrg;
      }
      return o;
    }));

    if (!updatedOrg) {
      return throwError(() => new Error('Organization not found'));
    }
    
    return of(updatedOrg).pipe(delay(500));
  }

  resetOrganizationPassword(email: string): Observable<boolean> {
    return this.authService.recoverPassword(email);
  }

  resetUserPassword(email: string): Observable<boolean> {
    return this.authService.recoverPassword(email);
  }

  private getRandomAvatarColor(): string {
    const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-yellow-500', 'bg-red-500', 'bg-indigo-500', 'bg-pink-500'];
    return colors[Math.floor(Math.random() * colors.length)];
  }
}

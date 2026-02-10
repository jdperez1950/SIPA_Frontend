import { Injectable, signal, inject } from '@angular/core';
import { Observable, of, delay, tap, catchError, map } from 'rxjs';
import { User, Project, Organization, CreateUserDTO, UpdateUserDTO, CreateProjectDTO, PaginatedResponse, CreateOrganizationDTO, CreateProjectRequest } from '../../../core/models/domain.models';
import { USERS_MOCK } from '../../../core/data/mock/users.mock';
import { PROJECTS_MOCK } from '../../../core/data/mock/projects.mock';
import { ORGANIZATIONS_MOCK } from '../../../core/data/mock/organizations.mock';
import { AuthService } from '../../../core/auth/services/auth.service';
import { RegisterRequest } from '../../../core/auth/models/auth.models';

@Injectable({
  providedIn: 'root'
})
export class AdminDataService {
  private authService = inject(AuthService);
  // State Signals (acting as cache/store)
  private users = signal<User[]>(USERS_MOCK);
  private projects = signal<Project[]>(PROJECTS_MOCK);
  private organizations = signal<Organization[]>(ORGANIZATIONS_MOCK);

  constructor() {}

  // --- Users Methods ---

  getUsers(page: number = 1, pageSize: number = 10, query: string = '', role: string | null = null, status: string | null = null): Observable<PaginatedResponse<User>> {
    let params: any = {
      page: page,
      limit: pageSize
    };

    if (query) params.search = query;
    if (role) params.role = role;
    if (status) params.status = status;

    return this.authService.getUsers(params).pipe(
      map(response => {
        if (response.success && response.data) {
          return {
            data: response.data.data,
            meta: {
              totalItems: response.data.total,
              itemCount: response.data.data.length,
              itemsPerPage: response.data.limit,
              totalPages: response.data.totalPages,
              currentPage: response.data.page
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
        console.error('Error fetching users', error);
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
      password: 'Password123!', // Default password for new users created by Admin
      role: dto.role
    };

    return this.authService.register(registerData).pipe(
      tap(newUser => {
        this.users.update(current => [...current, newUser]);
      })
    );
  }

  updateUser(dto: UpdateUserDTO): Observable<User> {
    let updatedUser: User | undefined;
    
    this.users.update(current => current.map(u => {
      if (u.id === dto.id) {
        updatedUser = { ...u, ...dto };
        return updatedUser;
      }
      return u;
    }));

    if (!updatedUser) throw new Error('User not found');
    return of(updatedUser).pipe(delay(500));
  }

  toggleUserStatus(id: string): Observable<User> {
    let updatedUser: User | undefined;
    
    this.users.update(current => current.map(u => {
      if (u.id === id) {
        updatedUser = { ...u, status: u.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' };
        return updatedUser;
      }
      return u;
    }));

    if (!updatedUser) throw new Error('User not found');
    return of(updatedUser).pipe(delay(300));
  }

  getAdvisors(): Observable<User[]> {
    return of(this.users().filter(u => u.role === 'ASESOR')).pipe(delay(300));
  }
  
  // New methods for Project Wizard
  getProjects(page: number = 1, pageSize: number = 10, query: string = '', status: any = null): Observable<PaginatedResponse<Project>> {
    let data = this.projects();
    if (query) {
      const q = query.toLowerCase();
      data = data.filter(p => p.code.toLowerCase().includes(q) || p.municipality.toLowerCase().includes(q));
    }
    if (status) {
      data = data.filter(p => p.status === status);
    }
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

  createProject(request: CreateProjectRequest): Observable<Project> {
    console.log('Creating Project V2:', request);

    // Map Request to existing Project Model (Mock)
    const newProject: Project = {
      id: Math.random().toString(36).substr(2, 9),
      code: `PROJ-${Math.floor(Math.random() * 10000)}`, // Generate Code
      organization: request.organization.name,
      municipality: request.municipality,
      state: request.department,
      status: 'ACTIVE',
      viabilityStatus: 'PRE_HABILITADO' as any,
      progress: {
        technical: 0,
        legal: 0,
        financial: 0,
        social: 0
      },
      startDate: request.dates.start,
      endDate: request.dates.end,
      submissionDeadline: request.dates.submissionDeadline
    };

    this.projects.update(current => [newProject, ...current]);
    return of(newProject).pipe(delay(1000));
  }

  assignAdvisor(projectId: string, advisor: { id: string; name: string }): Observable<Project> {
    let updatedProject: Project | undefined;
    this.projects.update(current => current.map(p => {
      if (p.id === projectId) {
        updatedProject = { ...p, advisor };
        return updatedProject;
      }
      return p;
    }));
    if (!updatedProject) throw new Error('Project not found');
    return of(updatedProject).pipe(delay(500));
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
      ...dto,
      userId: 'temp-user-id' // Mock linked user
    };

    // console.log('Uploading file:', file.name, 'Size:', file.size); // REMOVED FOR SECURITY (A02)
    
    this.organizations.update(current => [newOrg, ...current]);
    return of(newOrg).pipe(delay(1500)); // Simulate upload delay
  }

  updateOrganization(id: string, dto: Partial<CreateOrganizationDTO>): Observable<Organization> {
    let updatedOrg: Organization | undefined;
    
    this.organizations.update(current => current.map(o => {
      if (o.id === id) {
        updatedOrg = { ...o, ...dto };
        return updatedOrg;
      }
      return o;
    }));

    if (!updatedOrg) throw new Error('Organization not found');
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

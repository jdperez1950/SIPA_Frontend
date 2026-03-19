import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, tap, catchError, map, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Project, PaginatedResponse, ApiResponse, AdvisorAxisAssignment } from '../models/domain.models';

@Injectable({
  providedIn: 'root'
})
export class ProjectsService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  private mapProjectFromBackend(backendProject: any): Project {
    console.log('[ProjectsService] Mapping project:', backendProject.id, backendProject.code);
    const mapped = {
      id: backendProject.id,
      code: backendProject.code,
      organizationId: backendProject.organizationId,
      name: backendProject.name,
      description: backendProject.description,
      organization: backendProject.organization || 'Sin organización',
      organizationName: backendProject.organization?.name || backendProject.organization || 'Sin organización',
      municipality: backendProject.organization?.municipality?.nombre || backendProject.municipality || '',
      state: backendProject.organization?.region?.nombre || backendProject.state || '',
      status: backendProject.status || 'ACTIVE',
      viabilityStatus: backendProject.viabilityStatus,
      advisor: backendProject.advisor,
      progress: backendProject.progress || {
        technical: 0,
        legal: 0,
        financial: 0,
        social: 0
      },
      startDate: backendProject.startDate,
      endDate: backendProject.endDate,
      submissionDeadline: backendProject.submissionDeadline,
      correctionDeadline: backendProject.correctionDeadline,
      responseTeam: backendProject.responseTeam,
      housingCount: backendProject.housingCount,
      beneficiariesCount: backendProject.beneficiariesCount,
      projectValue: backendProject.projectValue,
      tieneTerreno: backendProject.tieneTerreno,
      landDescription: backendProject.landDescription,
      tieneFinanciacion: backendProject.tieneFinanciacion,
      financingDescription: backendProject.financingDescription,
      detalleFinanciacion: backendProject.detalleFinanciacion,
      responsible: backendProject.responsible
    };
    console.log('[ProjectsService] Mapped project:', mapped.id, mapped.code, mapped.organizationName);
    return mapped;
  }

  getProjects(
    page: number = 1,
    pageSize: number = 25,
    search: string = '',
    status?: string,
    viabilityStatus?: string
  ): Observable<PaginatedResponse<Project>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', pageSize.toString());

    if (search) params = params.set('search', search);
    if (status) params = params.set('status', status);
    if (viabilityStatus) params = params.set('viabilityStatus', viabilityStatus);

    return this.http.get<any>(`${this.apiUrl}/projects`, { params }).pipe(
      map(response => {
        console.log('Full response structure from /api/projects:', JSON.stringify(response, null, 2));
        
        if (response.success && response.data) {
          const apiResponse = response.data;
          console.log('apiResponse.data:', apiResponse.data);
          console.log('apiResponse.total:', apiResponse.total);
          
          const projects = (apiResponse.data || []).map(this.mapProjectFromBackend.bind(this));
          
          return {
            data: projects,
            meta: {
              totalItems: apiResponse.total || 0,
              itemCount: projects.length,
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
        console.error('Error fetching projects', error);
        return throwError(() => error);
      })
    );
  }

  getProjectById(id: string): Observable<ApiResponse<Project>> {
    return this.http.get<ApiResponse<Project>>(`${this.apiUrl}/projects/${id}`).pipe(
      catchError(error => {
        return throwError(() => error);
      })
    );
  }

  getProjectTeam(projectId: string): Observable<any> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/projects/${projectId}/team`).pipe(
      map(response => response.data),
      catchError(error => {
        console.error('Error fetching project team', error);
        return throwError(() => error);
      })
    );
  }

  getProjectAdviser(projectId: string): Observable<AdvisorAxisAssignment[]> {
    return this.http.get<any>(`${this.apiUrl}/projects/${projectId}/adviser`).pipe(
      map(response => {
        if (Array.isArray(response)) {
          return response as AdvisorAxisAssignment[];
        }
        if (response && Array.isArray(response.data)) {
          return response.data as AdvisorAxisAssignment[];
        }
        return [];
      }),
      catchError(error => {
        console.error('Error fetching project adviser', error);
        return throwError(() => error);
      })
    );
  }
}

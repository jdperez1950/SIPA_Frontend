import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, tap, catchError, map, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Project, PaginatedResponse, ApiResponse } from '../models/domain.models';

@Injectable({
  providedIn: 'root'
})
export class ProjectsService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  getProjects(
    page: number = 1,
    pageSize: number = 10,
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
          
          // Mock progress values to 0% to avoid errors
          const projects = (apiResponse.data || []).map((project: any) => ({
            ...project,
            progress: project.progress || {
              technical: 0,
              legal: 0,
              financial: 0,
              social: 0
            }
          }));
          
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

  getProjectById(id: string): Observable<Project> {
    return this.http.get<ApiResponse<Project>>(`${this.apiUrl}/projects/${id}`).pipe(
      map(response => response.data),
      catchError(error => {
        console.error('Error fetching project', error);
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
}

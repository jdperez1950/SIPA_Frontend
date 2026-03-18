import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { IndicatorsResponse, IndicatorsQueryParams } from '../models/indicators.models';

@Injectable({
  providedIn: 'root'
})
export class IndicatorsService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  getIndicators(params?: IndicatorsQueryParams): Observable<IndicatorsResponse> {
    const httpParams = this.buildParams(params);
    return this.http.get<IndicatorsResponse>(`${this.apiUrl}/projects/indicators`, { params: httpParams })
      .pipe(
        catchError(error => {
          console.error('Error fetching indicators:', error);
          return throwError(() => error);
        })
      );
  }

  private buildParams(params?: IndicatorsQueryParams): HttpParams {
    if (!params) return new HttpParams();
    
    let httpParams = new HttpParams();
    if (params.callId) httpParams = httpParams.set('callId', params.callId);
    if (params.projectId) httpParams = httpParams.set('projectId', params.projectId);
    if (params.axisId) httpParams = httpParams.set('axisId', params.axisId);
    
    return httpParams;
  }
}

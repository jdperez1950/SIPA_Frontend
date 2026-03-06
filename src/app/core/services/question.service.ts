import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ResourceIdResponse {
  id: string;
}

@Injectable({
  providedIn: 'root'
})
export class QuestionService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/question`;

  getQuestionsByProject(projectId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${projectId}/with-answer`);
  }

  saveAnswer(answer: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/answers`, answer);
  }
}

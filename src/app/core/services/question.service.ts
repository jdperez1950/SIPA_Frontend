import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/domain.models';
import {
  AnswerRequestBackend,
  EvidenceResponseBackend,
  EvidenceUploadRequest,
  SaveAnswerRequest
} from '../models/question-backend.models';

export interface ResourceIdResponse {
  id: string;
}

@Injectable({
  providedIn: 'root'
})
export class QuestionService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/question`;

  getQuestionsByProject(projectId: string): Observable<ApiResponse<AnswerRequestBackend[]>> {
    return this.http.get<ApiResponse<AnswerRequestBackend[]>>(`${this.apiUrl}/${projectId}/with-answer`);
  }

  saveAnswer(answer: SaveAnswerRequest): Observable<ApiResponse<ResourceIdResponse>> {
    return this.http.post<ApiResponse<ResourceIdResponse>>(`${this.apiUrl}/answers`, answer);
  }

  uploadEvidence(answerId: string, request: EvidenceUploadRequest): Observable<ApiResponse<EvidenceResponseBackend>> {
    const formData = new FormData();
    formData.append('file', request.file);
    if (request.description) {
      formData.append('description', request.description);
    }
    if (request.documentTypeId) {
      formData.append('documentTypeId', request.documentTypeId);
    }

    return this.http.post<ApiResponse<EvidenceResponseBackend>>(
      `${this.apiUrl}/answers/${answerId}/evidence`,
      formData
    );
  }

  getAnswerEvidences(answerId: string): Observable<ApiResponse<EvidenceResponseBackend[]>> {
    return this.http.get<ApiResponse<EvidenceResponseBackend[]>>(`${this.apiUrl}/answers/${answerId}/evidence`);
  }

  deleteEvidence(evidenceId: string): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(`${this.apiUrl}/evidence/${evidenceId}`);
  }
}

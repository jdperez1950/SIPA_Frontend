import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface FileUploadResponse {
  fileId: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class FileService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/files`;

  uploadFile(file: File, relativePath?: string): Observable<FileUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    
    let url = `${this.apiUrl}/upload`;
    if (relativePath) {
      url += `?relativePath=${encodeURIComponent(relativePath)}`;
    }
    
    return this.http.post<FileUploadResponse>(url, formData);
  }

  deleteTempFile(fileId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/temp/${fileId}`);
  }

  downloadFile(fileId: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${fileId}`, { responseType: 'blob' });
  }

  getFileUrl(fileId: string): string {
    return `${this.apiUrl}/${fileId}/url`;
  }
}

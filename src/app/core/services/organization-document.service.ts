import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface FileUploadResponse {
  fileId: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  uploadedAt: string;
}

export interface OrganizationDocumentDTO {
  id: string;
  organizationId: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  description: string;
  uploadedAt: string;
  documentType: {
    id: string;
    name: string;
    helpInstruction: string;
  };
}

export interface DocumentUploadData {
  file: File;
  documentTypeId: string;
  description?: string;
}

@Injectable({
  providedIn: 'root'
})
export class OrganizationDocumentService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  /**
   * Subir documento a organización
   * @param organizationId ID de la organización
   * @param file Archivo a subir
   * @param documentTypeId ID del tipo de documento
   * @param description Descripción opcional
   */
  uploadDocument(
    organizationId: string,
    file: File,
    documentTypeId: string,
    description?: string
  ): Observable<FileUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('documentTypeId', documentTypeId);

    if (description) {
      formData.append('description', description);
    }

    return this.http.post<{
      success: boolean;
      data: FileUploadResponse;
    }>(
      `${this.apiUrl}/organizationdocuments/${organizationId}`,
      formData
    ).pipe(
      map(response => response.data)
    );
  }

  /**
   * Subir múltiples documentos a organización
   */
  uploadMultipleDocuments(
    organizationId: string,
    documents: DocumentUploadData[]
  ): Observable<FileUploadResponse[]> {
    const formData = new FormData();

    documents.forEach((doc, index) => {
      formData.append(`documents[${index}].file`, doc.file);
      formData.append(`documents[${index}].documentTypeId`, doc.documentTypeId);
      if (doc.description) {
        formData.append(`documents[${index}].description`, doc.description);
      }
    });

    return this.http.post<{
      success: boolean;
      data: FileUploadResponse[];
    }>(
      `${this.apiUrl}/organizationdocuments/${organizationId}/multiple`,
      formData
    ).pipe(
      map(response => response.data)
    );
  }

  /**
   * Obtener todos los documentos de una organización
   */
  getDocuments(organizationId: string): Observable<OrganizationDocumentDTO[]> {
    return this.http.get<{
      success: boolean;
      data: OrganizationDocumentDTO[];
    }>(
      `${this.apiUrl}/organizationdocuments/${organizationId}`
    ).pipe(
      map(response => response.data)
    );
  }

  /**
   * Descargar documento
   */
  downloadDocument(organizationId: string, documentId: string): Observable<Blob> {
    return this.http.get(
      `${this.apiUrl}/organizationdocuments/${organizationId}/download/${documentId}`,
      { responseType: 'blob' }
    );
  }

  /**
   * Eliminar documento
   */
  deleteDocument(organizationId: string, documentId: string): Observable<{
    success: boolean;
    message: string;
  }> {
    return this.http.delete<{
      success: boolean;
      message: string;
    }>(
      `${this.apiUrl}/organizationdocuments/${organizationId}/documents/${documentId}`
    ).pipe(
      map(response => response)
    );
  }
}

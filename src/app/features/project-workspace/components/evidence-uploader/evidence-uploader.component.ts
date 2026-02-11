import { Component, input, output, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EvidenceConfig } from '../../../../core/models/question.models';
import { ConfirmationService } from '../../../../core/services/confirmation.service';

@Component({
  selector: 'app-evidence-uploader',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:bg-gray-50 transition-colors cursor-pointer relative focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200"
         (dragover)="onDragOver($event)"
         (dragleave)="onDragLeave($event)"
         (drop)="onDrop($event)"
         [class.border-blue-500]="isDragging()"
         [class.bg-blue-50]="isDragging()"
         role="button"
         tabindex="0"
         aria-label="Zona de carga de archivos"
         (keydown.enter)="fileInput.click()"
         (keydown.space)="fileInput.click()"
    >
       <input 
         #fileInput
         type="file" 
         class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
         [accept]="config()?.allowedFormats?.join(',') || '.pdf'"
         (change)="onFileSelected($event)"
         aria-label="Seleccionar archivo para cargar"
         tabindex="-1"
       >
       
       <div class="flex flex-col items-center gap-3" aria-hidden="true">
          <div class="p-3 bg-blue-100 text-blue-600 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          <div>
            <p class="text-sm font-medium text-gray-700">
              <span class="text-blue-600">Haga clic para cargar</span> o arrastre y suelte
            </p>
            <p class="text-xs text-gray-500 mt-1">
              {{ config()?.allowedFormats?.join(', ') || 'PDF' }} (Máx. {{ config()?.maxSizeMb || 10 }}MB)
            </p>
          </div>
       </div>
    </div>
  `
})
export class EvidenceUploaderComponent {
  config = input<EvidenceConfig | undefined>(undefined);
  upload = output<File>();
  
  private confirmationService = inject(ConfirmationService);
  isDragging = signal(false);

  onDragOver(e: Event) {
    e.preventDefault();
    this.isDragging.set(true);
  }

  onDragLeave(e: Event) {
    e.preventDefault();
    this.isDragging.set(false);
  }

  onDrop(e: DragEvent) {
    e.preventDefault();
    this.isDragging.set(false);
    if (e.dataTransfer?.files.length) {
      this.handleFile(e.dataTransfer.files[0]);
    }
  }

  onFileSelected(e: Event) {
    const input = e.target as HTMLInputElement;
    if (input.files?.length) {
      this.handleFile(input.files[0]);
    }
  }

  handleFile(file: File) {
    const cfg = this.config();
    if (cfg && file.size > cfg.maxSizeMb * 1024 * 1024) {
      this.confirmationService.alert({
        title: 'Archivo Demasiado Grande',
        message: `El archivo excede el tamaño máximo de ${cfg.maxSizeMb}MB`,
        type: 'warning'
      });
      return;
    }
    this.upload.emit(file);
  }
}

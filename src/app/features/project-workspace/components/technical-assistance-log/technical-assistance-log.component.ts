import { Component, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { AssistanceLogEntry } from '../../../../core/models/question.models';

@Component({
  selector: 'app-technical-assistance-log',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm mt-8">
      <div class="px-4 py-3 bg-white border-b border-gray-200">
        <h3 class="text-lg font-medium text-sky-500">Bitácora de Asistencia Técnica</h3>
      </div>

      @if (entries().length === 0) {
        <div class="p-8 text-center text-gray-500 italic bg-gray-50">
          No hay registros de asistencia técnica para esta pregunta.
        </div>
      } @else {
        <div class="overflow-x-auto max-h-[600px] overflow-y-auto">
          <table class="w-full text-sm text-left">
            <thead class="text-xs text-white uppercase bg-gray-400 sticky top-0 z-10">
              <tr>
                <th scope="col" class="px-4 py-3 w-[45%]">Asesor</th>
                <th scope="col" class="px-4 py-3 w-[45%] border-l border-gray-300">Responsable</th>
                <th scope="col" class="px-2 py-3 w-[10%] text-center border-l border-gray-300">Vigencia</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              @for (entry of entries(); track entry.id) {
                <tr class="bg-white hover:bg-gray-50">
                  <!-- Columna Asesor -->
                  <td class="px-4 py-4 align-top">
                    <div class="space-y-2">
                      <div class="flex items-center gap-2 flex-wrap">
                        @if (entry.priority !== 'NORMAL') {
                          <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
                            [ngClass]="{
                              'bg-red-100 text-red-800': entry.priority === 'URGENT',
                              'bg-blue-100 text-blue-800': entry.priority === 'IMPORTANT'
                            }">
                            <span class="w-2 h-2 mr-1 rounded-full" 
                              [ngClass]="{
                                'bg-red-500': entry.priority === 'URGENT',
                                'bg-blue-500': entry.priority === 'IMPORTANT'
                              }"></span>
                            {{ entry.priority === 'URGENT' ? 'URGENTE' : 'IMPORTANTE' }}
                          </span>
                        }
                        <span class="text-gray-500 text-xs">{{ entry.date | date:'dd/MM/yyyy' }}</span>
                        <span class="text-gray-400 text-xs font-mono">ID: {{ entry.advisorName }}</span>
                      </div>
                      <p class="text-gray-700 whitespace-pre-line">{{ entry.advisorMessage }}</p>
                    </div>
                  </td>

                  <!-- Columna Responsable -->
                  <td class="px-4 py-4 align-top border-l border-gray-200 bg-gray-50/30">
                    @if (entry.response) {
                      <!-- Respuesta existente -->
                      <div class="space-y-2">
                        <div class="flex items-center gap-2 text-xs text-gray-500">
                          <span class="font-medium text-gray-700">{{ entry.response.responderName }}</span>
                          <span>{{ entry.response.responseDate | date:'dd/MM/yyyy' }}</span>
                        </div>
                        <p class="text-gray-700 whitespace-pre-line">{{ entry.response.message }}</p>
                      </div>
                    } @else {
                      <!-- Formulario de respuesta -->
                      <div class="space-y-3">
                        <textarea 
                          [formControl]="getResponseControl(entry.id)"
                          class="w-full p-2 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-sky-500 focus:border-sky-500 resize-none bg-white"
                          rows="4"
                          placeholder="Responda aquí..."
                        ></textarea>
                        <button 
                          type="button"
                          (click)="submitResponse(entry.id)"
                          [disabled]="getResponseControl(entry.id).invalid"
                          class="w-full px-4 py-2 bg-gray-400 hover:bg-gray-500 text-white rounded text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Registrar Respuesta
                        </button>
                      </div>
                    }
                  </td>

                  <!-- Columna Vigencia -->
                  <td class="px-2 py-4 align-top border-l border-gray-200 text-center">
                    <div class="inline-flex items-center justify-center w-8 h-8 rounded bg-yellow-300 text-yellow-900 font-bold text-xs" title="Periodo Vigente">
                      {{ entry.validityPeriod }}
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </div>
  `,
  styles: []
})
export class TechnicalAssistanceLogComponent {
  entries = input<AssistanceLogEntry[]>([]);
  response = output<{ entryId: string, message: string }>();

  // Map to store form controls for each entry
  private responseControls = new Map<string, FormControl>();

  getResponseControl(entryId: string): FormControl {
    if (!this.responseControls.has(entryId)) {
      this.responseControls.set(entryId, new FormControl('', [Validators.required, Validators.minLength(5)]));
    }
    return this.responseControls.get(entryId)!;
  }

  submitResponse(entryId: string) {
    const control = this.getResponseControl(entryId);
    if (control.valid) {
      this.response.emit({
        entryId,
        message: control.value
      });
      control.reset(); // Optional: reset after emit, parent will likely update the entry
    }
  }
}

import { Component, output, signal, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-technical-assistance-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm mt-8">
      <div class="px-4 py-3 bg-white border-b border-gray-200">
        <h3 class="text-lg font-medium text-sky-500">Registro de Nota de Asistencia Técnica</h3>
      </div>
      
      <div class="p-6 bg-gray-50">
        <!-- Evaluación de Respuesta -->
        <div class="mb-6 pb-6 border-b border-gray-200">
          <div class="flex flex-col md:flex-row gap-4">
            <!-- Current Status Display -->
            <div class="flex-1">
              <label class="block text-sm font-medium text-gray-700 mb-2">Estado actual</label>
              <div class="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium"
                [ngClass]="{
                  'bg-green-100 text-green-800': currentStatus() === 'Validadas',
                  'bg-red-100 text-red-800': currentStatus() === 'Devueltas',
                  'bg-yellow-100 text-yellow-800': currentStatus() === 'Sin validar',
                  'bg-gray-100 text-gray-800': !currentStatus() || currentStatus() === 'Sin responder'
                }">
                {{ currentStatus() || 'Sin responder' }}
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex gap-3">
              <button 
                type="button"
                (click)="onValidate()"
                [disabled]="currentStatus() === 'Validadas'"
                class="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm flex items-center justify-center gap-2"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
                Validar respuesta
              </button>
              
              <button 
                type="button"
                (click)="onReturn()"
                [disabled]="currentStatus() === 'Devueltas'"
                class="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm flex items-center justify-center gap-2"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                </svg>
                Devolver para corrección
              </button>
            </div>
          </div>
        </div>

        <!-- Nota de Asistencia Técnica -->
        <div [formGroup]="form" class="flex flex-col gap-4">
          <div class="flex flex-col md:flex-row gap-6">
            <!-- Text Area -->
            <div class="flex-1">
              <textarea 
                formControlName="message"
                class="w-full p-4 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 resize-none bg-white h-32"
                placeholder="Aquí texto
Con límite de caracteres, también para las respuestas del responsable"
                maxlength="500"
              ></textarea>
              <div class="flex justify-between mt-1 text-xs text-gray-500">
                <span>{{ form.get('message')?.value?.length || 0 }}/500</span>
                @if (form.get('message')?.invalid && (form.get('message')?.dirty || form.get('message')?.touched)) {
                  <span class="text-red-500">El mensaje es requerido (min 10 caracteres)</span>
                }
              </div>
            </div>

            <!-- Priority & Action -->
            <div class="w-full md:w-64 flex flex-col gap-4">
              <!-- Priority Selector -->
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span class="w-4 h-4 rounded-full"
                    [ngClass]="{
                      'bg-green-500': form.get('priority')?.value === 'Importante',
                      'bg-orange-500': form.get('priority')?.value === 'Alerta',
                      'bg-red-500': form.get('priority')?.value === 'Urgente'
                    }"></span>
                </div>
                <select
                  formControlName="priority"
                  class="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 bg-white appearance-none cursor-pointer"
                >
                  <option value="Importante" class="text-green-600">Importante</option>
                  <option value="Alerta" class="text-orange-600">Alerta</option>
                  <option value="Urgente" class="text-red-600">Urgente</option>
                </select>
                <div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <svg class="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class TechnicalAssistanceRegisterComponent {
  register = output<{ state: 'Validadas' | 'Devueltas', message: string, priority: string, observation?: string }>();
  currentStatus = input<string | null>(null);
  isSubmitting = signal(false);

  form = new FormGroup({
    message: new FormControl('', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]),
    priority: new FormControl('Importante', [Validators.required])
  });

  onValidate() {
    if (this.form.get('message')?.valid) {
      const value = this.form.value;
      this.register.emit({
        state: 'Validadas',
        message: value.message!,
        priority: value.priority!
      });
      this.form.reset({ priority: 'Importante' });
    } else {
      this.form.get('message')?.markAsTouched();
    }
  }

  onReturn() {
    if (this.form.get('message')?.valid) {
      this.isSubmitting.set(true);
      const value = this.form.value;
      this.register.emit({
        state: 'Devueltas',
        message: value.message!,
        priority: value.priority!,
        observation: value.message || undefined
      });
      
      setTimeout(() => {
        this.isSubmitting.set(false);
        this.form.reset({ priority: 'Importante' });
      }, 500);
    } else {
      this.form.get('message')?.markAsTouched();
    }
  }
}

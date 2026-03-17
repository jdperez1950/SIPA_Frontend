import { Component, output, signal } from '@angular/core';
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
        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="flex flex-col gap-4">
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
                      'bg-green-500': form.get('priority')?.value === 'NORMAL',
                      'bg-orange-500': form.get('priority')?.value === 'IMPORTANT',
                      'bg-red-500': form.get('priority')?.value === 'URGENT'
                    }"></span>
                </div>
                <select 
                  formControlName="priority"
                  class="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 bg-white appearance-none cursor-pointer text-gray-600"
                >
                  <option value="NORMAL">Normal</option>
                  <option value="IMPORTANT">Importante</option>
                  <option value="URGENT">Urgente</option>
                </select>
                <div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <svg class="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
                  </svg>
                </div>
              </div>

              <!-- Submit Button -->
              <button 
                type="submit"
                [disabled]="form.invalid || isSubmitting()"
                class="w-full px-4 py-3 bg-gray-400 hover:bg-gray-500 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm flex justify-center items-center gap-2"
              >
                @if (isSubmitting()) {
                  <svg class="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                }
                Registrar nota de asistencia técnica
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: []
})
export class TechnicalAssistanceRegisterComponent {
  register = output<{ message: string, priority: string }>();
  isSubmitting = signal(false);

  form = new FormGroup({
    message: new FormControl('', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]),
    priority: new FormControl('NORMAL', [Validators.required])
  });

  onSubmit() {
    if (this.form.valid) {
      this.isSubmitting.set(true);
      const value = this.form.value;
      this.register.emit({
        message: value.message!,
        priority: value.priority!
      });
      
      // Reset form after emit
      setTimeout(() => {
        this.isSubmitting.set(false);
        this.form.reset({ priority: 'NORMAL' });
      }, 500);
    }
  }
}

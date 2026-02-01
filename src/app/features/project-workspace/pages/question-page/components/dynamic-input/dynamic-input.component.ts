import { Component, input, output, effect, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { QuestionDefinition } from '../../../../../../core/models/question.models';

@Component({
  selector: 'app-dynamic-input',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="w-full">
      @switch (question().controlType) {
        @case ('TEXT_AREA') {
          <textarea 
            [formControl]="control"
            class="w-full min-h-[120px] p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-y text-gray-700"
            placeholder="Escriba su respuesta aquí..."
          ></textarea>
        }
        @case ('SINGLE_SELECT') {
          <div class="space-y-3">
            @for (opt of question().options; track opt.value) {
              <label class="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors group"
                [class.border-blue-500]="control.value === opt.value"
                [class.bg-blue-50]="control.value === opt.value">
                <input 
                  type="radio" 
                  [formControl]="control" 
                  [value]="opt.value"
                  class="w-5 h-5 text-blue-600 border-gray-300 focus:ring-blue-500"
                >
                <span class="ml-3 text-gray-700 font-medium group-hover:text-gray-900">{{ opt.label }}</span>
              </label>
            }
          </div>
        }
        @case ('DATE') {
           <input 
             type="date" 
             [formControl]="control"
             class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
           >
        }
      }
    </div>
  `
})
export class DynamicInputComponent {
  question = input.required<QuestionDefinition>();
  initialValue = input<any>(null);
  valueChange = output<any>();

  control = new FormControl<any>(null);

  constructor() {
    effect(() => {
      const val = this.initialValue();
      if (val !== null && val !== undefined) {
        this.control.setValue(val, { emitEvent: false });
      }
    });

    this.control.valueChanges.subscribe(val => {
      this.valueChange.emit(val);
    });
  }

  isChecked(value: any): boolean {
    const current = this.control.value;
    return Array.isArray(current) && current.includes(value);
  }

  onCheckboxChange(event: Event, value: any) {
    const input = event.target as HTMLInputElement;
    const current = (Array.isArray(this.control.value) ? this.control.value : []) as any[];
    let newValue;
    
    if (input.checked) {
      newValue = [...current, value];
    } else {
      newValue = current.filter(v => v !== value);
    }
    
    this.control.setValue(newValue);
  }
}

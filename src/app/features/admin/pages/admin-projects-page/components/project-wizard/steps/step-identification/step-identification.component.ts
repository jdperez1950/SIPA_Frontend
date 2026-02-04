import { Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { IdentificationData } from '../../project-wizard.types';

@Component({
  selector: 'app-step-identification',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './step-identification.component.html',
  styles: []
})
export class StepIdentificationComponent implements OnInit {
  @Input() initialData: IdentificationData | null = null;
  @Output() dataChange = new EventEmitter<IdentificationData>();

  private fb = inject(FormBuilder);

  form!: FormGroup;
  
  // Mock locations (Should ideally come from a service)
  departments = ['Cundinamarca', 'Antioquia', 'Valle del Cauca', 'Atlántico', 'Santander'];
  municipalities: Record<string, string[]> = {
    'Cundinamarca': ['Bogotá', 'Soacha', 'Zipaquirá', 'Chía'],
    'Antioquia': ['Medellín', 'Bello', 'Envigado', 'Itagüí'],
    'Valle del Cauca': ['Cali', 'Palmira', 'Buenaventura', 'Tuluá'],
    'Atlántico': ['Barranquilla', 'Soledad', 'Malambo'],
    'Santander': ['Bucaramanga', 'Floridablanca', 'Girón']
  };

  ngOnInit() {
    this.initForm();
    
    // Emit changes to parent
    this.form.valueChanges.subscribe(value => {
      if (this.form.valid) {
        this.dataChange.emit({
          projectName: value.projectName,
          department: value.department,
          municipality: value.municipality,
          organizationName: value.organizationName,
          organizationDescription: value.organizationDescription,
          organizationIdentifier: value.organizationIdentifier,
          organizationAddress: value.organizationAddress,
          startDate: value.startDate,
          endDate: value.endDate,
          submissionDeadline: value.submissionDeadline
        });
      } else {
        // Can emit null or invalid state if parent handles it
      }
    });
  }

  private initForm() {
    this.form = this.fb.group({
      projectName: [this.initialData?.projectName || '', [Validators.required, Validators.minLength(5)]],
      department: [this.initialData?.department || '', Validators.required],
      municipality: [this.initialData?.municipality || '', Validators.required],
      organizationName: [this.initialData?.organizationName || '', [Validators.required, Validators.minLength(3)]],
      organizationDescription: [this.initialData?.organizationDescription || '', [Validators.required, Validators.minLength(10)]],
      organizationIdentifier: [this.initialData?.organizationIdentifier || '', Validators.required],
      organizationAddress: [this.initialData?.organizationAddress || '', Validators.required],
      startDate: [this.initialData?.startDate || '', Validators.required],
      endDate: [this.initialData?.endDate || '', Validators.required],
      submissionDeadline: [this.initialData?.submissionDeadline || '', Validators.required]
    }, { validators: [this.dateRangeValidator] });

    // Reset municipality when department changes
    this.form.get('department')?.valueChanges.subscribe(() => {
      this.form.get('municipality')?.setValue('');
    });
  }

  private dateRangeValidator(group: FormGroup) {
    const start = group.get('startDate')?.value;
    const end = group.get('endDate')?.value;
    const deadline = group.get('submissionDeadline')?.value;

    if (!start || !end || !deadline) return null;

    const startDate = new Date(start);
    const endDate = new Date(end);
    const deadlineDate = new Date(deadline);

    const errors: any = {};

    if (endDate < startDate) {
      errors.endDateInvalid = true;
    }

    if (deadlineDate < startDate || deadlineDate > endDate) {
      errors.deadlineInvalid = true;
    }

    return Object.keys(errors).length > 0 ? errors : null;
  }

  // Helper for template
  get availableMunicipalities(): string[] {
    const dept = this.form.get('department')?.value;
    return dept ? this.municipalities[dept] || [] : [];
  }
}

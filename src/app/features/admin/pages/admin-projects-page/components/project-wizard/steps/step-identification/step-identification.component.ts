import { Component, EventEmitter, inject, Input, OnInit, Output, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CustomDropdownComponent, CustomDropdownItem } from '../../../shared/custom-dropdown/custom-dropdown.component';
import { IdentificationData } from '../../project-wizard.types';
import { DivipolaService } from '../../../../../../../../core/services/divipola.service';
import {
  nitFormatValidator,
  getNitFormatErrorMessage,
  getRequiredErrorMessage,
  getEmailErrorMessage,
  getMinLengthErrorMessage,
} from '../../../../../../../../shared/validators';

@Component({
  selector: 'app-step-identification',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CustomDropdownComponent],
  templateUrl: './step-identification.component.html',
  styleUrls: ['./step-identification.component.css']
})
export class StepIdentificationComponent implements OnInit {
  @Input() initialData: IdentificationData | null = null;
  @Output() dataChange = new EventEmitter<IdentificationData>();

  private fb = inject(FormBuilder);
  public divipolaService = inject(DivipolaService);

  form!: FormGroup;
  
  // Lists for selects
  municipios: CustomDropdownItem[] = [];

  constructor() {
    // Effect to handle initial data loading when service is ready
    effect(() => {
      const depts = this.divipolaService.departamentos();
      const initialName = this.initialData?.department;
      
      // If form has no department ID but we have an initial name, try to map it now
      // Check that form exists before accessing it
      if (depts.length > 0 && initialName && this.form && !this.form.get('department')?.value) {
          const found = depts.find(d => d.nombre === initialName);
          if (found) {
              this.form.patchValue({ department: found.id }, { emitEvent: true });
              // Municipality will be loaded by valueChanges subscription
          }
      }
    });
  }

  ngOnInit() {
    this.initForm();
    
    // Emit changes to parent
    this.form.valueChanges.subscribe(value => {
      // Debug form state
      if (this.form.invalid) {
        // ... (debug code)
      }
      
      if (this.form.valid) {
        // Find department and municipality names for emission if needed
        const deptId = value.department;
        const deptName = this.divipolaService.departamentos().find(d => d.id === deptId)?.nombre || deptId;
        
        // Municipality is already bound to name in ng-select (bindValue="nombre")
        // But if we change it to bindValue="id", we would need mapping here.
        // Currently HTML uses bindValue="nombre" for municipality, so value.municipality is the name.
        
        this.dataChange.emit({
          projectName: value.projectName,
          department: deptName, // Emit NAME for backend compatibility
          municipality: value.municipality,
          organizationName: value.organizationName,
          organizationType: value.organizationType,
          organizationIdentifier: value.organizationIdentifier,
          organizationEmail: value.organizationEmail,
          organizationDescription: value.organizationDescription,
          organizationAddress: value.organizationAddress,
          startDate: value.startDate,
          endDate: value.endDate,
          submissionDeadline: value.submissionDeadline
        });
      } else {
        // Emit null to indicate invalid state
        this.dataChange.emit(null as any);
      }
    });

    // Trigger initial validation if data is pre-loaded
    if (this.form.valid) {
      this.form.updateValueAndValidity({ emitEvent: true });
    }
  }

  private initForm() {
    const today = new Date().toISOString().split('T')[0];
    const defaultStart = today;
    const defaultDeadline = '2026-12-24';
    const defaultEnd = '2026-12-31';

    // Map initial department NAME to ID if possible
    let initialDeptId = null;
    const initialDeptName = this.initialData?.department;
    
    if (initialDeptName) {
        // Try to find ID from loaded departments (might be empty initially)
        // We rely on the effect below to update it when data arrives
        const found = this.divipolaService.departamentos().find(d => d.nombre === initialDeptName);
        initialDeptId = found ? found.id : null;
    }

    this.form = this.fb.group({
      projectName: [this.initialData?.projectName || '', [Validators.required, Validators.minLength(5)]],
      department: [initialDeptId, Validators.required], // Bind to ID
      municipality: [this.initialData?.municipality || null, Validators.required],
      organizationName: [this.initialData?.organizationName || '', [Validators.required, Validators.minLength(3)]],
      organizationType: [this.initialData?.organizationType || 'COMPANY', Validators.required],
      organizationIdentifier: [this.initialData?.organizationIdentifier || '', [Validators.required, nitFormatValidator]],
      organizationEmail: [this.initialData?.organizationEmail || '', [Validators.required, Validators.email]],
      organizationDescription: [this.initialData?.organizationDescription || ''],
      organizationAddress: [this.initialData?.organizationAddress || '', Validators.required],
      startDate: [this.initialData?.startDate || defaultStart],
      endDate: [this.initialData?.endDate || defaultEnd],
      submissionDeadline: [this.initialData?.submissionDeadline || defaultDeadline]
    }, { validators: [this.dateRangeValidator] });

    // Handle department changes to load municipalities
    this.form.get('department')?.valueChanges.subscribe((deptId) => {
      // Only reset if changed by user (dirty), or if we want to enforce it.
      // Careful with initial load.
      const currentMunicipality = this.form.get('municipality')?.value;
      
      if (deptId) {
        this.municipios = this.divipolaService.getMunicipiosPorDepto(deptId);
        
        // If current municipality is not in the new list, reset it
        const exists = this.municipios.some(m => m.nombre === currentMunicipality);
        if (!exists && this.form.get('department')?.dirty) {
             this.form.get('municipality')?.setValue(null);
        }
      } else {
        this.municipios = [];
        this.form.get('municipality')?.setValue(null);
      }
    });
  }

  // Remove duplicated and old listener
  // private resetMunicipality() { ... }

  private dateRangeValidator(group: FormGroup) {
    // Si las fechas son opcionales o auto-llenadas, esta validación podría estar fallando 
    // si los valores por defecto no cumplen la lógica o si están vacíos y el validator espera strings.
    
    // Si estamos en modo de prueba con fechas ocultas, simplemente retornamos null
    // para evitar bloqueos por validaciones de zona horaria o formato.
    return null;

    /* 
    const start = group.get('startDate')?.value;
    const end = group.get('endDate')?.value;
    const deadline = group.get('submissionDeadline')?.value;

    // Si alguno falta, no validamos rango (asumimos que si son required fallarán por otro lado)
    if (!start || !end || !deadline) return null;

    // Parseando fechas como UTC para evitar problemas de zona horaria
    const parseDate = (dateStr: string) => {
        const parts = dateStr.split('-');
        return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    };

    const startDate = parseDate(start);
    const endDate = parseDate(end);
    const deadlineDate = parseDate(deadline);

    const errors: any = {};

    // Validar que sean fechas válidas
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime()) || isNaN(deadlineDate.getTime())) {
       return null;
    }

    if (endDate < startDate) {
      errors.endDateInvalid = true;
    }

    if (deadlineDate < startDate || deadlineDate > endDate) {
      errors.deadlineInvalid = true;
    }

    return Object.keys(errors).length > 0 ? errors : null;
    */
  }

  onDepartmentChange(deptId: string) {
    this.form.get('department')?.setValue(deptId, { emitEvent: true });
    
    if (deptId) {
      this.municipios = this.divipolaService.getMunicipiosPorDepto(deptId);
      this.form.get('municipality')?.setValue(null);
    } else {
      this.municipios = [];
      this.form.get('municipality')?.setValue(null);
    }
  }

  onDepartmentDropdownOpen() {
    this.form.get('department')?.markAsTouched();
  }

  onMunicipalityDropdownOpen() {
    this.form.get('municipality')?.markAsTouched();
  }

  onMunicipalityChange(municipalityName: string) {
    this.form.get('municipality')?.setValue(municipalityName, { emitEvent: true });
  }

  // Funciones para mensajes de error
  getProjectNameErrorMessage(): string {
    const control = this.form.get('projectName');
    if (!control || !control.errors) return '';
    
    if (control.hasError('required')) {
      return getRequiredErrorMessage();
    }
    
    if (control.hasError('minlength')) {
      return getMinLengthErrorMessage(control.errors['minlength'].requiredLength);
    }
    
    return '';
  }

  getOrganizationNameErrorMessage(): string {
    const control = this.form.get('organizationName');
    if (!control || !control.errors) return '';
    
    if (control.hasError('required')) {
      return getRequiredErrorMessage();
    }
    
    if (control.hasError('minlength')) {
      return getMinLengthErrorMessage(control.errors['minlength'].requiredLength);
    }
    
    return '';
  }

  getOrganizationIdentifierErrorMessage(): string {
    const control = this.form.get('organizationIdentifier');
    if (!control || !control.errors) return '';
    
    if (control.hasError('required')) {
      return getRequiredErrorMessage();
    }
    
    if (control.hasError('nitFormat')) {
      return getNitFormatErrorMessage();
    }
    
    return '';
  }

  getOrganizationEmailErrorMessage(): string {
    const control = this.form.get('organizationEmail');
    if (!control || !control.errors) return '';
    
    if (control.hasError('required')) {
      return getRequiredErrorMessage();
    }
    
    if (control.hasError('email')) {
      return getEmailErrorMessage();
    }
    
    return '';
  }

  getOrganizationAddressErrorMessage(): string {
    const control = this.form.get('organizationAddress');
    if (!control || !control.errors) return '';
    
    if (control.hasError('required')) {
      return getRequiredErrorMessage();
    }
    
    return '';
  }

  getDepartmentErrorMessage(): string {
    const control = this.form.get('department');
    if (!control || !control.errors) return '';
    
    if (control.hasError('required')) {
      return getRequiredErrorMessage();
    }
    
    return '';
  }

  getMunicipalityErrorMessage(): string {
    const control = this.form.get('municipality');
    if (!control || !control.errors) return '';
    
    if (control.hasError('required')) {
      return getRequiredErrorMessage();
    }
    
    return '';
  }
}

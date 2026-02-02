import { Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { IdentificationData } from '../../project-wizard.types';
import { AdminDataService } from '../../../../../../services/admin-data.service';
import { Organization } from '../../../../../../../../core/models/domain.models';

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
  private adminDataService = inject(AdminDataService);

  form!: FormGroup;
  organizations: Organization[] = [];
  filteredOrganizations: Organization[] = [];
  isLoadingOrgs = false;

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
    this.loadOrganizations();
    
    // Emit changes to parent
    this.form.valueChanges.subscribe(value => {
      if (this.form.valid) {
        const selectedOrg = this.organizations.find(o => o.id === value.organizationId);
        
        this.dataChange.emit({
          projectName: value.projectName,
          department: value.department,
          municipality: value.municipality,
          organizationId: value.organizationId,
          organizationName: selectedOrg?.name || '',
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
      organizationId: [this.initialData?.organizationId || '', Validators.required],
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

  private loadOrganizations() {
    this.isLoadingOrgs = true;
    this.adminDataService.getAllOrganizations().subscribe({
      next: (orgs) => {
        this.organizations = orgs;
        this.filteredOrganizations = orgs; // Initialize with all
        this.isLoadingOrgs = false;
      },
      error: () => this.isLoadingOrgs = false
    });
  }

  // Helper for template
  get availableMunicipalities(): string[] {
    const dept = this.form.get('department')?.value;
    return dept ? this.municipalities[dept] || [] : [];
  }
}

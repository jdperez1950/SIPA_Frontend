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
          organizationName: selectedOrg?.name || ''
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
      organizationId: [this.initialData?.organizationId || '', Validators.required]
    });

    // Reset municipality when department changes
    this.form.get('department')?.valueChanges.subscribe(() => {
      // Only reset if it's a user change, not initial load. 
      // For simplicity, we might just accept it resets if they change dept manually.
      // But we need to handle the case where we just set the initial value.
      // The initial setValue above won't trigger this subscription yet because it's defined after.
      // Wait, setValue in group initialization sets the value.
      // The subscription is created AFTER, so it won't fire for the initial value.
      this.form.get('municipality')?.setValue('');
    });
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

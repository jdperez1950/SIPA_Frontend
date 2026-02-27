import { Component, computed, EventEmitter, Input, Output, signal, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StepIdentificationComponent } from './steps/step-identification/step-identification.component';
import { StepTechnicalTableComponent } from './steps/step-technical-table/step-technical-table.component';
import { StepResponseTeamComponent } from './steps/step-response-team/step-response-team.component';
import { AlertService } from '../../../../../../core/services/alert.service';
import { AdminDataService } from '../../../../services/admin-data.service';
import { ParametroBaseService } from '../../../../../../core/services/parametro-base.service';
import { CreateProjectRequest, Project, UpdateProjectRequest } from '../../../../../../core/models/domain.models';
import { 
  IdentificationData, 
  TechnicalTableAssignment, 
  ResponseTeamMember 
} from './project-wizard.types';
import { ModalAlertComponent, ModalAlertData } from '../../../../../../shared/components/modal-alert';

export type WizardMode = 'FULL' | 'IDENTIFICATION_ONLY';

@Component({
  selector: 'app-project-wizard',
  standalone: true,
  imports: [
    CommonModule, 
    StepIdentificationComponent,
    StepTechnicalTableComponent,
    StepResponseTeamComponent,
    ModalAlertComponent
  ],
  templateUrl: './project-wizard.component.html',
  styles: []
})
export class ProjectWizardComponent {
  @Input() mode: WizardMode = 'FULL';
  @Input() initialData: Project | null = null;
  @Output() completed = new EventEmitter<void>();
  
  private alertService = inject(AlertService);
  private adminService = inject(AdminDataService);
  private parametroBaseService = inject(ParametroBaseService);

  // --- Constants ---
  readonly ALL_STEPS = [
    { 
      number: 1, 
      title: 'Identificación', 
      icon: 'badge',
      description: 'Diligencie la información básica del proyecto: organización, fechas, ubicación y datos principales.'
    },
    { 
      number: 2, 
      title: 'Equipo Respuesta', 
      icon: 'group_add',
      description: 'Agrega los usuarios que formarán parte del equipo de respuesta para la organización, incluye la persona responsable de diligenciar el cuestionario de cumplimiento para la aplicación del proyecto.'
    },
    { 
      number: 3, 
      title: 'Mesa Técnica', 
      icon: 'engineering',
      description: 'Configure la mesa técnica y asigne los responsables para el seguimiento del proyecto.'
    }
  ];

  steps = computed(() => {
    if (this.mode === 'IDENTIFICATION_ONLY') {
      return [this.ALL_STEPS[0]];
    }
    return this.ALL_STEPS;
  });

  // --- State ---
  currentStep = signal(1);
  isSaving = signal(false);
  
  // Step 1 Data
  identificationData = signal<IdentificationData | null>(null);

  // Step 2 Data
  responseTeam = signal<ResponseTeamMember[]>([]);

  // Step 3 Data (Mesa Técnica)
  technicalTableAssignments = signal<TechnicalTableAssignment[]>([]);

  modalAlertData = signal<ModalAlertData | null>(null);

  constructor() {
    // Initialize with data if provided
    effect(() => {
      if (this.initialData) {
        this.loadInitialData(this.initialData);
      }
    });
  }

  loadInitialData(project: Project) {
    // Backend response structure:
    // project.name -> Nombre real del proyecto (Ej: "CosiPet")
    // project.code -> Código del proyecto (Ej: "PRJ-2026-0029")
    // project.organization -> Objeto completo con la info de la organización
    // project.organizationName -> Nombre de la organización (string)
    // project.responseTeam -> Array de miembros del equipo
    
    // Map Project to IdentificationData
    // The 'organization' field in the backend response is actually the full object, 
    // but our frontend interface definition might be typed as string | OrganizationData.
    // Let's handle it safely.
    
    const orgData = project.organizationData || (typeof project.organization === 'object' ? project.organization : null);
    
    // Helper to safely get string
    const safeStr = (val: any) => (val && typeof val === 'string') ? val : '';

    // Map organization type from code to GUID
    const orgTypeCode = orgData?.type;
    const orgType = orgTypeCode ? this.parametroBaseService.tiposOrganizacion().find((t: any) => t.codigo === orgTypeCode) : null;

    this.identificationData.set({
      description: '',
      projectBriefDescription: '',
      projectValue: 0,
      housingCount: 0,
      beneficiariesCount: 0,
      tieneTerreno: { id: '', nombre: '' },
      landDescription: '',
      tieneFinanciacion: { id: '', nombre: '' },
      financingDescription: '',
      departmentId: orgData?.regionId ? { id: orgData.regionId, nombre: project.state || orgData?.region || '' } : { id: '', nombre: '' },
      departmentName: project.state || orgData?.region || '',
      municipality: orgData?.municipality ? { id: orgData.municipality.id, nombre: project.municipality || orgData?.municipality.nombre || '' } : null,
      municipalityName: project.municipality || orgData?.municipality || '',
      
      organizationName: safeStr(project.organizationName) || orgData?.name || '',
      organizationType: orgType ? { id: orgType.id, nombre: orgType.nombre } : { id: '', nombre: '' },
      organizationIdentifier: orgData?.identifier || '',
      verificationDigit: orgData?.verificationDigit || '',
      organizationEmail: orgData?.email || '',
      website: orgData?.website || '',
      organizationDescription: orgData?.description || '',
      organizationAddress: orgData?.address || '',
      
      startDate: safeStr(project.startDate).split('T')[0],
      endDate: safeStr(project.endDate).split('T')[0],
      submissionDeadline: safeStr(project.submissionDeadline).split('T')[0]
    });

    // Load response team data
    if (project.responseTeam && project.responseTeam.length > 0) {
      this.responseTeam.set(project.responseTeam.map(m => ({
        userId: m.userId,
        name: m.name,
        documentType: m.documentType || { id: '', nombre: '' },
        documentNumber: m.documentNumber,
        email: m.email,
        phone: m.phone || '',
        nombre: m.nombre || m.name,
        profile: m.profile,
        representativeType: m.representativeType || { id: '', nombre: '' }
      })));
    }
  }

  // --- Computed Helpers ---
  
  // Validation for Current Step
  isCurrentStepValid = computed(() => {
    switch (this.currentStep()) {
      case 1:
        return !!this.identificationData();
      case 2:
        return this.responseTeam().length > 0;
      case 3:
        return true; // Mesa técnica es opcional
      default:
        return false;
    }
  });

  // --- Actions ---

  goToStep(step: number) {
    const maxStep = this.steps().length;
    if (step > maxStep) return;

    if (step < this.currentStep() || (step > this.currentStep() && this.isCurrentStepValid())) {
      if (step < this.currentStep()) {
        this.currentStep.set(step);
      }
    }
  }

  nextStep() {
    if (!this.isCurrentStepValid()) {
      this.alertService.error('Por favor complete todos los campos obligatorios del paso actual.');
      this.markStepAsTouched();
      return;
    }

    if (this.currentStep() === 1) {
      // If it's a new project, we don't save yet, just proceed to Step 2 to collect Team
      if (!this.initialData) {
        this.currentStep.update(s => s + 1);
      } else {
        // If editing existing project, save Step 1 changes
        this.saveStep1AndProceed();
      }
    } else if (this.currentStep() === 2) {
      // Proceed to Step 3 (Mesa Técnica)
      this.currentStep.update(s => s + 1);
    } else if (this.currentStep() === 3) {
      // Finalize (Create or Update) at step 3
      this.finishWizard();
    }
  }

  saveStep1AndProceed() {
    const data = this.identificationData();
    if (!data || !this.initialData || this.isSaving()) return;

    this.isSaving.set(true);

    // Already exists -> Update (Step 1 fields) but preserve others from Signals
    const updateRequest: UpdateProjectRequest = {
      id: this.initialData.id,
      name: data.projectBriefDescription,
      technicalTable: this.technicalTableAssignments().map(a => ({
        axisId: a.eje,
        advisorId: a.consultor.id
      })),
      responseTeam: this.responseTeam().map(m => ({
        userId: m.userId,
        name: m.name,
        email: m.email,
        profile: m.profile,
        documentType: m.documentType,
        documentNumber: m.documentNumber,
        nombre: m.nombre,
        phone: m.phone,
        representativeType: m.representativeType
      }))
    };

    this.adminService.updateProject(this.initialData.id, updateRequest).subscribe({
          next: (project) => {
            this.initialData = project;
            this.alertService.success('Datos actualizados');
            this.currentStep.update(s => s + 1);
            this.isSaving.set(false);
          },
          error: () => {
            this.alertService.error('Error al actualizar el proyecto');
            this.isSaving.set(false);
          }
        });
  }

  prevStep() {
    if (this.currentStep() > 1) {
      this.currentStep.update(s => s - 1);
    }
  }

  finishWizard() {
    if (!this.isCurrentStepValid()) {
      this.modalAlertData.set({
        type: 'error',
        title: 'Datos Incompletos',
        message: 'Por favor complete todos los campos requeridos antes de finalizar.',
        confirmText: 'Aceptar'
      });
      this.markStepAsTouched();
      return;
    }

    if (this.isSaving()) return;

    const data = this.identificationData();
    if (!data) return;

    this.isSaving.set(true);

      if (this.initialData) {
        // Edit Mode -> Update
        const updateRequest: UpdateProjectRequest = {
          id: this.initialData.id,
          name: data.projectBriefDescription,
          technicalTable: this.technicalTableAssignments().map(a => ({
            axisId: a.eje,
            advisorId: a.consultor.id
          })),
          responseTeam: this.responseTeam().map(m => ({
            userId: m.userId,
            name: m.name,
            email: m.email,
            profile: m.profile,
            documentType: m.documentType,
            documentNumber: m.documentNumber,
            nombre: m.nombre,
            phone: m.phone,
            representativeType: m.representativeType
          }))
        };

        this.adminService.updateProject(this.initialData.id, updateRequest).subscribe({
          next: () => {
            this.alertService.success('Proyecto actualizado exitosamente');
            this.completed.emit();
            this.isSaving.set(false);
          },
          error: () => {
            this.alertService.error('Error al actualizar el proyecto');
            this.isSaving.set(false);
          }
        });
      } else {
        // Create Mode -> Create FULL PROJECT (Step 1 + Step 2)
        const createRequest: CreateProjectRequest = {
          id: null,
          housingCount: data.housingCount,
          beneficiariesCount: data.beneficiariesCount,
          tieneTerreno: data.tieneTerreno,
          landDescription: data.landDescription,
          projectValue: data.projectValue,
          tieneFinanciacion: data.tieneFinanciacion,
          financingDescription: data.financingDescription,
          organization: {
            name: data.organizationName,
            type: data.organizationType,
            identifier: data.organizationIdentifier,
            digitoVerificacion: parseInt(data.verificationDigit) || 0,
            email: data.organizationEmail,
            paginaWeb: data.website,
            region: data.departmentId,
            municipality: data.municipality || { id: '', nombre: '' },
            address: data.organizationAddress,
            description: data.organizationDescription,
            organizationTeam: this.responseTeam().map(m => ({
              userId: m.userId,
              name: m.name,
              email: m.email,
              profile: m.profile,
              documentType: m.documentType,
              documentNumber: m.documentNumber,
              nombre: m.nombre,
              phone: m.phone,
              representativeType: m.representativeType
            }))
          },
          projectTeam: this.technicalTableAssignments().map(a => ({
            eje: a.eje,
            consultor: a.consultor
          }))
        };

        this.adminService.createProject(createRequest).subscribe({
          next: (project) => {
            this.alertService.success('Proyecto creado exitosamente');
            this.completed.emit();
            this.isSaving.set(false);
          },
          error: () => {
            this.alertService.error('Error al crear el proyecto');
            this.isSaving.set(false);
          }
        });
      }
  }

  onModalAlertConfirm() {
    this.modalAlertData.set(null);
  }

  markStepAsTouched() {
    // This method would trigger form validation display in child components
    // Since we are using Signals and separate components, we might need a mechanism 
    // to broadcast "validate now" or rely on the fact that users have likely interacted.
    // For a robust solution, we could emit an event to the active step component.
    console.log('Marking step as touched for validation');
  }

  // --- Data Updates ---

  updateIdentification(data: IdentificationData) {
    if (!data) {
      console.warn('updateIdentification received null data, skipping update');
      return;
    }
    
    // If organization changes, we might need to reset Step 4
    const prev = this.identificationData();
    if (prev && prev.organizationIdentifier !== data.organizationIdentifier) {
      this.responseTeam.set([]); // Reset response team
    }
    this.identificationData.set(data);
  }

  updateTechnicalTable(assignment: TechnicalTableAssignment) {
    this.technicalTableAssignments.update(prev => {
      // Replace existing assignment for this axis or add new
      const filtered = prev.filter(a => a.eje !== assignment.eje);
      return [...filtered, assignment];
    });
  }

  updateResponseTeam(members: ResponseTeamMember[]) {
    this.responseTeam.set(members);
    
    // Auto-save changes immediately when members are updated (added/removed)
    if (this.initialData) {
      this.saveResponseTeam();
    }
  }

  saveResponseTeam() {
    const data = this.identificationData();
    if (!data || !this.initialData) return;

    const updateRequest: UpdateProjectRequest = {
      id: this.initialData.id,
      name: data.projectBriefDescription,
      technicalTable: this.technicalTableAssignments().map(a => ({
        axisId: a.eje,
        advisorId: a.consultor.id
      })),
      responseTeam: this.responseTeam().map(m => ({
        userId: m.userId,
        name: m.name,
        email: m.email,
        profile: m.profile,
        documentType: m.documentType,
        documentNumber: m.documentNumber,
        nombre: m.nombre,
        phone: m.phone,
        representativeType: m.representativeType
      }))
    };

    this.adminService.updateProject(this.initialData.id, updateRequest).subscribe({
      next: (project) => {
        this.initialData = project; 
        this.alertService.success('Equipo actualizado correctamente');
      },
      error: () => this.alertService.error('Error al actualizar el equipo')
    });
  }
}

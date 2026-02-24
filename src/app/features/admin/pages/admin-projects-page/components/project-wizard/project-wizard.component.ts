import { Component, computed, EventEmitter, Input, Output, signal, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StepIdentificationComponent } from './steps/step-identification/step-identification.component';
import { StepEvaluationComponent } from './steps/step-evaluation/step-evaluation.component';
import { StepTechnicalTableComponent } from './steps/step-technical-table/step-technical-table.component';
import { StepResponseTeamComponent } from './steps/step-response-team/step-response-team.component';
import { AlertService } from '../../../../../../core/services/alert.service';
import { AdminDataService } from '../../../../services/admin-data.service';
import { ParametroBaseService } from '../../../../../../core/services/parametro-base.service';
import { CreateProjectRequest, Project, UpdateProjectRequest } from '../../../../../../core/models/domain.models';
import { 
  IdentificationData, 
  EvaluationAxis, 
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
    StepEvaluationComponent,
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
      title: 'Evaluación', 
      icon: 'quiz',
      description: 'Seleccione los ejes de evaluación y responda las preguntas técnicas del proyecto.'
    },
    { 
      number: 4, 
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

  // Step 3 Data
  evaluationAxes = signal<EvaluationAxis[]>([
    { id: 'SUELO', name: 'Suelo', questionCount: 45, isActive: true },
    { id: 'SOCIAL', name: 'Social', questionCount: 30, isActive: true },
    { id: 'FINANCIERO', name: 'Financiero', questionCount: 25, isActive: true },
    { id: 'PRECONSTRUCCION', name: 'Preconstrucción', questionCount: 20, isActive: true }
  ]);

  // Step 2 Data
  responseTeam = signal<ResponseTeamMember[]>([]);

  // Step 3 Data
  // (managed in evaluationAxes signal)

  // Step 4 Data
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
      projectName: safeStr(project.name) || safeStr(project.code),
      
      departmentId: orgData?.regionId || '',
      departmentName: project.state || orgData?.region || '',
      municipalityId: orgData?.municipalityId || null,
      municipalityName: project.municipality || orgData?.municipality || '',
      
      organizationName: safeStr(project.organizationName) || orgData?.name || '',
      organizationType: orgType?.id || '',
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
        userName: m.name,
        userEmail: m.email,
        roleInProject: m.profile,
        documentType: m.documentTypeId || 'CC',
        documentNumber: m.documentNumber,
        phoneNumber: '',
        status: 'ACTIVE',
        responsiblePosition: m.representativeTypeId,
        profileDescription: ''
      })));
    }
  }

  // --- Computed Helpers ---
  activeAxes = computed(() => this.evaluationAxes().filter(axis => axis.isActive));
  
  // Validation for Current Step
  isCurrentStepValid = computed(() => {
    switch (this.currentStep()) {
      case 1:
        return !!this.identificationData();
      case 2:
        return this.responseTeam().length > 0;
      case 3: 
        return this.activeAxes().length > 0;
      case 4:
        const activeIds = this.activeAxes().map(a => a.id);
        const assignedIds = this.technicalTableAssignments().map(a => a.axisId);
        // All active axes must have an assignment
        return activeIds.every(id => assignedIds.includes(id));
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
      // Finalize (Create or Update)
      this.finishWizard();
    } else {
      this.currentStep.update(s => s + 1);
    }
  }

  saveStep1AndProceed() {
    const data = this.identificationData();
    if (!data || !this.initialData || this.isSaving()) return;

    this.isSaving.set(true);

    // Already exists -> Update (Step 1 fields) but preserve others from Signals
    const updateRequest: UpdateProjectRequest = {
      id: this.initialData.id,
      name: data.projectName,
      dates: {
        start: data.startDate,
        end: data.endDate,
        submissionDeadline: data.submissionDeadline
      },
      activeAxes: this.activeAxes().map(a => a.id),
      technicalTable: this.technicalTableAssignments().map(a => ({ axisId: a.axisId, advisorId: a.advisorId })),
      responseTeam: this.responseTeam().map(m => ({
        userId: m.userId,
        name: m.userName,
        email: m.userEmail,
        profile: m.roleInProject,
        documentTypeId: m.documentType,
        documentNumber: m.documentNumber,
        representativeTypeId: m.responsiblePosition ? 
          this.parametroBaseService.tiposEncargado().find((t: any) => t.id === m.responsiblePosition)?.codigo || 
          m.responsiblePosition : undefined,
        // phone: m.phoneNumber,
        // status: m.status,
        // profileDescription: m.profileDescription
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
          name: data.projectName,
          dates: {
            start: data.startDate,
            end: data.endDate,
            submissionDeadline: data.submissionDeadline
          },
          activeAxes: this.activeAxes().map(a => a.id),
          technicalTable: this.technicalTableAssignments().map(a => ({
            axisId: a.axisId,
            advisorId: a.advisorId
          })),
          responseTeam: this.responseTeam().map(m => ({
            userId: m.userId,
            name: m.userName,
            email: m.userEmail,
            profile: m.roleInProject,
            documentTypeId: m.documentType,
            documentNumber: m.documentNumber,
            representativeTypeId: m.responsiblePosition ? 
              this.parametroBaseService.tiposEncargado().find((t: any) => t.id === m.responsiblePosition)?.codigo || 
              m.responsiblePosition : undefined,
            // phone: m.phoneNumber,
            // status: m.status,
            // profileDescription: m.profileDescription
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
        // Map organization type GUID back to code
        const orgType = data.organizationType ? this.parametroBaseService.tiposOrganizacion().find((t: any) => t.id === data.organizationType) : null;

        // Map responsiblePosition GUID back to code for each team member
        const responseTeamWithMappedPositions = this.responseTeam().map(m => {
          const positionCode = m.responsiblePosition ? 
            this.parametroBaseService.tiposEncargado().find((t: any) => t.id === m.responsiblePosition)?.codigo : 
            m.responsiblePosition;
          return {
            ...m,
            responsiblePosition: positionCode as any
          };
        });

        const createRequest: CreateProjectRequest = {
          organization: {
            name: data.organizationName,
            type: (orgType?.codigo || data.organizationType) as any,
            identifier: data.organizationIdentifier,
            email: data.organizationEmail,
            description: data.organizationDescription,
            address: data.organizationAddress,
            municipalityId: data.municipalityId,
            regionId: data.departmentId
          },
          project: {
            name: data.projectName,
            municipality: data.municipalityName || '',
            state: data.departmentName,
            dates: {
              start: data.startDate,
              end: data.endDate,
              submissionDeadline: data.submissionDeadline
            }
          },
          responseTeam: responseTeamWithMappedPositions.map(m => ({
            name: m.userName,
            email: m.userEmail,
            profile: m.roleInProject,
            documentTypeId: m.documentType,
            documentNumber: m.documentNumber,
            representativeTypeId: m.responsiblePosition
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

  toggleAxis(axisId: string) {
    this.evaluationAxes.update(axes => 
      axes.map(axis => {
        if (axis.id === axisId) {
          const isActive = !axis.isActive;
          // If turning off, remove assignment from Step 4
          if (!isActive) {
            this.technicalTableAssignments.update(assignments => 
              assignments.filter(a => a.axisId !== axisId)
            );
          }
          return { ...axis, isActive };
        }
        return axis;
      })
    );
  }

  updateTechnicalTable(assignment: TechnicalTableAssignment) {
    this.technicalTableAssignments.update(prev => {
      // Replace existing assignment for this axis or add new
      const filtered = prev.filter(a => a.axisId !== assignment.axisId);
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
      name: data.projectName,
      dates: {
        start: data.startDate,
        end: data.endDate,
        submissionDeadline: data.submissionDeadline
      },
      // Preserve other fields if they exist in state, otherwise map from initialData or empty
      activeAxes: this.activeAxes().map(a => a.id), 
      technicalTable: this.technicalTableAssignments().map(a => ({
        axisId: a.axisId,
        advisorId: a.advisorId
      })),
      responseTeam: this.responseTeam().map(m => ({
        userId: m.userId,
        name: m.userName,
        email: m.userEmail,
        profile: m.roleInProject,
        documentTypeId: m.documentType,
        documentNumber: m.documentNumber,
        representativeTypeId: m.responsiblePosition,
        // phone: m.phoneNumber,
        // status: m.status,
        // profileDescription: m.profileDescription
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

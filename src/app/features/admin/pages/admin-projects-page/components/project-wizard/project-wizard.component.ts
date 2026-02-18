import { Component, computed, EventEmitter, Input, Output, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StepIdentificationComponent } from './steps/step-identification/step-identification.component';
import { StepEvaluationComponent } from './steps/step-evaluation/step-evaluation.component';
import { StepTechnicalTableComponent } from './steps/step-technical-table/step-technical-table.component';
import { StepResponseTeamComponent } from './steps/step-response-team/step-response-team.component';
import { AlertService } from '../../../../../../core/services/alert.service';
import { AdminDataService } from '../../../../services/admin-data.service';
import { inject } from '@angular/core';
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

  // --- Constants ---
  readonly ALL_STEPS = [
    { number: 1, title: 'Identificación', icon: 'badge' },
    { number: 2, title: 'Equipo Respuesta', icon: 'group_add' },
    { number: 3, title: 'Evaluación', icon: 'quiz' },
    { number: 4, title: 'Mesa Técnica', icon: 'engineering' }
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
    
    // Map Project to IdentificationData
    // The 'organization' field in the backend response is actually the full object, 
    // but our frontend interface definition might be typed as string | OrganizationData.
    // Let's handle it safely.
    
    const orgData = project.organizationData || (typeof project.organization === 'object' ? project.organization : null);
    
    // Helper to safely get string
    const safeStr = (val: any) => (val && typeof val === 'string') ? val : '';

    this.identificationData.set({
      // Use 'name' for the project name input, fallback to 'code' if name is missing
      projectName: safeStr(project.name) || safeStr(project.code),
      
      department: project.state || orgData?.region || '',
      municipality: project.municipality || orgData?.municipality || '',
      
      // Organization details
      organizationName: safeStr(project.organizationName) || orgData?.name || '',
      organizationType: orgData?.type || 'COMPANY',
      organizationIdentifier: orgData?.identifier || '',
      organizationEmail: orgData?.email || '',
      organizationDescription: orgData?.description || '',
      organizationAddress: orgData?.address || '',
      
      // Dates - strip time part if present (YYYY-MM-DD)
      startDate: safeStr(project.startDate).split('T')[0],
      endDate: safeStr(project.endDate).split('T')[0],
      submissionDeadline: safeStr(project.submissionDeadline).split('T')[0]
    });
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
        roleInProject: m.roleInProject,
        documentType: m.documentType,
        documentNumber: m.documentNumber,
        phone: m.phoneNumber,
        status: m.status
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
            roleInProject: m.roleInProject,
            documentType: m.documentType,
            documentNumber: m.documentNumber,
            phone: m.phoneNumber,
            status: m.status
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
          name: data.projectName,
          department: data.department,
          municipality: data.municipality,
          organization: {
            name: data.organizationName,
            type: data.organizationType,
            identifier: data.organizationIdentifier,
            email: data.organizationEmail,
            description: data.organizationDescription,
            address: data.organizationAddress,
            municipality: data.municipality,
            region: data.department
          },
          dates: {
            start: data.startDate,
            end: data.endDate,
            submissionDeadline: data.submissionDeadline
          },
          // Send the collected Response Team immediately!
          responseTeam: this.responseTeam().map(m => ({
            name: m.userName,
            email: m.userEmail,
            roleInProject: m.roleInProject,
            documentType: m.documentType,
            documentNumber: m.documentNumber,
            phone: m.phoneNumber,
            status: m.status
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
        roleInProject: m.roleInProject,
        documentType: m.documentType,
        documentNumber: m.documentNumber,
        phone: m.phoneNumber,
        status: m.status
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

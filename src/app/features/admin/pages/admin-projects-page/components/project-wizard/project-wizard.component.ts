import { Component, computed, EventEmitter, Input, Output, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StepIdentificationComponent } from './steps/step-identification/step-identification.component';
import { StepEvaluationComponent } from './steps/step-evaluation/step-evaluation.component';
import { StepTechnicalTableComponent } from './steps/step-technical-table/step-technical-table.component';
import { StepResponseTeamComponent } from './steps/step-response-team/step-response-team.component';
import { AlertService } from '../../../../../../core/services/alert.service';
import { AdminDataService } from '../../../../services/admin-data.service';
import { inject } from '@angular/core';
import { CreateProjectRequest, Project } from '../../../../../../core/models/domain.models';
import { 
  IdentificationData, 
  EvaluationAxis, 
  TechnicalTableAssignment, 
  ResponseTeamMember 
} from './project-wizard.types';

export type WizardMode = 'FULL' | 'IDENTIFICATION_ONLY';

@Component({
  selector: 'app-project-wizard',
  standalone: true,
  imports: [
    CommonModule, 
    StepIdentificationComponent,
    StepEvaluationComponent,
    StepTechnicalTableComponent,
    StepResponseTeamComponent
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

  constructor() {
    // Initialize with data if provided
    effect(() => {
      if (this.initialData) {
        this.loadInitialData(this.initialData);
      }
    }, { allowSignalWrites: true });
  }

  loadInitialData(project: Project) {
    // Map Project to IdentificationData
    this.identificationData.set({
      // The Project interface seems to have diverged from the Wizard data.
      // Assuming 'code' is not name.
      // Let's look at AdminDataService mock creation:
      // name: data.projectName -> not in Project interface
      // organization: { name... } -> Project has organization: string
      
      // For now, I'll do a best effort mapping or leave empty if fields are missing
      // Real app would fetch full details
      projectName: 'Proyecto ' + project.code, 
      department: project.state,
      municipality: project.municipality,
      organizationName: project.organization,
      organizationDescription: '', // Missing
      organizationIdentifier: '', // Missing
      organizationAddress: '', // Missing
      startDate: project.startDate || '',
      endDate: project.endDate || '',
      submissionDeadline: project.submissionDeadline || ''
    });
    
    // We would need to load other steps too if we had the data in Project model
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
    if (this.currentStep() < this.steps().length && this.isCurrentStepValid()) {
      this.currentStep.update(s => s + 1);
    }
  }


  prevStep() {
    if (this.currentStep() > 1) {
      this.currentStep.update(s => s - 1);
    }
  }

  finishWizard() {
    if (this.isCurrentStepValid()) {
      const data = this.identificationData();
      if (!data) return;

      const request: CreateProjectRequest = {
        name: data.projectName,
        department: data.department,
        municipality: data.municipality,
        organization: {
          name: data.organizationName,
          description: data.organizationDescription,
          identifier: data.organizationIdentifier,
          address: data.organizationAddress
        },
        dates: {
          start: data.startDate,
          end: data.endDate,
          submissionDeadline: data.submissionDeadline
        },
        responseTeam: this.responseTeam().map(m => ({
          userId: m.userId,
          userName: m.userName,
          userEmail: m.userEmail,
          documentType: m.documentType,
          documentNumber: m.documentNumber,
          phoneNumber: m.phoneNumber,
          status: m.status
        })),
        activeAxes: this.activeAxes().map(a => a.id),
        technicalTable: this.technicalTableAssignments().map(a => ({
          axisId: a.axisId,
          advisorId: a.advisorId
        }))
      };

      if (this.initialData) {
        this.adminService.updateProject(this.initialData.id, request).subscribe({
          next: () => {
            this.alertService.success('Proyecto actualizado exitosamente');
            this.completed.emit();
          },
          error: (err) => {
            console.error(err);
            this.alertService.error('Error al actualizar el proyecto');
          }
        });
      } else {
        this.adminService.createProject(request).subscribe({
          next: () => {
            this.alertService.success('Proyecto registrado exitosamente');
            this.completed.emit();
          },
          error: (err) => {
            console.error(err);
            this.alertService.error('Error al registrar el proyecto');
          }
        });
      }
    }
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
  }
}

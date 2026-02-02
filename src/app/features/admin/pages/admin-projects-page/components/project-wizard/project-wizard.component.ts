import { Component, computed, EventEmitter, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StepIdentificationComponent } from './steps/step-identification/step-identification.component';
import { StepEvaluationComponent } from './steps/step-evaluation/step-evaluation.component';
import { StepTechnicalTableComponent } from './steps/step-technical-table/step-technical-table.component';
import { StepResponseTeamComponent } from './steps/step-response-team/step-response-team.component';
import { AlertService } from '../../../../../../core/services/alert.service';
import { inject } from '@angular/core';
import { 
  IdentificationData, 
  EvaluationAxis, 
  TechnicalTableAssignment, 
  ResponseTeamMember 
} from './project-wizard.types';

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
  @Output() completed = new EventEmitter<void>();
  
  private alertService = inject(AlertService);

  // --- Constants ---
  readonly STEPS = [
    { number: 1, title: 'Identificación', icon: 'badge' },
    { number: 2, title: 'Evaluación', icon: 'quiz' },
    { number: 3, title: 'Mesa Técnica', icon: 'engineering' },
    { number: 4, title: 'Equipo Respuesta', icon: 'group_add' }
  ];

  // --- State ---
  currentStep = signal(1);
  
  // Step 1 Data
  identificationData = signal<IdentificationData | null>(null);

  // Step 2 Data
  evaluationAxes = signal<EvaluationAxis[]>([
    { id: 'SUELO', name: 'Suelo', questionCount: 45, isActive: false },
    { id: 'SOCIAL', name: 'Social', questionCount: 30, isActive: false },
    { id: 'FINANCIERO', name: 'Financiero', questionCount: 25, isActive: false },
    { id: 'PRECONSTRUCCION', name: 'Preconstrucción', questionCount: 20, isActive: false }
  ]);

  // Step 3 Data
  technicalTableAssignments = signal<TechnicalTableAssignment[]>([]);

  // Step 4 Data
  responseTeam = signal<ResponseTeamMember[]>([]);

  // --- Computed Helpers ---
  activeAxes = computed(() => this.evaluationAxes().filter(axis => axis.isActive));
  
  // Validation for Current Step
  isCurrentStepValid = computed(() => {
    switch (this.currentStep()) {
      case 1:
        return !!this.identificationData();
      case 2:
        return this.activeAxes().length > 0;
      case 3: 
        const activeIds = this.activeAxes().map(a => a.id);
        const assignedIds = this.technicalTableAssignments().map(a => a.axisId);
        // All active axes must have an assignment
        return activeIds.every(id => assignedIds.includes(id));
      case 4:
        return this.responseTeam().length > 0;
      default:
        return false;
    }
  });

  // --- Actions ---

  goToStep(step: number) {
    if (step < this.currentStep() || (step > this.currentStep() && this.isCurrentStepValid())) {
      // Only allow going forward if current step is valid, or jumping back
      // Also need to check intermediate steps if jumping multiple
      // For simplicity, allow going back freely, and going forward only one by one usually
      // But if user clicks step 3 while on step 1, prevent unless step 1 valid? 
      // Better stick to next/prev for strict validation flow, or allow click only for visited steps
      // Here: allow click if step < current (always safe)
      if (step < this.currentStep()) {
        this.currentStep.set(step);
      }
    }
  }

  nextStep() {
    if (this.currentStep() < this.STEPS.length && this.isCurrentStepValid()) {
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
      console.log('Wizard Completed', {
        identification: this.identificationData(),
        evaluation: this.activeAxes(),
        technicalTable: this.technicalTableAssignments(),
        responseTeam: this.responseTeam()
      });
      
      this.alertService.success('Proyecto registrado exitosamente');
      this.completed.emit();
    }
  }

  // --- Data Updates ---

  updateIdentification(data: IdentificationData) {
    // If organization changes, we might need to reset Step 4
    const prev = this.identificationData();
    if (prev && prev.organizationId !== data.organizationId) {
      this.responseTeam.set([]); // Reset response team
    }
    this.identificationData.set(data);
  }

  toggleAxis(axisId: string) {
    this.evaluationAxes.update(axes => 
      axes.map(axis => {
        if (axis.id === axisId) {
          const isActive = !axis.isActive;
          // If turning off, remove assignment from Step 3
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

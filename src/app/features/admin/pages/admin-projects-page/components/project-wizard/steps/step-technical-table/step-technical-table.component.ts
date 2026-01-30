import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EvaluationAxis, TechnicalTableAssignment } from '../../project-wizard.types';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-step-technical-table',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './step-technical-table.component.html',
  styles: []
})
export class StepTechnicalTableComponent {
  @Input({ required: true }) activeAxes: EvaluationAxis[] = [];
  @Input({ required: true }) assignments: TechnicalTableAssignment[] = [];
  @Output() assign = new EventEmitter<TechnicalTableAssignment>();

  // Mock Advisors - in real app, fetch from service based on Role/Axis
  advisors = [
    { id: 'ADV-001', name: 'Carlos Ruiz', workload: 80, role: 'SUELO' },
    { id: 'ADV-002', name: 'María Gómez', workload: 100, role: 'SOCIAL' },
    { id: 'ADV-003', name: 'Roberto Díaz', workload: 30, role: 'FINANCIERO' },
    { id: 'ADV-004', name: 'Ana Torres', workload: 45, role: 'PRECONSTRUCCION' },
    { id: 'ADV-005', name: 'Luis Pérez', workload: 10, role: 'SUELO' },
    { id: 'ADV-006', name: 'Elena W.', workload: 25, role: 'SOCIAL' },
    { id: 'ADV-007', name: 'Pedro M.', workload: 50, role: 'FINANCIERO' },
    { id: 'ADV-008', name: 'Sofia L.', workload: 0, role: 'PRECONSTRUCCION' },
  ];

  getAdvisorsForAxis(axisId: string) {
    // Filter by role (assuming role maps to axisId for this mock)
    // And sort by workload ASC
    return this.advisors
      .filter(a => a.role === axisId)
      .sort((a, b) => a.workload - b.workload);
  }

  getAssignment(axisId: string): string {
    return this.assignments.find(a => a.axisId === axisId)?.advisorId || '';
  }

  onSelectAdvisor(axisId: string, event: Event) {
    const select = event.target as HTMLSelectElement;
    const advisorId = select.value;
    if (advisorId) {
      const advisor = this.advisors.find(a => a.id === advisorId);
      if (advisor) {
        this.assign.emit({
          axisId,
          advisorId,
          advisorName: advisor.name
        });
      }
    }
  }
}

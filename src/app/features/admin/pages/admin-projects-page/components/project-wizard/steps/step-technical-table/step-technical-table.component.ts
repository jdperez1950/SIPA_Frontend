import { Component, EventEmitter, Input, Output, inject, OnInit, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EvaluationAxis, TechnicalTableAssignment } from '../../project-wizard.types';
import { FormsModule } from '@angular/forms';
import { AdminDataService } from '../../../../../../services/admin-data.service';
import { User } from '../../../../../../../../core/models/domain.models';
import { signal, computed } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

interface Advisor extends User {
  workload: number;
}

@Component({
  selector: 'app-step-technical-table',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './step-technical-table.component.html',
  styles: []
})
export class StepTechnicalTableComponent implements OnInit {
  @Input() activeAxes: EvaluationAxis[] = [];
  @Input({ required: true }) assignments: TechnicalTableAssignment[] = [];
  @Output() assign = new EventEmitter<TechnicalTableAssignment>();

  private adminService = inject(AdminDataService);
  private destroyRef = inject(DestroyRef);

  advisors = signal<Advisor[]>([]);
  loading = signal(false);

  availableAxes = signal<EvaluationAxis[]>([
    { id: 'Social', name: 'Social', questionCount: 30, isActive: true },
    { id: 'Financiero', name: 'Financiero', questionCount: 25, isActive: true },
    { id: 'Suelo', name: 'Suelo', questionCount: 45, isActive: true },
    { id: 'Preconstrucción', name: 'Preconstrucción', questionCount: 20, isActive: true }
  ]);

  ngOnInit() {
    this.loadAdvisors();
  }

  loadAdvisors() {
    this.loading.set(true);
    
    this.adminService.getUsers(1, 100, '', 'ASESOR', 'ACTIVE')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          const advisorList = response.data.map((user: User) => ({
            ...user,
            workload: user.projectsAssigned || 0
          }));
          this.advisors.set(advisorList);
          this.loading.set(false);
        },
        error: (error) => {
          console.error('Error loading advisors:', error);
          this.advisors.set([]);
          this.loading.set(false);
        }
      });
  }

  getAdvisorsForAxis(axisId: string) {
    return this.advisors()
      .sort((a, b) => (a.workload || 0) - (b.workload || 0));
  }

  getAssignment(axisId: string): string {
    return this.assignments.find(a => a.eje === axisId)?.consultor.id || '';
  }

  onSelectAdvisor(axisId: string, event: Event) {
    const select = event.target as HTMLSelectElement;
    const advisorId = select.value;
    if (advisorId) {
      const advisor = this.advisors().find(a => a.id === advisorId);
      if (advisor) {
        this.assign.emit({
          eje: axisId,
          consultor: {
            id: advisor.id,
            nombre: advisor.name
          }
        });
      }
    }
  }
}

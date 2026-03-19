import { Component, EventEmitter, Input, Output, inject, OnInit, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EvaluationAxis, TechnicalTableAssignment } from '../../project-wizard.types';
import { FormsModule } from '@angular/forms';
import { AdminDataService } from '../../../../../../services/admin-data.service';
import { User } from '../../../../../../../../core/models/domain.models';
import { signal, computed } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CustomDropdownComponent, CustomDropdownItem } from '../../../shared/custom-dropdown/custom-dropdown.component';

interface Advisor extends User {
  workload: number;
}

@Component({
  selector: 'app-step-technical-table',
  standalone: true,
  imports: [CommonModule, FormsModule, CustomDropdownComponent],
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

  displayedAxes = computed(() => {
    return [...this.activeAxes].sort((a, b) => {
      const codeA = a.code || '';
      const codeB = b.code || '';
      return codeA.localeCompare(codeB, undefined, { numeric: true });
    });
  });

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
    const currentAssignment = this.assignments.find(a => a.eje === axisId);
    const assignedAdvisorIds = this.assignments
      .filter(a => a.eje !== axisId)
      .map(a => a.consultor.id);

    return this.advisors()
      .filter(advisor => 
        !assignedAdvisorIds.includes(advisor.id) || 
        (currentAssignment && advisor.id === currentAssignment.consultor.id)
      )
      .sort((a, b) => (a.workload || 0) - (b.workload || 0));
  }

  getAssignment(axisId: string): string {
    return this.assignments.find(a => a.eje === axisId)?.consultor.id || '';
  }

  getAdvisorOptions(axisId: string): CustomDropdownItem[] {
    return this.getAdvisorsForAxis(axisId).map(advisor => ({
      id: advisor.id,
      nombre: advisor.name
    }));
  }

  onSelectAdvisor(axisId: string, advisorId: string) {
    const axis = this.activeAxes.find(a => a.id === axisId);
    if (advisorId) {
      const advisor = this.advisors().find(a => a.id === advisorId);
      if (advisor) {
        this.assign.emit({
          eje: axisId,
          ejeName: axis?.name || axisId,
          consultor: {
            id: advisor.id,
            nombre: advisor.name
          }
        });
      }
    } else {
      this.assign.emit({
        eje: axisId,
        ejeName: axis?.name || axisId,
        consultor: { id: '', nombre: '' }
      });
    }
  }
}

import { Component, computed, inject, signal, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AlertService } from '../../../../core/services/alert.service';
import { AdminDataService } from '../../services/admin-data.service';
import { ProjectsService } from '../../../../core/services/projects.service';
import { Project, ProjectStatus } from '../../../../core/models/domain.models';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';
import { LoadingComponent } from '../../../../shared/components/loading/loading.component';
import { ProjectWizardComponent, WizardMode } from './components/project-wizard/project-wizard.component';
import { StepTechnicalTableComponent } from './components/project-wizard/steps/step-technical-table/step-technical-table.component';
import { TechnicalTableAssignment, EvaluationAxis } from './components/project-wizard/project-wizard.types';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-admin-projects-page',
  standalone: true,
  imports: [CommonModule, FormsModule, PaginationComponent, ProjectWizardComponent, LoadingComponent, StepTechnicalTableComponent],
  templateUrl: './admin-projects-page.component.html',
  styles: []
})
export class AdminProjectsPageComponent implements OnInit {
  private alertService = inject(AlertService);
  private adminDataService = inject(AdminDataService);
  private projectsService = inject(ProjectsService);

  // State
  showWizard = signal(false); // Controls Wizard visibility
  wizardMode = signal<WizardMode>('FULL');
  searchQuery = signal('');
  selectedStatus = signal<ProjectStatus | null>(null);
  showAssignModal = signal<boolean>(false);
  selectedProject = signal<Project | null>(null);
  isLoading = signal(false);
  isSavingAssignments = signal(false);

  // Pagination State
  currentPage = signal(1);
  pageSize = signal(25);
  totalItems = signal(0);

  // Data
  projects = signal<Project[]>([]);
  expandedDescriptions = signal<Set<string>>(new Set());
  assignModalAssignments = signal<TechnicalTableAssignment[]>([]);
  availableAxes = signal<EvaluationAxis[]>([]);
  advisorAxesByProject = signal<Record<string, string[]>>({});

  constructor() {
    // No effect needed - we'll handle filter changes explicitly
  }

  ngOnInit() {
    // Initial load
    this.loadProjects();
  }

  loadProjects() {
    this.isLoading.set(true);
    this.adminDataService.getProjects(
      this.currentPage(),
      this.pageSize(),
      this.searchQuery(),
      this.selectedStatus()
    ).subscribe({
      next: (response: any) => {
        // Handle various response shapes (Paginated vs Array vs Empty)
        const projects = Array.isArray(response) ? response : (response?.data || []);
        const total = response?.meta?.totalItems || projects.length;

        this.projects.set(projects);
        this.totalItems.set(total);
        this.resolveAdvisorsForProjects();
        this.isLoading.set(false);
      },
      error: (error) => {
        const errorMessage = error?.error?.message || error?.message || 'Error al cargar los proyectos. Por favor intente nuevamente.';
        this.alertService.error(errorMessage);
        this.isLoading.set(false);
        this.projects.set([]); // Ensure empty state on error
      }
    });
  }

  onPageChange(page: number) {
    this.currentPage.set(page);
    this.loadProjects();
  }

  // Actions
  toggleWizard(show: boolean, mode: WizardMode = 'FULL') {
    this.wizardMode.set(mode);
    this.showWizard.set(show);
    if (!show) {
      // Refresh list when wizard closes (in case new project was added)
      this.selectedProject.set(null); // Clear selection
      this.loadProjects();
    }
  }

  createProject() {
    this.selectedProject.set(null);
    this.toggleWizard(true);
  }

  viewProject(project: Project) {
    this.isLoading.set(true);
    this.projectsService.getProjectById(project.id).subscribe({
      next: (response) => {
        const fullProject = response.data;
        this.selectedProject.set(fullProject);
        this.toggleWizard(true, 'READ_ONLY');
        this.isLoading.set(false);
      },
      error: (error) => {
        const errorMessage = error?.error?.message || error?.message || 'Error al cargar el proyecto';
        this.alertService.error(errorMessage);
        this.isLoading.set(false);
      }
    });
  }

  editProject(project: Project) {
    this.isLoading.set(true);
    this.projectsService.getProjectById(project.id).subscribe({
      next: (response) => {
        const fullProject = response.data;
        this.selectedProject.set(fullProject);
        this.toggleWizard(true, 'FULL');
        this.isLoading.set(false);
      },
      error: (error) => {
        const errorMessage = error?.error?.message || error?.message || 'Error al cargar el proyecto';
        this.alertService.error(errorMessage);
        this.isLoading.set(false);
      }
    });
  }

  filterByStatus(status: ProjectStatus | null) {
    this.selectedStatus.set(status);
    this.currentPage.set(1);
    this.loadProjects();
  }

  onSearchChange(query: string) {
    this.searchQuery.set(query);
    this.currentPage.set(1);
    this.loadProjects();
  }

  openAssignModal(project: Project) {
    this.selectedProject.set(project);
    this.assignModalAssignments.set([]);
    this.showAssignModal.set(true);
    this.projectsService.getProjectAdviser(project.id).subscribe({
      next: (assignments) => {
        const mapped = assignments
          .filter(a => a.isActive && a.user)
          .map(a => ({
            eje: a.axis.id,
            ejeName: a.axis.name,
            consultor: { 
              id: a.user.id, 
              nombre: a.user.name || a.user.email || a.user.id 
            }
          }));
        this.assignModalAssignments.set(mapped);

        const uniqueAxes = Array.from(
          new Map(assignments.map(a => [a.axis.id, {
            id: a.axis.id,
            code: a.axis.code,
            name: a.axis.name || a.axis.id
          }])).values()
        );
        this.availableAxes.set(uniqueAxes);
      },
      error: () => {
        this.assignModalAssignments.set([]);
        this.availableAxes.set([]);
      }
    });
  }

  closeAssignModal() {
    this.showAssignModal.set(false);
    this.selectedProject.set(null);
    this.assignModalAssignments.set([]);
    this.isSavingAssignments.set(false);
  }

  updateAssignModalAssignment(assignment: TechnicalTableAssignment) {
    this.assignModalAssignments.update(current => {
      const filtered = current.filter(item => item.eje !== assignment.eje);
      return [...filtered, assignment];
    });
  }

  async saveAssignedAdvisors() {
    const project = this.selectedProject();
    if (!project) return;
    const assignments = this.assignModalAssignments();
    if (!assignments.length) {
      this.alertService.warning('Seleccione al menos un asesor para guardar');
      return;
    }

    this.isSavingAssignments.set(true);
    this.isLoading.set(true);

    try {
      let updatedProject: Project | null = null;
      for (const assignment of assignments) {
        updatedProject = await firstValueFrom(
          this.adminDataService.assignAdvisor(
            project.id,
            assignment.eje,
            assignment.consultor.id,
            true
          )
        );
      }

      if (updatedProject) {
        this.projects.update(projects =>
          projects.map(p =>
            p.id === updatedProject.id ? updatedProject as Project : p
          )
        );
      }

      this.alertService.success(`Se guardaron ${assignments.length} asignaciones de asesor`);
      this.closeAssignModal();
    } catch (error: any) {
      const errorMessage = error?.error?.message || error?.message || 'Error al asignar asesores. Por favor intente nuevamente.';
      this.alertService.error(errorMessage);
    } finally {
      this.isLoading.set(false);
      this.isSavingAssignments.set(false);
    }
  }

  // Helpers
  getStatusLabel(status: string): string {
    switch (status) {
      case 'ACTIVE': return 'ACTIVO';
      case 'SUSPENDED': return 'SUSPENDIDO';
      case 'CERTIFIED': return 'CERTIFICADO';
      case 'BENEFICIARY': return 'BENEFICIADO';
      case 'RETURNED_FOR_CORRECTION': return 'EN SUBSANACIÓN';
      default: return status;
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'ACTIVE': return 'bg-blue-100 text-blue-700';
      case 'SUSPENDED': return 'bg-red-100 text-red-700';
      case 'CERTIFIED': return 'bg-green-100 text-green-700';
      case 'BENEFICIARY': return 'bg-purple-100 text-purple-700';
      case 'RETURNED_FOR_CORRECTION': return 'bg-orange-100 text-orange-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  }

  getViabilityColor(scenario: string): string {
    switch (scenario) {
      case 'HABILITADO': return 'text-green-600';
      case 'PRE_HABILITADO': return 'text-blue-600';
      case 'ALTA_POSIBILIDAD': return 'text-yellow-600';
      case 'SIN_POSIBILIDAD': return 'text-red-600';
      default: return 'text-gray-500';
    }
  }

  private resolveAdvisorsForProjects() {
    const list = this.projects();
    list.forEach(project => {
      if (!project?.id) return;
      this.projectsService.getProjectAdviser(project.id).subscribe({
        next: (assignments) => {
          const activeAxes = assignments
            .filter(a => a.isActive && a.user && a.axis)
            .map(a => a.axis.name || a.axis.code || a.axis.id)
            .filter(name => !!name && String(name).trim().length > 0);
          
          this.advisorAxesByProject.update(current => ({
            ...current,
            [project.id]: activeAxes
          }));
        },
        error: () => {}
      });
    });
  }

  getAdvisorName(project: Project): string {
    return project.advisor?.name || '';
  }

  hasAdviserAssignments(project: Project): boolean {
    return !!project.advisor;
  }

  hasAdvisorAxes(project: Project): boolean {
    const axes = this.advisorAxesByProject()[project.id] || [];
    return axes.length > 0;
  }

  getAdvisorAxesLabel(project: Project): string {
    const axes = this.advisorAxesByProject()[project.id] || [];
    return axes.join(', ');
  }

  toggleDescription(projectId: string) {
    const current = new Set(this.expandedDescriptions());
    if (current.has(projectId)) {
      current.delete(projectId);
    } else {
      current.add(projectId);
    }
    this.expandedDescriptions.set(current);
  }

  isDescriptionExpanded(projectId: string): boolean {
    return this.expandedDescriptions().has(projectId);
  }

  truncateDescription(description: string, projectId: string): string {
    const descriptionAdjusted = "Descripción proyecto: " + description?.trim() || 'Sin descripción';
    if (!descriptionAdjusted) return 'Sin descripción';
    if (this.isDescriptionExpanded(projectId)) return descriptionAdjusted;
    
    const words = descriptionAdjusted.split(' ');
    if (words.length <= 20) return descriptionAdjusted;
    return words.slice(0, 20).join(' ') + '...';
  }

  shouldShowReadMore(description: string): boolean {
    if (!description) return false;
    return description.split(' ').length > 20;
  }

  getProgressValue(project: Project, axis: 'technical' | 'legal' | 'financial' | 'social'): number {
    return project.progress?.[axis] || 0;
  }
}

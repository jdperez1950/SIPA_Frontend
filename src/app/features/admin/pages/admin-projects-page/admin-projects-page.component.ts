import { Component, computed, inject, signal, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AlertService } from '../../../../core/services/alert.service';
import { AdminDataService } from '../../services/admin-data.service';
import { ProjectsService } from '../../../../core/services/projects.service';
import { Project, ProjectStatus, AdvisorCandidate } from '../../../../core/models/domain.models';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';
import { LoadingComponent } from '../../../../shared/components/loading/loading.component';
import { ProjectWizardComponent } from './components/project-wizard/project-wizard.component';

@Component({
  selector: 'app-admin-projects-page',
  standalone: true,
  imports: [CommonModule, FormsModule, PaginationComponent, ProjectWizardComponent, LoadingComponent],
  templateUrl: './admin-projects-page.component.html',
  styles: []
})
export class AdminProjectsPageComponent implements OnInit {
  private alertService = inject(AlertService);
  private adminDataService = inject(AdminDataService);
  private projectsService = inject(ProjectsService);

  // State
  showWizard = signal(false); // Controls Wizard visibility
  searchQuery = signal('');
  selectedStatus = signal<ProjectStatus | null>(null);
  showAssignModal = signal<boolean>(false);
  selectedProject = signal<Project | null>(null);
  isLoading = signal(false);

  // Pagination State
  currentPage = signal(1);
  pageSize = signal(25);
  totalItems = signal(0);

  // Data
  projects = signal<Project[]>([]);
  expandedDescriptions = signal<Set<string>>(new Set());

  // Mock Advisors for Modal
  availableAdvisors: AdvisorCandidate[] = [
    { id: '2', name: 'Carlos Ruiz', workload: 80, recommended: false },
    { id: '5', name: 'María Gómez', workload: 100, recommended: false },
    { id: '8', name: 'Roberto Díaz', workload: 30, recommended: true }, // Smart suggestion
  ];

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
  toggleWizard(show: boolean) {
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

  editProject(project: Project) {
    this.isLoading.set(true);
    this.projectsService.getProjectById(project.id).subscribe({
      next: (response) => {
        const fullProject = response.data;
        this.selectedProject.set(fullProject);
        this.toggleWizard(true);
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
    this.showAssignModal.set(true);
  }

  closeAssignModal() {
    this.showAssignModal.set(false);
    this.selectedProject.set(null);
  }

  assignAdvisor(advisor: AdvisorCandidate) {
    const project = this.selectedProject();
    if (!project) return;

    this.isLoading.set(true);
    
    this.adminDataService.assignAdvisor(project.id, { id: advisor.id, name: advisor.name }).subscribe({
      next: (updatedProject) => {
        this.projects.update(projects => 
          projects.map(p => 
            p.id === updatedProject.id ? updatedProject : p
          )
        );
        this.alertService.success(`Asesor asignado correctamente al proyecto ${updatedProject.name}`);
        this.isLoading.set(false);
        this.closeAssignModal();
      },
      error: (error) => {
        const errorMessage = error?.error?.message || error?.message || 'Error al asignar el asesor. Por favor intente nuevamente.';
        this.alertService.error(errorMessage);
        this.isLoading.set(false);
        this.closeAssignModal();
      }
    });
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

  getAdvisorName(project: Project): string {
    return project.advisor?.name || '';
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

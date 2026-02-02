import { Component, computed, inject, signal, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminDataService } from '../../services/admin-data.service';
import { Project, ProjectStatus, AdvisorCandidate } from '../../../../core/models/domain.models';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';
import { ProjectWizardComponent } from './components/project-wizard/project-wizard.component';

@Component({
  selector: 'app-admin-projects-page',
  standalone: true,
  imports: [CommonModule, FormsModule, PaginationComponent, ProjectWizardComponent],
  templateUrl: './admin-projects-page.component.html',
  styles: []
})
export class AdminProjectsPageComponent implements OnInit {
  private adminDataService = inject(AdminDataService);

  // State
  showWizard = signal(false); // Controls Wizard visibility
  searchQuery = signal('');
  selectedStatus = signal<ProjectStatus | null>(null);
  showAssignModal = signal<boolean>(false);
  selectedProject = signal<Project | null>(null);
  isLoading = signal(false);

  // Pagination State
  currentPage = signal(1);
  pageSize = signal(10);
  totalItems = signal(0);

  // Data
  projects = signal<Project[]>([]);

  // Mock Advisors for Modal
  availableAdvisors: AdvisorCandidate[] = [
    { id: '2', name: 'Carlos Ruiz', workload: 80, recommended: false },
    { id: '5', name: 'María Gómez', workload: 100, recommended: false },
    { id: '8', name: 'Roberto Díaz', workload: 30, recommended: true }, // Smart suggestion
  ];

  constructor() {
    // React to filter changes to reset pagination and reload
    effect(() => {
      const query = this.searchQuery();
      const status = this.selectedStatus();
      
      // Untracked to avoid loops if needed, but here we want to react
      // We set page to 1 when filters change
      this.currentPage.set(1);
      this.loadProjects();
    }, { allowSignalWrites: true });
  }

  ngOnInit() {
    // Initial load handled by effect
  }

  loadProjects() {
    this.isLoading.set(true);
    this.adminDataService.getProjects(
      this.currentPage(), 
      this.pageSize(), 
      this.searchQuery(),
      this.selectedStatus()
    ).subscribe({
      next: (response) => {
        this.projects.set(response.data);
        this.totalItems.set(response.meta.totalItems);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading projects', err);
        this.isLoading.set(false);
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
      this.loadProjects();
    }
  }

  filterByStatus(status: ProjectStatus | null) {
    this.selectedStatus.set(status);
    // Effect will trigger reload
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
        this.isLoading.set(false);
        this.closeAssignModal();
      },
      error: (err) => {
        console.error('Error assigning advisor', err);
        this.isLoading.set(false);
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
}

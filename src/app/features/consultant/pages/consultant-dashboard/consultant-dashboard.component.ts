import { Component, computed, inject, signal, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProjectsService } from '../../../../core/services/projects.service';
import { Project, ProjectStatus, ViabilityScenario } from '../../../../core/models/domain.models';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';
import { LoadingComponent } from '../../../../shared/components/loading/loading.component';
import { ProjectWizardComponent } from '../../../admin/pages/admin-projects-page/components/project-wizard/project-wizard.component';
import { AuthService } from '../../../../core/auth/services/auth.service';
import { Router } from '@angular/router';
import { FooterComponent } from '../../../../shared/components/footer/footer.component';
import { ConfirmationService } from '../../../../core/services/confirmation.service';

@Component({
  selector: 'app-consultant-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, PaginationComponent, ProjectWizardComponent, LoadingComponent, FooterComponent],
  templateUrl: './consultant-dashboard.component.html',
  styles: []
})
export class ConsultantDashboardComponent implements OnInit {
  private projectsService = inject(ProjectsService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private confirmationService = inject(ConfirmationService);

  // State
  showWizard = signal(false); // Controls Wizard visibility
  showProjectDetail = signal(false); // Controls Project Detail visibility
  searchQuery = signal('');
  selectedStatus = signal<ProjectStatus | null>(null);
  selectedViability = signal<ViabilityScenario | null>(null);
  selectedProject = signal<Project | null>(null);
  projectTeam = signal<any>(null);
  isLoading = signal(false);
  isLoadingTeam = signal(false);

  // Pagination State
  currentPage = signal(1);
  pageSize = signal(10);
  totalItems = signal(0);

  // Data
  projects = signal<Project[]>([]);

  // Viability Status Options
  viabilityOptions = Object.values(ViabilityScenario);
  ViabilityScenario = ViabilityScenario; 

  constructor() {
    // React to filter changes to reset pagination and reload
    effect(() => {
      const query = this.searchQuery();
      const status = this.selectedStatus();
      const viability = this.selectedViability();
      
      this.currentPage.set(1);
      this.loadProjects();
    }, { allowSignalWrites: true });
  }

  ngOnInit() {
    // Initial load handled by effect
  }

  loadProjects() {
    this.isLoading.set(true);
    // ProjectsService automatically filters by user's role (CONSULTA)
    // Returns only projects created by user or where user is team member
    this.projectsService.getProjects(
      this.currentPage(), 
      this.pageSize(), 
      this.searchQuery(),
      this.selectedStatus() || undefined,
      this.selectedViability() || undefined
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

  loadProjectTeam(projectId: string) {
    this.isLoadingTeam.set(true);
    this.projectsService.getProjectTeam(projectId).subscribe({
      next: (team) => {
        this.projectTeam.set(team);
        this.isLoadingTeam.set(false);
      },
      error: (err) => {
        console.error('Error loading project team', err);
        this.isLoadingTeam.set(false);
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
      this.selectedProject.set(null); // Reset selection
      this.loadProjects();
    }
  }

  toggleProjectDetail(show: boolean, project?: Project) {
    this.showProjectDetail.set(show);
    if (show && project) {
      this.selectedProject.set(project);
      this.loadProjectTeam(project.id);
    } else {
      this.selectedProject.set(null);
      this.projectTeam.set(null);
    }
  }

  createProject() {
    this.selectedProject.set(null);
    this.toggleWizard(true);
  }

  viewProject(project: Project) {
    this.toggleProjectDetail(true, project);
  }

  filterByStatus(status: ProjectStatus | null) {
    this.selectedStatus.set(status);
  }

  filterByViability(viability: ViabilityScenario | null) {
    this.selectedViability.set(viability);
  }

  getViabilityLabel(viability: ViabilityScenario): string {
    switch (viability) {
      case 'HABILITADO':
        return 'Habilitado';
      case 'PRE_HABILITADO':
        return 'Pre-habilitado';
      case 'ALTA_POSIBILIDAD':
        return 'Alta Posibilidad';
      case 'SIN_POSIBILIDAD':
        return 'Sin Posibilidad';
      default:
        return viability;
    }
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}

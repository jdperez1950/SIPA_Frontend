import { Component, computed, inject, signal, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ProjectsService } from '../../../../core/services/projects.service';
import { Project, ProjectStatus, ViabilityScenario } from '../../../../core/models/domain.models';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';
import { LoadingComponent } from '../../../../shared/components/loading/loading.component';
import { FooterComponent } from '../../../../shared/components/footer/footer.component';
import { AuthService } from '../../../../core/auth/services/auth.service';

@Component({
  selector: 'app-organization-dashboard-panel',
  standalone: true,
  imports: [CommonModule, FormsModule, PaginationComponent, LoadingComponent, FooterComponent],
  templateUrl: './organization-dashboard-panel.component.html',
  styles: []
})
export class OrganizationDashboardPanelComponent implements OnInit {
  private projectsService = inject(ProjectsService);
  private authService = inject(AuthService);
  private router = inject(Router);

  searchQuery = signal('');
  selectedStatus = signal<ProjectStatus | null>(null);
  selectedViability = signal<ViabilityScenario | null>(null);
  selectedProject = signal<Project | null>(null);
  projectTeam = signal<any>(null);
  isLoading = signal(false);
  isLoadingTeam = signal(false);
  currentPage = signal(1);
  pageSize = signal(10);
  totalItems = signal(0);
  projects = signal<Project[]>([]);

  viabilityOptions = Object.values(ViabilityScenario);
  ViabilityScenario = ViabilityScenario;

  constructor() {
    effect(() => {
      const query = this.searchQuery();
      const status = this.selectedStatus();
      const viability = this.selectedViability();
      this.currentPage.set(1);
      this.loadProjects();
    }, { allowSignalWrites: true });
  }

  ngOnInit() {}

  loadProjects() {
    this.isLoading.set(true);
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

  toggleProjectDetail(show: boolean, project?: Project) {
    if (show && project) {
      this.selectedProject.set(project);
      this.loadProjectTeam(project.id);
    } else {
      this.selectedProject.set(null);
      this.projectTeam.set(null);
    }
  }

  viewProject(project: Project) {
    this.toggleProjectDetail(true, project);
  }

  fillSurvey(project: Project) {
    this.router.navigate(['/workspace/project', project.id, 'question/q1']);
  }

  filterByStatus(status: ProjectStatus | null) {
    this.selectedStatus.set(status);
  }

  filterByViability(viability: ViabilityScenario | null) {
    this.selectedViability.set(viability);
  }

  getViabilityLabel(viability: ViabilityScenario | undefined): string {
    if (!viability) return '-';
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

  formatCurrency(value: number | undefined): string {
    if (value === undefined || value === null) return '-';
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}

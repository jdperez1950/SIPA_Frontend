import { Component, computed, inject, signal, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminDataService } from '../../../admin/services/admin-data.service';
import { Project, ProjectStatus } from '../../../../core/models/domain.models';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';
import { LoadingComponent } from '../../../../shared/components/loading/loading.component';
import { ProjectWizardComponent } from '../../../admin/pages/admin-projects-page/components/project-wizard/project-wizard.component';
import { AuthService } from '../../../../core/auth/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-consultant-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, PaginationComponent, ProjectWizardComponent, LoadingComponent],
  templateUrl: './consultant-dashboard.component.html',
  styles: []
})
export class ConsultantDashboardComponent implements OnInit {
  private adminDataService = inject(AdminDataService);
  private authService = inject(AuthService);
  private router = inject(Router);

  // State
  showWizard = signal(false); // Controls Wizard visibility
  searchQuery = signal('');
  selectedStatus = signal<ProjectStatus | null>(null);
  selectedProject = signal<Project | null>(null);
  isLoading = signal(false);

  // Pagination State
  currentPage = signal(1);
  pageSize = signal(10);
  totalItems = signal(0);

  // Data
  projects = signal<Project[]>([]);

  constructor() {
    // React to filter changes to reset pagination and reload
    effect(() => {
      const query = this.searchQuery();
      const status = this.selectedStatus();
      
      this.currentPage.set(1);
      this.loadProjects();
    }, { allowSignalWrites: true });
  }

  ngOnInit() {
    // Initial load handled by effect
  }

  loadProjects() {
    this.isLoading.set(true);
    // In a real app, we might filter by the consultant's assignments or organization
    // For now, we fetch all (or maybe filtered by what the backend returns for this user)
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
      this.selectedProject.set(null); // Reset selection
      this.loadProjects();
    }
  }

  createProject() {
    this.selectedProject.set(null);
    this.toggleWizard(true);
  }

  filterByStatus(status: ProjectStatus | null) {
    this.selectedStatus.set(status);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}

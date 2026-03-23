import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ProjectsService } from '../../../../core/services/projects.service';
import { Project, ProjectStatus, ViabilityScenario } from '../../../../core/models/domain.models';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';
import { LoadingComponent } from '../../../../shared/components/loading/loading.component';
import { FooterComponent } from '../../../../shared/components/footer/footer.component';
import { ExpandableTableComponent, TableColumn } from '../../../../shared/components/expandable-table/expandable-table.component';
import { AuthService } from '../../../../core/auth/services/auth.service';
import { ParametroBaseService } from '../../../../core/services/parametro-base.service';
import { IndicatorsDashboardComponent } from '../../../../shared/components/indicators-dashboard/indicators-dashboard.component';

@Component({
  selector: 'app-admin-dashboard-page',
  standalone: true,
  imports: [CommonModule, FormsModule, PaginationComponent, LoadingComponent, FooterComponent, ExpandableTableComponent, IndicatorsDashboardComponent],
  templateUrl: './admin-dashboard.component.html',
  styles: []
})
export class AdminDashboardPageComponent {
  private projectsService = inject(ProjectsService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private parametroBaseService = inject(ParametroBaseService);
  private parametroNombreCache = new Map<string, string>();

  searchQuery = signal('');
  selectedStatus = signal<ProjectStatus | null>(null);
  selectedViability = signal<ViabilityScenario | null>(null);
  selectedProject = signal<Project | null>(null);
  showProjectDetail = signal(false);
  projectTeam = signal<any>(null);
  isLoading = signal(false);
  isLoadingTeam = signal(false);
  currentPage = signal(1);
  pageSize = signal(10);
  totalItems = signal(0);
  projects = signal<Project[]>([]);
  terrenoDisplayName = signal<string | null>(null);
  financiacionDisplayName = signal<string | null>(null);
  isResolvingTerreno = signal(false);
  isResolvingFinanciacion = signal(false);

  viabilityOptions = Object.values(ViabilityScenario);
  ViabilityScenario = ViabilityScenario;

  projectColumns: TableColumn[] = [
    { header: 'Código', field: 'code', type: 'text' },
    { header: 'Descripción', field: 'description', type: 'custom' },
    { header: 'Organización', field: 'organizationName', type: 'custom' },
    { header: 'Estado', field: 'status', type: 'status' },
    { header: 'Viabilidad', field: 'viabilityStatus', type: 'viability' }
  ];

  // Mock Data for KPI Cards
  kpiData = [
    { 
      title: 'Proyectos Activos', 
      value: '124', 
      trend: '+12%', 
      trendUp: true,
      icon: 'folder_managed',
      colorClass: 'text-blue-600',
      bgClass: 'bg-blue-50'
    },
    { 
      title: 'Sin Asesor', 
      value: '8', 
      trend: 'Requiere Atención', 
      trendUp: false,
      icon: 'warning',
      colorClass: 'text-orange-600',
      bgClass: 'bg-orange-50'
    },
    { 
      title: 'Usuarios Activos', 
      value: '45', 
      trend: '+5', 
      trendUp: true,
      icon: 'group',
      colorClass: 'text-green-600',
      bgClass: 'bg-green-50'
    }
  ];

  // Mock Data for Activity Feed
  recentActivity = [
    { user: 'Juan Pérez', action: 'validó proyecto', target: 'Vivienda Social 2024', time: 'Hace 2 horas' },
    { user: 'Maria Garcia', action: 'asignó asesor a', target: 'Puente Norte', time: 'Hace 4 horas' },
    { user: 'Sistema', action: 'alerta generada', target: 'Plazo vencido en Proy-003', time: 'Hace 5 horas' },
  ];

  ngOnInit() {
    this.loadProjects();
  }

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

  onSearchChange(value: string) {
    this.searchQuery.set(value);
    this.currentPage.set(1);
    this.loadProjects();
  }

  toggleProjectDetail(show: boolean, project?: Project) {
    if (show && project) {
      this.showProjectDetail.set(true);
      this.selectedProject.set(project);
      this.resolveProjectParametroNames(project);
      this.loadProjectTeam(project.id);
    } else {
      this.showProjectDetail.set(false);
      this.selectedProject.set(null);
      this.projectTeam.set(null);
      this.terrenoDisplayName.set(null);
      this.financiacionDisplayName.set(null);
      this.isResolvingTerreno.set(false);
      this.isResolvingFinanciacion.set(false);
    }
  }

  filterByStatus(status: ProjectStatus | null) {
    this.selectedStatus.set(status);
    this.currentPage.set(1);
    this.loadProjects();
  }

  filterByViability(viability: ViabilityScenario | null) {
    this.selectedViability.set(viability);
    this.currentPage.set(1);
    this.loadProjects();
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

  getDisplayMunicipality(project: Project): string {
    if (!project) return '-';
    if (project.municipality && project.state) {
      return `${project.municipality}, ${project.state}`;
    }
    if (project.municipality) return project.municipality;
    if (project.state) return project.state;
    return '-';
  }

  getOrganizationName(project: Project): string {
    if (!project) return '-';
    if (project.organizationName && project.organizationName !== 'Sin organización') return project.organizationName;
    if (typeof project.organization === 'object' && project.organization?.name) {
      return project.organization.name;
    }
    if (typeof project.organization === 'string' && project.organization !== 'Sin organización') {
      return project.organization;
    }
    return '-';
  }

  getProjectDescription(project: Project): string {
    const source = project?.description?.trim() || '-';
    if (source === '-') return source;
    return source.length > 40 ? `${source.slice(0, 40)}...` : source;
  }

  getFullProjectDescription(project: Project): string {
    return project?.description?.trim() || '-';
  }

  getParametroDisplay(value: any): string {
    if (!value) return '-';
    if (typeof value === 'string') {
      const normalized = value.trim();
      return normalized ? normalized : '-';
    }
    const candidate =
      value.nombre ||
      value.name ||
      value.codigo ||
      value.code ||
      value.id;
    if (typeof candidate === 'string') {
      const normalized = candidate.trim();
      return normalized ? normalized : '-';
    }
    return '-';
  }

  getTerrenoDisplay(project: Project): string {
    if (!project) return '-';
    if (this.terrenoDisplayName()) return this.terrenoDisplayName() as string;
    if (this.isResolvingTerreno()) return 'Cargando...';
    return this.getParametroDisplay(project.tieneTerreno);
  }

  getFinanciacionDisplay(project: Project): string {
    if (!project) return '-';
    if (this.financiacionDisplayName()) return this.financiacionDisplayName() as string;
    if (this.isResolvingFinanciacion()) return 'Cargando...';
    return this.getParametroDisplay(project.tieneFinanciacion);
  }

  getOrganizationIdentifier(project: Project): string {
    const identifier = project?.organization?.identifier;
    if (typeof identifier === 'string' && identifier.trim()) return identifier;
    return '-';
  }

  getDisplayDate(date?: string): string {
    if (!date) return '-';
    return new Intl.DateTimeFormat('es-CO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(new Date(date));
  }

  private resolveProjectParametroNames(project: Project) {
    this.resolveParametroName(project?.tieneTerreno, 'terreno');
    this.resolveParametroName(project?.tieneFinanciacion, 'financiacion');
  }

  private resolveParametroName(value: any, type: 'terreno' | 'financiacion') {
    const parsed = this.parseParametroValue(value);
    if (!parsed.id) {
      this.applyResolvedName(type, parsed.fallbackName);
      this.setParametroLoading(type, false);
      return;
    }

    if (parsed.fallbackName && parsed.fallbackName !== parsed.id) {
      this.applyResolvedName(type, parsed.fallbackName);
      this.setParametroLoading(type, false);
      return;
    }

    const cachedName = this.parametroNombreCache.get(parsed.id);
    if (cachedName) {
      this.applyResolvedName(type, cachedName);
      this.setParametroLoading(type, false);
      return;
    }

    this.applyResolvedName(type, null);
    this.setParametroLoading(type, true);
    const parametroId = parsed.id;
    this.parametroBaseService.getById(parametroId).subscribe((parametro) => {
      const resolvedName = parametro?.nombre?.trim() || parametroId;
      this.parametroNombreCache.set(parametroId, resolvedName);
      this.applyResolvedName(type, resolvedName);
      this.setParametroLoading(type, false);
    });
  }

  private parseParametroValue(value: any): { id: string | null; fallbackName: string | null } {
    if (!value) return { id: null, fallbackName: null };
    if (typeof value === 'string') {
      const normalized = value.trim();
      return { id: normalized || null, fallbackName: normalized || null };
    }

    const idValue = typeof value.id === 'string' ? value.id.trim() : '';
    const fallbackCandidate = [value.nombre, value.name, value.codigo, value.code, value.id]
      .find(item => typeof item === 'string' && item.trim());
    const fallbackName = typeof fallbackCandidate === 'string' ? fallbackCandidate.trim() : null;

    return {
      id: idValue || null,
      fallbackName
    };
  }

  private applyResolvedName(type: 'terreno' | 'financiacion', name: string | null) {
    if (type === 'terreno') {
      this.terrenoDisplayName.set(name);
      return;
    }
    this.financiacionDisplayName.set(name);
  }

  private setParametroLoading(type: 'terreno' | 'financiacion', loading: boolean) {
    if (type === 'terreno') {
      this.isResolvingTerreno.set(loading);
      return;
    }
    this.isResolvingFinanciacion.set(loading);
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

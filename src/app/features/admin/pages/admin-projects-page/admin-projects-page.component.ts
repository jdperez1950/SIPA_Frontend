import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Project {
  id: string;
  code: string;
  organization: string;
  municipality: string;
  status: 'ACTIVO' | 'SUSPENDIDO' | 'CERTIFICADO' | 'BENEFICIADO';
  viabilityStatus: 'HABILITADO' | 'PRE_HABILITADO' | 'SIN_POSIBILIDAD';
  axesProgress: {
    technical: number; // 0-4 (Steps)
    legal: number;
    financial: number;
    social: number;
  };
  advisor?: {
    id: string;
    name: string;
  };
}

@Component({
  selector: 'app-admin-projects-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-projects-page.component.html',
  styles: []
})
export class AdminProjectsPageComponent {
  // State
  searchQuery = signal('');
  selectedStatus = signal<string | null>(null);
  showAssignModal = signal<boolean>(false);
  selectedProject = signal<Project | null>(null);

  // Mock Data
  projects = signal<Project[]>([
    {
      id: '1',
      code: 'VIV-2024-001',
      organization: 'Asoc. Vivienda Digna',
      municipality: 'Guatemala',
      status: 'ACTIVO',
      viabilityStatus: 'HABILITADO',
      axesProgress: { technical: 3, legal: 2, financial: 1, social: 4 },
      advisor: { id: '2', name: 'Carlos Ruiz' }
    },
    {
      id: '2',
      code: 'VIV-2024-004',
      organization: 'Comunidad Esperanza',
      municipality: 'Mixco',
      status: 'ACTIVO',
      viabilityStatus: 'PRE_HABILITADO',
      axesProgress: { technical: 1, legal: 1, financial: 0, social: 2 }
    },
    {
      id: '3',
      code: 'VIV-2024-012',
      organization: 'Fundación Techo Seguro',
      municipality: 'Villa Nueva',
      status: 'SUSPENDIDO',
      viabilityStatus: 'SIN_POSIBILIDAD',
      axesProgress: { technical: 0, legal: 0, financial: 0, social: 0 }
    },
    {
      id: '4',
      code: 'VIV-2024-015',
      organization: 'Coop. Unión y Fuerza',
      municipality: 'Escuintla',
      status: 'CERTIFICADO',
      viabilityStatus: 'HABILITADO',
      axesProgress: { technical: 4, legal: 4, financial: 4, social: 4 },
      advisor: { id: '5', name: 'María Gómez' }
    }
  ]);

  // Mock Advisors for Modal
  availableAdvisors = [
    { id: '2', name: 'Carlos Ruiz', workload: 80, recommended: false },
    { id: '5', name: 'María Gómez', workload: 100, recommended: false },
    { id: '8', name: 'Roberto Díaz', workload: 30, recommended: true }, // Smart suggestion
  ];

  // Computed
  filteredProjects = computed(() => {
    const query = this.searchQuery().toLowerCase();
    const status = this.selectedStatus();
    
    return this.projects().filter(p => {
      const matchesSearch = p.organization.toLowerCase().includes(query) || p.code.toLowerCase().includes(query);
      const matchesStatus = status ? p.status === status : true;
      return matchesSearch && matchesStatus;
    });
  });

  // Actions
  filterByStatus(status: string | null) {
    this.selectedStatus.set(status);
  }

  openAssignModal(project: Project) {
    this.selectedProject.set(project);
    this.showAssignModal.set(true);
  }

  closeAssignModal() {
    this.showAssignModal.set(false);
    this.selectedProject.set(null);
  }

  assignAdvisor(advisor: any) {
    // Here we would call the API
    console.log(`Assigning ${advisor.name} to project ${this.selectedProject()?.code}`);
    
    // Optimistic update
    this.projects.update(projects => 
      projects.map(p => 
        p.id === this.selectedProject()?.id 
          ? { ...p, advisor: { id: advisor.id, name: advisor.name } } 
          : p
      )
    );
    
    this.closeAssignModal();
  }

  // Helpers
  getStatusClass(status: string): string {
    switch (status) {
      case 'ACTIVO': return 'bg-blue-100 text-blue-700';
      case 'SUSPENDIDO': return 'bg-red-100 text-red-700';
      case 'CERTIFICADO': return 'bg-green-100 text-green-700';
      case 'BENEFICIADO': return 'bg-purple-100 text-purple-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  }

  getViabilityColor(status: string): string {
    switch (status) {
      case 'HABILITADO': return 'text-green-600';
      case 'PRE_HABILITADO': return 'text-orange-500';
      case 'SIN_POSIBILIDAD': return 'text-red-500';
      default: return 'text-gray-400';
    }
  }
}

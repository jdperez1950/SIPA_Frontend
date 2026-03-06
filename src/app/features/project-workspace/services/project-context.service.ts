import { Injectable, signal, computed } from '@angular/core';
import { Project } from '../../../core/models/domain.models';

@Injectable({
  providedIn: 'root'
})
export class ProjectContextService {
  private currentProject = signal<Project | null>(null);
  private currentOrganizationName = signal<string>('');
  private currentProjectName = signal<string>('');

  setProject(project: Project) {
    this.currentProject.set(project);
    
    const orgName = project.organization?.name || project.organizationName || 'Sin organización';
    this.currentOrganizationName.set(orgName);
    
    const projName = project.description || project.name || project.code || 'Sin nombre';
    this.currentProjectName.set(projName);
  }

  get organizationName() {
    return computed(() => this.currentOrganizationName());
  }

  get projectName() {
    return computed(() => this.currentProjectName());
  }

  get project() {
    return this.currentProject.asReadonly();
  }

  clear() {
    this.currentProject.set(null);
    this.currentOrganizationName.set('');
    this.currentProjectName.set('');
  }
}

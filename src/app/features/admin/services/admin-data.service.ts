import { Injectable, signal } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { User, Project, Organization, CreateUserDTO, UpdateUserDTO, CreateProjectDTO, PaginatedResponse } from '../../../core/models/domain.models';
import { USERS_MOCK } from '../../../core/data/mock/users.mock';
import { PROJECTS_MOCK } from '../../../core/data/mock/projects.mock';
import { ORGANIZATIONS_MOCK } from '../../../core/data/mock/organizations.mock';

@Injectable({
  providedIn: 'root'
})
export class AdminDataService {
  // State Signals (acting as cache/store)
  private users = signal<User[]>(USERS_MOCK);
  private projects = signal<Project[]>(PROJECTS_MOCK);
 //private projects = signal<Project[]>([]);
  private organizations = signal<Organization[]>(ORGANIZATIONS_MOCK);

  constructor() {}

  // --- Users Methods ---

  getUsers(page: number = 1, pageSize: number = 10, query: string = ''): Observable<PaginatedResponse<User>> {
    let data = this.users();

    // Filter
    if (query) {
      const q = query.toLowerCase();
      data = data.filter(u => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
    }

    // Pagination
    const totalItems = data.length;
    const totalPages = Math.ceil(totalItems / pageSize);
    const startIndex = (page - 1) * pageSize;
    const paginatedData = data.slice(startIndex, startIndex + pageSize);

    return of({
      data: paginatedData,
      meta: {
        totalItems,
        itemCount: paginatedData.length,
        itemsPerPage: pageSize,
        totalPages,
        currentPage: page
      }
    }).pipe(delay(500)); // Simulate API delay
  }

  // Legacy support if needed, but prefer paginated
  getAllUsers(): Observable<User[]> {
    return of(this.users()).pipe(delay(500));
  }

  createUser(dto: CreateUserDTO): Observable<User> {
    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      ...dto,
      projectsAssigned: 0,
      avatarColor: this.getRandomAvatarColor()
    };
    
    this.users.update(current => [...current, newUser]);
    return of(newUser).pipe(delay(500));
  }

  updateUser(dto: UpdateUserDTO): Observable<User> {
    let updatedUser: User | undefined;
    
    this.users.update(current => current.map(u => {
      if (u.id === dto.id) {
        updatedUser = { ...u, ...dto };
        return updatedUser;
      }
      return u;
    }));

    if (!updatedUser) throw new Error('User not found');
    return of(updatedUser).pipe(delay(500));
  }

  toggleUserStatus(id: string): Observable<User> {
    let updatedUser: User | undefined;
    
    this.users.update(current => current.map(u => {
      if (u.id === id) {
        updatedUser = { ...u, status: u.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' };
        return updatedUser;
      }
      return u;
    }));

    if (!updatedUser) throw new Error('User not found');
    return of(updatedUser).pipe(delay(300));
  }

  // --- Projects Methods ---

  getProjects(page: number = 1, pageSize: number = 10, query: string = '', status: string | null = null): Observable<PaginatedResponse<Project>> {
    let data = this.projects();

    if (query) {
      const q = query.toLowerCase();
      data = data.filter(p => p.code.toLowerCase().includes(q) || p.organization.toLowerCase().includes(q));
    }

    if (status) {
      data = data.filter(p => p.status === status);
    }

    const totalItems = data.length;
    const totalPages = Math.ceil(totalItems / pageSize);
    const startIndex = (page - 1) * pageSize;
    const paginatedData = data.slice(startIndex, startIndex + pageSize);

    return of({
      data: paginatedData,
      meta: {
        totalItems,
        itemCount: paginatedData.length,
        itemsPerPage: pageSize,
        totalPages,
        currentPage: page
      }
    }).pipe(delay(500));
  }

  createProject(dto: CreateProjectDTO): Observable<Project> {
    const newProject: Project = {
      id: Math.random().toString(36).substr(2, 9),
      code: `PRJ-2026-${Math.floor(Math.random() * 1000)}`, // Auto-generated
      ...dto,
      progress: { technical: 0, legal: 0, financial: 0, social: 0 }
    };

    this.projects.update(current => [...current, newProject]);
    return of(newProject).pipe(delay(500));
  }

  assignAdvisor(projectId: string, advisor: { id: string, name: string }): Observable<Project> {
    let updatedProject: Project | undefined;

    this.projects.update(current => current.map(p => {
      if (p.id === projectId) {
        updatedProject = { ...p, advisor };
        return updatedProject;
      }
      return p;
    }));

    if (!updatedProject) throw new Error('Project not found');
    return of(updatedProject).pipe(delay(300));
  }

  // --- Organizations Methods ---

  getOrganizations(page: number = 1, pageSize: number = 10, query: string = ''): Observable<PaginatedResponse<Organization>> {
    let data = this.organizations();

    if (query) {
      const q = query.toLowerCase();
      data = data.filter(o => 
        o.name.toLowerCase().includes(q) || 
        o.identifier.includes(q) || 
        o.email.toLowerCase().includes(q)
      );
    }

    const totalItems = data.length;
    const totalPages = Math.ceil(totalItems / pageSize);
    const startIndex = (page - 1) * pageSize;
    const paginatedData = data.slice(startIndex, startIndex + pageSize);

    return of({
      data: paginatedData,
      meta: {
        totalItems,
        itemCount: paginatedData.length,
        itemsPerPage: pageSize,
        totalPages,
        currentPage: page
      }
    }).pipe(delay(500));
  }

  resetOrganizationPassword(id: string): Observable<boolean> {
    // In a real app, this would trigger a backend process
    // Here we just verify the organization exists
    const org = this.organizations().find(o => o.id === id);
    if (!org) throw new Error('Organization not found');
    return of(true).pipe(delay(500));
  }

  // Helpers
  private getRandomAvatarColor(): string {
    const colors = [
      'bg-purple-100 text-purple-700',
      'bg-green-100 text-green-700',
      'bg-blue-100 text-blue-700',
      'bg-orange-100 text-orange-700',
      'bg-pink-100 text-pink-700'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }
}

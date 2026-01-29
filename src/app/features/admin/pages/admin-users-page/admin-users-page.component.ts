import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { AlertService } from '../../../../core/services/alert.service';

interface AdminUser {
  id: string;
  name: string;
  role: 'ADMIN' | 'ASESOR' | 'SPAT' | 'CONSULTA';
  email: string;
  projectsAssigned?: number;
  maxProjects?: number;
  status: 'ACTIVE' | 'INACTIVE';
  avatarColor: string;
}

@Component({
  selector: 'app-admin-users-page',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './admin-users-page.component.html',
  styles: []
})
export class AdminUsersPageComponent {
  private alertService = inject(AlertService);

  // Filters State
  searchQuery = signal('');
  selectedRole = signal<string | null>(null);
  
  // Modal State
  showModal = signal(false);
  isEditing = signal(false);
  currentUserId = signal<string | null>(null);

  // Form
  userForm = new FormGroup({
    name: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    email: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
    role: new FormControl<'ADMIN' | 'ASESOR' | 'SPAT' | 'CONSULTA'>('ASESOR', { nonNullable: true, validators: [Validators.required] }),
    status: new FormControl<'ACTIVE' | 'INACTIVE'>('ACTIVE', { nonNullable: true })
  });

  // Mock Data
  users = signal<AdminUser[]>([
    { id: '1', name: 'Ana Martínez', role: 'ADMIN', email: 'ana.martinez@sipa.gob', status: 'ACTIVE', avatarColor: 'bg-purple-100 text-purple-700' },
    { id: '2', name: 'Carlos Ruiz', role: 'ASESOR', email: 'carlos.ruiz@sipa.gob', projectsAssigned: 8, maxProjects: 10, status: 'ACTIVE', avatarColor: 'bg-green-100 text-green-700' },
    { id: '3', name: 'Lucía Fernández', role: 'SPAT', email: 'lucia.f@sipa.gob', projectsAssigned: 3, maxProjects: 15, status: 'ACTIVE', avatarColor: 'bg-blue-100 text-blue-700' },
    { id: '4', name: 'Jorge Trejo', role: 'CONSULTA', email: 'jorge.trejo@muni.gob', status: 'INACTIVE', avatarColor: 'bg-gray-100 text-gray-600' },
    { id: '5', name: 'María Gómez', role: 'ASESOR', email: 'maria.gomez@sipa.gob', projectsAssigned: 10, maxProjects: 10, status: 'ACTIVE', avatarColor: 'bg-green-100 text-green-700' },
  ]);

  // Computed Filtered Users
  filteredUsers = computed(() => {
    const query = this.searchQuery().toLowerCase();
    const role = this.selectedRole();
    
    return this.users().filter(user => {
      const matchesSearch = user.name.toLowerCase().includes(query) || user.email.toLowerCase().includes(query);
      const matchesRole = role ? user.role === role : true;
      return matchesSearch && matchesRole;
    });
  });

  // Actions
  filterByRole(role: string | null) {
    this.selectedRole.set(role);
  }

  openCreateModal() {
    this.isEditing.set(false);
    this.currentUserId.set(null);
    this.userForm.reset({ role: 'ASESOR', status: 'ACTIVE' });
    this.showModal.set(true);
  }

  openEditModal(user: AdminUser) {
    this.isEditing.set(true);
    this.currentUserId.set(user.id);
    this.userForm.patchValue({
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status
    });
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
    this.userForm.reset();
  }

  saveUser() {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }

    const formData = this.userForm.getRawValue();

    if (this.isEditing()) {
      // Update
      this.users.update(users => users.map(u => 
        u.id === this.currentUserId() 
          ? { ...u, ...formData } 
          : u
      ));
      this.alertService.success(`Usuario ${formData.name} actualizado correctamente.`);
    } else {
      // Create
      const newUser: AdminUser = {
        id: Math.random().toString(36).substr(2, 9),
        ...formData,
        projectsAssigned: 0,
        maxProjects: 10,
        avatarColor: 'bg-gray-100 text-gray-700' // Randomize or default
      };
      this.users.update(users => [...users, newUser]);
      this.alertService.success(`Usuario ${formData.name} creado correctamente.`);
    }
    this.closeModal();
  }

  toggleUserStatus(user: AdminUser) {
    const newStatus = user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    this.users.update(users => users.map(u => 
      u.id === user.id ? { ...u, status: newStatus } : u
    ));
    const action = newStatus === 'ACTIVE' ? 'activado' : 'desactivado';
    const type = newStatus === 'ACTIVE' ? 'success' : 'warning';
    this.alertService.show(type, `Usuario ${user.name} ha sido ${action}.`);
  }

  resetPassword(user: AdminUser) {
    // Mock API call
    this.alertService.info(`Se ha enviado un correo de restablecimiento a ${user.email}.`);
  }

  getRoleBadgeClass(role: string): string {
    switch (role) {
      case 'ADMIN': return 'bg-purple-50 text-purple-700 border-purple-100';
      case 'ASESOR': return 'bg-green-50 text-green-700 border-green-100';
      case 'SPAT': return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'CONSULTA': return 'bg-gray-50 text-gray-700 border-gray-100';
      default: return 'bg-gray-50 text-gray-700';
    }
  }

  getWorkloadColor(current: number, max: number): string {
    const percentage = (current / max) * 100;
    if (percentage >= 100) return 'bg-red-500';
    if (percentage >= 80) return 'bg-orange-500';
    return 'bg-green-500';
  }
}

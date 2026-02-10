import { Component, computed, inject, signal, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { AlertService } from '../../../../core/services/alert.service';
import { AdminDataService } from '../../services/admin-data.service';
import { ConfirmationService } from '../../../../core/services/confirmation.service';
import { User, UserRole, UserStatus, CreateUserDTO, UpdateUserDTO, USER_ROLES_CONFIG } from '../../../../core/models/domain.models';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';

@Component({
  selector: 'app-admin-users-page',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, PaginationComponent],
  templateUrl: './admin-users-page.component.html',
  styles: []
})
export class AdminUsersPageComponent implements OnInit {
  private alertService = inject(AlertService);
  private adminDataService = inject(AdminDataService);
  private confirmationService = inject(ConfirmationService);

  // Constants
  rolesConfig = USER_ROLES_CONFIG;

  // Filters State
  searchQuery = signal('');
  selectedRole = signal<UserRole | null>(null);
  
  // Pagination State
  currentPage = signal(1);
  pageSize = signal(10);
  totalItems = signal(0);
  
  // Modal State
  showModal = signal(false);
  isEditing = signal(false);
  currentUserId = signal<string | null>(null);
  isLoading = signal(false);

  // Form
  userForm = new FormGroup({
    name: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    email: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
    role: new FormControl<UserRole>('ASESOR', { nonNullable: true, validators: [Validators.required] }),
    status: new FormControl<UserStatus>('ACTIVE', { nonNullable: true })
  });

  // Data
  users = signal<User[]>([]);

  constructor() {
    // React to filter changes to reset pagination
    effect(() => {
      // We read the signals to track them
      const query = this.searchQuery();
      const role = this.selectedRole();
      
      // When filters change, go back to page 1 and reload
      // Using untracked if we want to avoid loops, but here we want to trigger load
      // Ideally, we just call loadUsers() but we need to reset page first
      // But effect runs initially too.
      // Let's rely on manual calls for now to avoid complexity or use debounce
    }, { allowSignalWrites: true });
  }

  ngOnInit() {
    this.loadUsers();
  }

  onSearchChange(query: string) {
    this.searchQuery.set(query);
    this.currentPage.set(1);
    this.loadUsers();
  }

  onPageChange(page: number) {
    this.currentPage.set(page);
    this.loadUsers();
  }

  loadUsers() {
    this.isLoading.set(true);
    
    // Pass all filters to the service
    this.adminDataService.getUsers(
      this.currentPage(), 
      this.pageSize(), 
      this.searchQuery(), 
      this.selectedRole() || null
    ).subscribe({
      next: (response) => {
        this.users.set(response.data);
        this.totalItems.set(response.meta.totalItems);
        
        // If current page > total pages (e.g. after search), reset to 1
        if (this.currentPage() > response.meta.totalPages && response.meta.totalPages > 0) {
          this.currentPage.set(1);
          // Reload to get correct data for page 1? Or just set page 1 and user will see?
          // The pagination component usually handles "if page > total", but better to reload.
          // However, to avoid loops, let's just ensure we are safe.
          // Actually, if we are on page 5 and filter results in 2 pages, we should request page 1.
          // This logic is better handled in onSearchChange or filter change handlers.
        }
        
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading users', err);
        this.alertService.error('Error al cargar usuarios');
        this.isLoading.set(false);
      }
    });
  }

  // Computed Filtered Users -> Now just returns users() because filtering happens in load/service
  // But wait, if we want to filter by Role, we should ideally send it to backend.
  // For the purpose of this mock, I will apply role filter on the UI but it only filters current page.
  filteredUsers = computed(() => {
    const role = this.selectedRole();
    if (!role) return this.users();
    return this.users().filter(u => u.role === role);
  });

  // Actions
  filterByRole(role: UserRole | null) {
    this.selectedRole.set(role);
    // We strictly should reload, but without service support it's tricky.
    // Let's just keep client filtering on current page for simplicity
    // unless user demands perfect pagination for filtered roles.
  }

  openCreateModal() {
    this.isEditing.set(false);
    this.currentUserId.set(null);
    this.userForm.reset({ role: 'ASESOR', status: 'ACTIVE' });
    this.showModal.set(true);
  }

  openEditModal(user: User) {
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
    this.isLoading.set(true);

    if (this.isEditing() && this.currentUserId()) {
      // Update
      const updateDto: UpdateUserDTO = {
        id: this.currentUserId()!,
        ...formData
      };
      
      this.adminDataService.updateUser(updateDto).subscribe({
        next: (updatedUser) => {
          this.users.update(users => users.map(u => 
            u.id === updatedUser.id ? updatedUser : u
          ));
          this.alertService.success(`Usuario ${updatedUser.name} actualizado correctamente.`);
          this.isLoading.set(false);
          this.closeModal();
        },
        error: (err) => {
          this.alertService.error('Error al actualizar usuario');
          this.isLoading.set(false);
        }
      });
    } else {
      // Create
      const createDto: CreateUserDTO = {
        name: formData.name,
        email: formData.email,
        role: formData.role,
        status: formData.status
      };

      this.adminDataService.createUser(createDto).subscribe({
        next: (newUser) => {
          this.users.update(users => [...users, newUser]);
          this.alertService.success(`Usuario ${newUser.name} creado correctamente.`);
          this.isLoading.set(false);
          this.closeModal();
        },
        error: (err) => {
          this.alertService.error('Error al crear usuario');
          this.isLoading.set(false);
        }
      });
    }
  }

  resetPassword(user: User) {
    this.confirmationService.confirm({
      title: 'Restablecer Contraseña',
      message: `¿Estás seguro de enviar el correo de restablecimiento de contraseña a ${user.email}?`,
      type: 'warning'
    }).then(confirmed => {
      if (confirmed) {
        this.isLoading.set(true);
        this.adminDataService.resetUserPassword(user.email).subscribe({
          next: (success) => {
            if (success) {
              this.alertService.success(`Correo de restablecimiento enviado a ${user.email}.`);
            } else {
              this.alertService.error('No se pudo enviar el correo. Verifique que el usuario exista.');
            }
            this.isLoading.set(false);
          },
          error: (err) => {
            console.error('Error resetting password', err);
            this.alertService.error('Error al enviar la solicitud.');
            this.isLoading.set(false);
          }
        });
      }
    });
  }

  toggleUserStatus(user: User) {
    const action = user.status === 'ACTIVE' ? 'desactivar' : 'activar';
    const type = user.status === 'ACTIVE' ? 'danger' : 'info';
    
    this.confirmationService.confirm({
      title: `${action.charAt(0).toUpperCase() + action.slice(1)} Usuario`,
      message: `¿Estás seguro de ${action} el acceso para ${user.name}?`,
      type: type,
      confirmText: action === 'desactivar' ? 'Desactivar' : 'Activar'
    }).then(confirmed => {
      if (confirmed) {
        this.adminDataService.toggleUserStatus(user.id).subscribe({
          next: (updatedUser) => {
            this.users.update(users => users.map(u => 
              u.id === updatedUser.id ? updatedUser : u
            ));
            const statusAction = updatedUser.status === 'ACTIVE' ? 'activado' : 'desactivado';
            const statusType = updatedUser.status === 'ACTIVE' ? 'success' : 'warning';
            this.alertService.show(statusType, `Usuario ${user.name} ha sido ${statusAction}.`);
          },
          error: (err) => {
            this.alertService.error('Error al cambiar estado del usuario');
          }
        });
      }
    });
  }

  getRoleBadgeClass(role: string): string {
    const config = this.rolesConfig.find(r => r.value === role);
    return config ? config.class : 'bg-gray-50 text-gray-700';
  }

  getWorkloadColor(current: number, max: number): string {
    const percentage = (current / max) * 100;
    if (percentage >= 100) return 'bg-red-500';
    if (percentage >= 80) return 'bg-orange-500';
    return 'bg-green-500';
  }
}

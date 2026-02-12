import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminLayoutService } from '../../../services/admin-layout.service';
import { AuthService } from '../../../../../core/auth/services/auth.service';
import { ConfirmationService } from '../../../../../core/services/confirmation.service';
import { Router } from '@angular/router';
import { USER_ROLES_CONFIG } from '../../../../../core/models/domain.models';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './topbar.component.html',
  styles: []
})
export class TopbarComponent {
  layoutService = inject(AdminLayoutService);
  authService = inject(AuthService);
  confirmationService = inject(ConfirmationService);
  router = inject(Router);
  
  isProfileMenuOpen = signal(false);

  userInitials = computed(() => {
    const user = this.authService.currentUser();
    if (!user || !user.name) return 'U';
    
    return user.name
      .split(' ')
      .map(n => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  });

  userRoleLabel = computed(() => {
    const user = this.authService.currentUser();
    if (!user) return '';
    
    const roleConfig = USER_ROLES_CONFIG.find(r => r.value === user.role);
    return roleConfig ? roleConfig.label : user.role;
  });

  toggleProfileMenu() {
    this.isProfileMenuOpen.update(v => !v);
  }

  logout() {
    this.confirmationService.confirm({
      title: 'Cerrar Sesión',
      message: '¿Estás seguro de que deseas salir del sistema?',
      type: 'warning',
      confirmText: 'Salir'
    }).then(confirmed => {
      if (confirmed) {
        this.authService.logout();
        this.router.navigate(['/auth/login']);
        this.isProfileMenuOpen.set(false);
      }
    });
  }
}

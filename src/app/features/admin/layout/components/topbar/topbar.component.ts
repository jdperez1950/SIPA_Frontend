import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminLayoutService } from '../../../services/admin-layout.service';
import { AuthService } from '../../../../../core/auth/services/auth.service';
import { ConfirmationService } from '../../../../../core/services/confirmation.service';
import { Router } from '@angular/router';

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

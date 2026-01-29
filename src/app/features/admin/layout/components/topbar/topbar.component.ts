import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminLayoutService } from '../../../services/admin-layout.service';
import { AuthService } from '../../../../../core/auth/services/auth.service';
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
  router = inject(Router);

  logout() {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}

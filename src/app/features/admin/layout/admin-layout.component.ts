import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { TopbarComponent } from './components/topbar/topbar.component';
import { AlertToastComponent } from '../../../shared/components/alert-toast/alert-toast.component';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, SidebarComponent, TopbarComponent, AlertToastComponent],
  template: `
    <div class="flex h-screen bg-gray-100 overflow-hidden font-sans">
      <a href="#main-content" class="sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 focus:z-50 focus:p-4 focus:bg-white focus:text-blue-700 focus:shadow-lg rounded-br-lg">Saltar al contenido principal</a>
      <app-alert-toast />
      <!-- Sidebar -->
      <app-sidebar />

      <!-- Main Content Wrapper -->
      <div class="flex-1 flex flex-col min-w-0">
        <!-- Topbar -->
        <app-topbar />

        <!-- Main Content Area -->
        <main id="main-content" class="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6 relative" tabindex="-1">
          <router-outlet />
        </main>
      </div>
    </div>
  `,
  styles: []
})
export class AdminLayoutComponent {}

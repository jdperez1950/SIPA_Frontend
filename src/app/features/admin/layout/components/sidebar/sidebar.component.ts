import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AdminLayoutService } from '../../../services/admin-layout.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styles: []
})
export class SidebarComponent {
  layoutService = inject(AdminLayoutService);
  
  menuItems = [
    { label: 'Dashboard', icon: 'dashboard', route: '/admin/dashboard' },
    { label: 'Usuarios', icon: 'group', route: '/admin/users' },
    { label: 'Proyectos', icon: 'folder_open', route: '/admin/projects' },
    { label: 'Catálogos', icon: 'settings', route: '/admin/settings' },
    { label: 'Reportes', icon: 'bar_chart', route: '/admin/reports' },
  ];
}

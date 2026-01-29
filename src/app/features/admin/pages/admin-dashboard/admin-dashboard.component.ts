import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-dashboard-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-dashboard.component.html',
  styles: []
})
export class AdminDashboardPageComponent {
  // Mock Data for KPI Cards
  kpiData = [
    { 
      title: 'Proyectos Activos', 
      value: '124', 
      trend: '+12%', 
      trendUp: true,
      icon: 'folder_managed',
      colorClass: 'text-blue-600',
      bgClass: 'bg-blue-50'
    },
    { 
      title: 'Sin Asesor', 
      value: '8', 
      trend: 'Requiere Atención', 
      trendUp: false,
      icon: 'warning',
      colorClass: 'text-orange-600',
      bgClass: 'bg-orange-50'
    },
    { 
      title: 'Usuarios Activos', 
      value: '45', 
      trend: '+5', 
      trendUp: true,
      icon: 'group',
      colorClass: 'text-green-600',
      bgClass: 'bg-green-50'
    }
  ];

  // Mock Data for Activity Feed
  recentActivity = [
    { user: 'Juan Pérez', action: 'validó proyecto', target: 'Vivienda Social 2024', time: 'Hace 2 horas' },
    { user: 'Maria Garcia', action: 'asignó asesor a', target: 'Puente Norte', time: 'Hace 4 horas' },
    { user: 'Sistema', action: 'alerta generada', target: 'Plazo vencido en Proy-003', time: 'Hace 5 horas' },
  ];
}

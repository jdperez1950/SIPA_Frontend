import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface StatItem {
  label: string;
  value: string | number;
  icon: string;
  trend?: string; // e.g., "+5%"
  trendDirection?: 'up' | 'down' | 'neutral';
  color?: 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'danger';
}

@Component({
  selector: 'app-dashboard-stats',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex flex-col gap-6 mb-8">
      
      <!-- Stats Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" *ngIf="stats.length > 0">
        <div *ngFor="let stat of stats" 
             class="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
          
          <!-- Decorative Background Icon -->
          <span class="material-symbols-rounded absolute -right-4 -bottom-4 text-8xl opacity-[0.03] pointer-events-none select-none">
            {{ stat.icon }}
          </span>

          <div class="flex justify-between items-start mb-2">
            <div class="p-2 rounded-lg bg-opacity-10" [ngClass]="getBgColor(stat.color)">
              <span class="material-symbols-rounded text-2xl" [ngClass]="getTextColor(stat.color)">{{ stat.icon }}</span>
            </div>
            <span *ngIf="stat.trend" 
                  class="text-xs font-medium px-2 py-1 rounded-full flex items-center gap-1"
                  [ngClass]="getTrendClass(stat.trendDirection)">
              <span class="material-symbols-rounded text-sm" *ngIf="stat.trendDirection === 'up'">trending_up</span>
              <span class="material-symbols-rounded text-sm" *ngIf="stat.trendDirection === 'down'">trending_down</span>
              {{ stat.trend }}
            </span>
          </div>
          
          <h3 class="text-2xl font-bold text-gray-900 mt-2">{{ stat.value }}</h3>
          <p class="text-sm text-gray-500 font-medium">{{ stat.label }}</p>
        </div>
      </div>

      <!-- Filters Section -->
      <div class="bg-white p-4 rounded-xl border border-gray-200 shadow-sm" *ngIf="showFilters">
        <div class="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div class="flex items-center gap-2 text-gray-700 font-medium">
                <span class="material-symbols-rounded text-gray-400">filter_alt</span>
                <span>Filtros</span>
            </div>
            
            <div class="flex-1 w-full sm:w-auto flex flex-wrap gap-3 justify-end">
                <!-- Content Projection for Custom Filters -->
                <ng-content></ng-content>
            </div>
        </div>
      </div>
    </div>
  `
})
export class DashboardStatsComponent {
  @Input() stats: StatItem[] = [];
  @Input() showFilters = true;

  getBgColor(color?: string) {
    switch (color) {
      case 'primary': return 'bg-blue-100';
      case 'secondary': return 'bg-red-100';
      case 'success': return 'bg-green-100';
      case 'warning': return 'bg-orange-100';
      case 'danger': return 'bg-red-100';
      default: return 'bg-gray-100';
    }
  }

  getTextColor(color?: string) {
    switch (color) {
      case 'primary': return 'text-blue-600';
      case 'secondary': return 'text-red-600';
      case 'success': return 'text-green-600';
      case 'warning': return 'text-orange-600';
      case 'danger': return 'text-red-600';
      default: return 'text-gray-600';
    }
  }

  getTrendClass(direction?: string) {
    switch (direction) {
      case 'up': return 'bg-green-50 text-green-700';
      case 'down': return 'bg-red-50 text-red-700';
      default: return 'bg-gray-50 text-gray-600';
    }
  }
}

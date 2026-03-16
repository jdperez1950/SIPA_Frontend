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

export interface ListItem {
  label: string;
  count: number;
  color: 'gray' | 'red' | 'orange' | 'green' | 'blue' | 'purple';
  percent?: number;
}



export interface ChipItem {
  label: string;
  count: number;
  color: 'red' | 'orange' | 'blue' | 'green';
}

export interface ChipGroup {
  title: string;
  items: ChipItem[];
}

export interface BadgeItem {
  value: number;
  percent: number;
  color?: 'green' | 'blue' | 'orange' | 'red' | 'gray';
  badgeTitle?: string;
}

export type DashboardColumn =
  | { kind: 'list'; title?: string; items: ListItem[] }
  | { kind: 'badge'; title?: string; badges: BadgeItem[] }
  | { kind: 'chips'; title?: string; groups: ChipGroup[] };

@Component({
  selector: 'app-stat-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex flex-col justify-center margin-auto">
      @for (item of items; track item.label) {
        <div class="flex items-center justify-center text-sm">
          <span class="text-gray-700 flex-1 text-right mr-2">{{ item.label }}</span>
          <span class="w-2 h-2 rounded-full" [ngClass]="dotClass(item.color)"></span>
          <span class="text-gray-900 font-medium ml-2">{{ item.count | number:'.0' }}</span>
          @if (item.percent !== undefined && item.percent !== null) {
            <span class="text-gray-500 text-xs ml-1">{{ item.percent }}%</span>
          }
        </div>
      }
    </div>
  `
})
export class StatListComponent {
  @Input() items: ListItem[] = [];
  dotClass(color: ListItem['color']) {
    switch (color) {
      case 'red': return 'bg-red-400';
      case 'orange': return 'bg-orange-400';
      case 'green': return 'bg-green-400';
      case 'blue': return 'bg-blue-400';
      case 'purple': return 'bg-purple-400';
      default: return 'bg-gray-400';
    }
  }
}

@Component({
  selector: 'app-stat-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex flex-col items-center gap-2">
      @for (badge of badges; track badge.badgeTitle ?? $index) {
        <div class="flex flex-col items-center gap-1">
          @if (badge.badgeTitle) {
            <span class="text-xs text-gray-500 font-medium">{{ badge.badgeTitle }}</span>
          }
          <div class="inline-flex items-center gap-2 px-4 py-2 rounded-lg" [ngClass]="badgeClass(badge.color ?? 'green')">
            <div class="flex items-center gap-1">
              <span class="text-white font-semibold">{{ badge.value }}</span>
              <span class="text-white text-xs">{{ badge.percent }}%</span>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class StatBadgeComponent {
  @Input() badges: BadgeItem[] = [];
  badgeClass(color: BadgeItem['color']) {
    switch (color) {
      case 'blue': return 'bg-blue-500';
      case 'orange': return 'bg-orange-500';
      case 'red': return 'bg-red-500';
      case 'gray': return 'bg-gray-500';
      default: return 'bg-green-500';
    }
  }
}

@Component({
  selector: 'app-stat-chip-groups',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="grid grid-cols-2 gap-2 w-full">
      @for (g of groups; track g.title; let idx = $index) {
        <div class="flex flex-col gap-2">
          <div class="text-xs text-gray-500 font-medium text-center border-b border-gray-100 pb-1">{{ g.title }}</div>
          <div class="flex flex-col gap-2">
            @for (c of g.items; track c.label) {
              <div class="flex items-center gap-2" [ngClass]="idx === 0 ? 'justify-end' : 'justify-start'">
                @if (idx === 0) {
                  <span class="text-gray-600 text-[10px] truncate leading-tight">{{ c.label }}</span>
                  <span class="w-5 h-5 min-w-[1.25rem] rounded-full flex items-center justify-center text-white text-[10px] font-bold shadow-sm" [ngClass]="chipClass(c.color)">
                    {{ c.count }}
                  </span>
                } @else {
                  <span class="w-5 h-5 min-w-[1.25rem] rounded-full flex items-center justify-center text-white text-[10px] font-bold shadow-sm" [ngClass]="chipClass(c.color)">
                    {{ c.count }}
                  </span>
                  <span class="text-gray-600 text-[10px] truncate leading-tight">{{ c.label }}</span>
                }
              </div>
            }
          </div>
        </div>
      }
    </div>
  `
})
export class StatChipGroupsComponent {
  @Input() groups: ChipGroup[] = [];
  chipClass(color: ChipItem['color']) {
    switch (color) {
      case 'red': return 'bg-red-500';
      case 'orange': return 'bg-orange-500';
      case 'blue': return 'bg-blue-500';
      default: return 'bg-green-500';
    }
  }
}

@Component({
  selector: 'app-dashboard-stats',
  standalone: true,
  imports: [CommonModule, StatListComponent, StatBadgeComponent, StatChipGroupsComponent],
  template: `
    <div class="flex flex-col gap-6 mb-8">

      @if (columns.length > 0) {
        <div class="bg-gray-50 p-6 rounded-xl border border-gray-200 shadow-sm">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            @for (col of columns; track $index) {
              <div class="grid grid-cols-1 justify-items-center">
                @if (col.title) {
                  <div class="text-xs text-gray-500 mb-2">{{ col.title }}</div>
                }
                @switch (col.kind) {
                  @case ('list') { <app-stat-list [items]="col.items"></app-stat-list> }
                  @case ('badge') { <app-stat-badge [badges]="col.badges"></app-stat-badge> }
                  @case ('chips') { <app-stat-chip-groups [groups]="col.groups"></app-stat-chip-groups> }
                }
              </div>
            }
          </div>
        </div>
      }

      <!-- Stats Grid -->
      <!-- @if (stats.length > 0) {
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          @for (stat of stats; track stat.label) {
            <div class="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
              <span class="material-symbols-rounded absolute -right-4 -bottom-4 text-8xl opacity-[0.03] pointer-events-none select-none">
                {{ stat.icon }}
              </span>

              <div class="flex justify-between items-start mb-2">
                <div class="p-2 rounded-lg bg-opacity-10" [ngClass]="getBgColor(stat.color)">
                  <span class="material-symbols-rounded text-2xl" [ngClass]="getTextColor(stat.color)">{{ stat.icon }}</span>
                </div>
                @if (stat.trend) {
                  <span class="text-xs font-medium px-2 py-1 rounded-full flex items-center gap-1" [ngClass]="getTrendClass(stat.trendDirection)">
                    @switch (stat.trendDirection) {
                      @case ('up') { <span class="material-symbols-rounded text-sm">trending_up</span> }
                      @case ('down') { <span class="material-symbols-rounded text-sm">trending_down</span> }
                      @default { <span class="material-symbols-rounded text-sm">trending_flat</span> }
                    }
                    {{ stat.trend }}
                  </span>
                }
              </div>
              
              <h3 class="text-2xl font-bold text-gray-900 mt-2">{{ stat.value }}</h3>
              <p class="text-sm text-gray-500 font-medium">{{ stat.label }}</p>
            </div>
          }
        </div>
      } -->

      <!-- Filters Section -->
      @if (showFilters) {
        <div class="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div class="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div class="flex items-center gap-2 text-gray-700 font-medium">
                  <span class="material-symbols-rounded text-gray-400">filter_alt</span>
                  <span>Filtros</span>
              </div>
              
              <div class="flex-1 w-full sm:w-auto flex flex-wrap gap-3 justify-end">
                  <ng-content></ng-content>
              </div>
            </div>
        </div>
      }
    </div>
  `
})
export class DashboardStatsComponent {
  @Input() stats: StatItem[] = [];
  @Input() showFilters = true;
  @Input() columns: DashboardColumn[] = [];

  getBgColor(color?: StatItem['color']): string {
    switch (color) {
      case 'primary': return 'bg-blue-100';
      case 'secondary': return 'bg-red-100';
      case 'accent': return 'bg-purple-100';
      case 'success': return 'bg-green-100';
      case 'warning': return 'bg-orange-100';
      case 'danger': return 'bg-red-100';
      default: return 'bg-gray-100';
    }
  }

  getTextColor(color?: StatItem['color']): string {
    switch (color) {
      case 'primary': return 'text-blue-600';
      case 'secondary': return 'text-red-600';
      case 'accent': return 'text-purple-600';
      case 'success': return 'text-green-600';
      case 'warning': return 'text-orange-600';
      case 'danger': return 'text-red-600';
      default: return 'text-gray-600';
    }
  }

  getTrendClass(direction?: 'up' | 'down' | 'neutral'): string {
    switch (direction) {
      case 'up': return 'bg-green-50 text-green-700';
      case 'down': return 'bg-red-50 text-red-700';
      default: return 'bg-gray-50 text-gray-600';
    }
  }
}

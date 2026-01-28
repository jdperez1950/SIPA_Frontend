import { Component, computed, input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type BadgeStatus = 'VALIDATED' | 'RETURNED' | 'PENDING' | 'DEFAULT';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './status-badge.html',
  styleUrl: './status-badge.scss',
})
export class StatusBadgeComponent {
  label = input.required<string>();
  status = input<BadgeStatus>('DEFAULT');

  badgeClasses = computed(() => {
    const base = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border';
    switch (this.status()) {
      case 'VALIDATED': return `${base} bg-green-50 text-green-700 border-green-200`;
      case 'RETURNED': return `${base} bg-red-50 text-red-700 border-red-200`;
      case 'PENDING': return `${base} bg-yellow-50 text-yellow-700 border-yellow-200`;
      default: return `${base} bg-gray-50 text-gray-700 border-gray-200`;
    }
  });
}

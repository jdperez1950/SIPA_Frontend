import { Component, computed, input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type BadgeStatus = 'VALIDATED' | 'RETURNED' | 'IN_PROCESS' | 'PENDING' | 'UNKNOWN';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './status-badge.html',
  styleUrl: './status-badge.scss',
})
export class StatusBadgeComponent {
  label = input.required<string>();
  status = input<BadgeStatus>('PENDING');

  badgeClasses = computed(() => {
    const base = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border';
    // Usando sistema de colores SIPA v2 con opacidad para mantener estilo visual de badge
    switch (this.status()) {
      case 'VALIDATED': return `${base} bg-sipa-validated/10 text-sipa-validated border-sipa-validated/20`;
      case 'RETURNED': return `${base} bg-sipa-returned/10 text-sipa-returned border-sipa-returned/20`;
      case 'IN_PROCESS': return `${base} bg-sipa-process/10 text-sipa-process border-sipa-process/20`;
      case 'PENDING': return `${base} bg-sipa-pending/10 text-sipa-pending border-sipa-pending/20`;
      case 'UNKNOWN': return `${base} bg-sipa-unknown/10 text-sipa-unknown border-sipa-unknown/20`;
      default: return `${base} bg-sipa-unknown/10 text-sipa-unknown border-sipa-unknown/20`;
    }
  });
}

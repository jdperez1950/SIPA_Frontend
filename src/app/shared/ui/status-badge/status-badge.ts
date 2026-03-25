import { Component, computed, input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type BadgeStatus = 'Validadas' | 'Devueltas' | 'Sin responder' | 'Sin validar' | 'UNKNOWN';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './status-badge.html',
  styleUrl: './status-badge.scss',
})
export class StatusBadgeComponent {
  label = input.required<string>();
  status = input<BadgeStatus>('Sin responder');

  badgeClasses = computed(() => {
    const base = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border';
    // Usando sistema de colores PAVIS con opacidad para mantener estilo visual de badge
    switch (this.status()) {
      case 'Validadas': return `${base} bg-pavis-validated/10 text-pavis-validated border-pavis-validated/20`;
      case 'Devueltas': return `${base} bg-pavis-returned/10 text-pavis-returned border-pavis-returned/20`;
      case 'Sin responder': return `${base} bg-pavis-pending/10 text-pavis-pending border-pavis-pending/20`;
      case 'Sin validar': return `${base} bg-pavis-process/10 text-pavis-process border-pavis-process/20`;
      case 'UNKNOWN': return `${base} bg-pavis-unknown/10 text-pavis-unknown border-pavis-unknown/20`;
      default: return `${base} bg-pavis-unknown/10 text-pavis-unknown border-pavis-unknown/20`;
    }
  });
}

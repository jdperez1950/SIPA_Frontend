import { Component, computed, input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type PriorityLevel = 'URGENT' | 'ALERT' | 'NORMAL';

@Component({
  selector: 'app-traffic-light',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './traffic-light.html',
  styleUrl: './traffic-light.scss',
})
export class TrafficLightComponent {
  priority = input.required<PriorityLevel>();
  
  lightClass = computed(() => {
    const base = 'w-3 h-3 rounded-full';
    switch (this.priority()) {
      case 'URGENT': return `${base} bg-sipa-urgent animate-pulse`;
      case 'ALERT': return `${base} bg-sipa-alert`;
      case 'NORMAL': return `${base} bg-sipa-normal`;
      default: return `${base} bg-sipa-normal`;
    }
  });

  tooltipText = computed(() => {
    switch (this.priority()) {
      case 'URGENT': return 'Prioridad Urgente';
      case 'ALERT': return 'Alerta';
      case 'NORMAL': return 'Normal';
      default: return 'Desconocido';
    }
  });
}

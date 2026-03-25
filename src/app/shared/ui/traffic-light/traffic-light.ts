import { Component, computed, input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type PriorityLevel = 'Urgente' | 'Alerta' | 'Importante';

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
      case 'Urgente': return `${base} bg-pavis-urgent animate-pulse`;
      case 'Alerta': return `${base} bg-pavis-alert`;
      case 'Importante': return `${base} bg-pavis-normal`;
      default: return `${base} bg-pavis-normal`;
    }
  });

  tooltipText = computed(() => {
    switch (this.priority()) {
      case 'Urgente': return 'Prioridad Urgente';
      case 'Alerta': return 'Alerta';
      case 'Importante': return 'Normal';
      default: return 'Desconocido';
    }
  });
}

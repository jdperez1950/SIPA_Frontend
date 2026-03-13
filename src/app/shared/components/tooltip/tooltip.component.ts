import { Component, input, booleanAttribute } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PAVIS_COLORS } from '../../../core/constants/theme-colors';

@Component({
  selector: 'app-tooltip',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="relative inline-block">
      <ng-content></ng-content>
      <div 
        *ngIf="visible()"
        class="absolute z-50 px-3 py-2 text-sm font-medium rounded-lg shadow-lg pointer-events-none transition-opacity duration-200"
        [class]="positionClass()"
        role="tooltip"
        [style.background-color]="backgroundColor()"
        [style.color]="textColor()"
      >
        {{ text() }}
        <div class="absolute w-2 h-2 transform rotate-45" [class]="arrowClass()" [style.background-color]="backgroundColor()"></div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: inline-block;
    }
  `]
})
export class TooltipComponent {
  text = input.required<string>();
  position = input<'top' | 'bottom' | 'left' | 'right'>('top');
  visible = input(false, { transform: booleanAttribute });
  variant = input<'dark' | 'light' | 'brand'>('dark');

  positionClass(): string {
    const positions = {
      top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
      bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
      left: 'right-full top-1/2 -translate-y-1/2 mr-2',
      right: 'left-full top-1/2 -translate-y-1/2 ml-2'
    };
    return positions[this.position()];
  }

  arrowClass(): string {
    const arrows = {
      top: 'bottom-[-4px] left-1/2 -translate-x-1/2',
      bottom: 'top-[-4px] left-1/2 -translate-x-1/2',
      left: 'right-[-4px] top-1/2 -translate-y-1/2',
      right: 'left-[-4px] top-1/2 -translate-y-1/2'
    };
    return arrows[this.position()];
  }

  backgroundColor(): string {
    const variants = {
      dark: PAVIS_COLORS.ui.darkBg,
      light: PAVIS_COLORS.ui.surface,
      brand: PAVIS_COLORS.brand.primary
    };
    return variants[this.variant()];
  }

  textColor(): string {
    const variants = {
      dark: PAVIS_COLORS.ui.textInverted,
      light: PAVIS_COLORS.ui.textMain,
      brand: PAVIS_COLORS.ui.textInverted
    };
    return variants[this.variant()];
  }
}

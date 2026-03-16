import { Component, input, booleanAttribute, inject, HostListener, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PAVIS_COLORS } from '../../../core/constants/theme-colors';
import { ElementRef } from '@angular/core';

@Component({
  selector: 'app-tooltip',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="relative inline-block" (mouseenter)="updatePosition()">
      <ng-content></ng-content>
      @if (visible()) {
        <div 
          class="fixed z-[10000] px-2.5 py-1.5 text-xs font-medium rounded-lg shadow-lg pointer-events-none transition-opacity duration-200 leading-tight"
          [class]="positionClass()"
          role="tooltip"
          [style.background-color]="backgroundColor()"
          [style.color]="textColor()"
          [style.top]="tooltipTop()"
          [style.left]="tooltipLeft()"
        >
          {{ text() }}
          <div class="absolute w-2 h-2 transform rotate-45" [class]="arrowClass()" [style.background-color]="backgroundColor()"></div>
        </div>
      }
    </div>
  `,
  styles: [`
    :host {
      display: inline-block;
    }
  `]
})
export class TooltipComponent {
  private hostElement = inject(ElementRef<HTMLElement>);

  text = input.required<string>();
  position = input<'top' | 'bottom' | 'left' | 'right'>('top');
  visible = input(false, { transform: booleanAttribute });
  variant = input<'dark' | 'light' | 'brand'>('dark');
  tooltipTop = signal('0px');
  tooltipLeft = signal('0px');

  positionClass(): string {
    const positions = {
      top: '-translate-x-1/2 -translate-y-full',
      bottom: '-translate-x-1/2',
      left: '-translate-x-full -translate-y-1/2',
      right: '-translate-y-1/2'
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

  updatePosition(): void {
    const rect = this.hostElement.nativeElement.getBoundingClientRect();
    const gap = 8;

    if (this.position() === 'top') {
      this.tooltipTop.set(`${rect.top - gap}px`);
      this.tooltipLeft.set(`${rect.left + rect.width / 2}px`);
      return;
    }

    if (this.position() === 'bottom') {
      this.tooltipTop.set(`${rect.bottom + gap}px`);
      this.tooltipLeft.set(`${rect.left + rect.width / 2}px`);
      return;
    }

    if (this.position() === 'left') {
      this.tooltipTop.set(`${rect.top + rect.height / 2}px`);
      this.tooltipLeft.set(`${rect.left - gap}px`);
      return;
    }

    this.tooltipTop.set(`${rect.top + rect.height / 2}px`);
    this.tooltipLeft.set(`${rect.right + gap}px`);
  }

  @HostListener('window:scroll')
  @HostListener('window:resize')
  handleViewportChange(): void {
    if (!this.visible()) return;
    this.updatePosition();
  }
}

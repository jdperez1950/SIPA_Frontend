import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-answer-summary',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 py-4 w-full">
      <div class="flex flex-col md:flex-row items-start md:items-center gap-4 flex-1">
        <!-- Answer Pill -->
        <div class="flex items-center gap-4 px-6 py-3 border border-gray-200 rounded-2xl bg-white shadow-sm min-w-[200px]">
          <div [class]="dotColorClass()" class="w-8 h-8 rounded-full flex-shrink-0 shadow-inner"></div>
          <span class="text-3xl text-gray-500 font-light tracking-wide">{{ answerText() }}</span>
        </div>
        
        <!-- Answer Description -->
        @if (answerDescription()) {
          <div class="text-sm text-gray-500 italic max-w-md leading-relaxed">
            {{ answerDescription() }}
          </div>
        }
      </div>

      <!-- Status Badge -->
      @if (status()) {
        <div class="flex-shrink-0">
          <div [class]="badgeColorClass()" class="px-6 py-3 rounded-xl text-lg font-medium text-white shadow-sm whitespace-nowrap">
            {{ status() }}
          </div>
        </div>
      }
    </div>
  `
})
export class AnswerSummaryComponent {
  answerText = input.required<string>();
  answerDescription = input<string>('');
  status = input<string>('');
  
  dotColorClass(): string {
    const text = this.answerText()?.toUpperCase();
    switch (text) {
      case 'SÍ':
      case 'SI':
        return 'bg-green-500';
      case 'NO':
        return 'bg-red-500';
      case 'EN PROCESO':
        return 'bg-sky-400';
      case 'NO SÉ':
      case 'NO SE':
        return 'bg-gray-400';
      case 'NO APLICA':
        return 'bg-gray-300';
      default:
        return 'bg-sky-400';
    }
  }

  badgeColorClass(): string {
    const s = this.status()?.toUpperCase();
    switch (s) {
      case 'VALIDADAS':
        return 'bg-green-500';
      case 'DEVUELTAS':
        return 'bg-red-500';
      case 'SIN VALIDAR':
        return 'bg-gray-400';
      default:
        return 'bg-gray-400';
    }
  }
}
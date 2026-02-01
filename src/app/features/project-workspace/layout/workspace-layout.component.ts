import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { QuestionRibbonComponent } from './components/question-ribbon/question-ribbon.component';

@Component({
  selector: 'app-workspace-layout',
  standalone: true,
  imports: [RouterOutlet, QuestionRibbonComponent],
  template: `
    <div class="min-h-screen bg-gray-50 flex flex-col font-sans">
      <!-- Top Navigation / Context Header -->
      <header class="bg-white border-b border-gray-200 shadow-sm z-10 sticky top-0">
        <div class="px-6 py-4 max-w-7xl mx-auto w-full">
          <div class="flex justify-between items-center mb-4">
            <div>
              <h1 class="text-xl font-bold text-gray-800 tracking-tight">Panel de Respuestas</h1>
              <div class="text-xs text-gray-500 mt-1">Organización: ACME Corp | Proyecto: Construcción de Vivienda Fase 1</div>
            </div>
            
            <div class="flex gap-3">
               <button class="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-md transition-colors shadow-sm font-medium">
                 Ir al panel de eje
               </button>
               <button class="px-4 py-2 text-sm text-white bg-gray-800 hover:bg-gray-700 rounded-md transition-colors shadow-sm font-medium">
                 Ir al panel general
               </button>
            </div>
          </div>
          
          <!-- Question Ribbon -->
          <div class="pt-2">
            <app-question-ribbon></app-question-ribbon>
          </div>
        </div>
      </header>

      <!-- Main Content -->
      <main class="flex-1 w-full max-w-5xl mx-auto px-6 py-8">
        <router-outlet></router-outlet>
      </main>
    </div>
  `
})
export class WorkspaceLayoutComponent {}

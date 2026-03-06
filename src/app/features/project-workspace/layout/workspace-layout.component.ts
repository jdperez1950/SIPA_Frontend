import { Component, inject, computed, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { QuestionRibbonComponent } from './components/question-ribbon/question-ribbon.component';
import { AuthService } from '../../../core/auth/services/auth.service';
import { ConfirmationService } from '../../../core/services/confirmation.service';
import { FooterComponent } from '../../../shared/components/footer/footer.component';
import { ProjectContextService } from '../services/project-context.service';


@Component({
  selector: 'app-workspace-layout',
  standalone: true,
  imports: [RouterOutlet, QuestionRibbonComponent, FooterComponent],
  template: `
    <div class="min-h-screen bg-gray-50 flex flex-col font-sans">
      <a href="#main-content" class="sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 focus:z-50 focus:p-4 focus:bg-white focus:text-blue-700 focus:shadow-lg rounded-br-lg">Saltar al contenido principal</a>
      
      <!-- Top Navigation / Context Header -->
      <header class="bg-white border-b border-gray-200 shadow-sm z-10 sticky top-0">
        <div class="px-6 py-4 max-w-7xl mx-auto w-full">
          <div class="flex justify-between items-center mb-4">
            <div>
              <h1 class="text-xl font-bold text-gray-800 tracking-tight">Panel de Respuestas</h1>
              <div class="text-xs text-gray-500 mt-1">{{ contextInfo() }}</div>
            </div>
            
            <div class="flex gap-3 items-center">
               <button 
                 type="button" 
                 (click)="goBackToPanel()" 
                 class="flex items-center gap-2 px-3 py-2 text-sm text-sky-600 hover:bg-sky-50 rounded-md transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500"
                 aria-label="Volver al panel"
               >
                 <span class="material-symbols-rounded text-lg" aria-hidden="true">arrow_back</span>
                 <span class="hidden sm:inline">Volver al Panel</span>
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
      <main id="main-content" class="flex-1 w-full max-w-5xl mx-auto px-6 py-8" tabindex="-1">
        <router-outlet></router-outlet>
      </main>

      <!-- Footer -->
      <app-footer />
    </div>
  `
})
export class WorkspaceLayoutComponent {
  private projectContextService = inject(ProjectContextService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private confirmationService = inject(ConfirmationService);

  contextInfo = computed(() => {
    const org = this.projectContextService.organizationName();
    const proj = this.projectContextService.projectName();
    
    if (org && proj) {
      return `Organización: ${org} | Proyecto: ${proj}`;
    } else if (org) {
      return `Organización: ${org}`;
    } else {
      return 'Cargando información del proyecto...';
    }
  });

  logout() {
    this.confirmationService.confirm({
      title: 'Cerrar Sesión',
      message: '¿Estás seguro de que deseas salir del sistema?',
      type: 'warning',
      confirmText: 'Salir'
    }).then(confirmed => {
      if (confirmed) {
        this.authService.logout();
        this.router.navigate(['/auth/login']);
      }
    });
  }

  goBackToPanel() {
    this.router.navigateByUrl('/organization/panel');
  }
}

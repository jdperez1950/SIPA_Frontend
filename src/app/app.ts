import { Component, inject, signal, OnInit } from '@angular/core';
import { Router, RouterOutlet, NavigationStart, NavigationEnd, NavigationCancel, NavigationError } from '@angular/router';
import { AlertToastComponent } from './shared/components/alert-toast/alert-toast.component';
import { LoadingComponent } from './shared/components/loading/loading.component';
import { ConfirmationModalComponent } from './shared/components/confirmation-modal/confirmation-modal.component';
import { LoadingService } from './core/services/loading.service';
import { ConfirmationService } from './core/services/confirmation.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, AlertToastComponent, LoadingComponent, ConfirmationModalComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  protected readonly title = signal('pavis');
  private router = inject(Router);
  private loadingService = inject(LoadingService);
  protected confirmationService = inject(ConfirmationService);

  ngOnInit() {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        this.loadingService.show();
      }

      if (
        event instanceof NavigationEnd ||
        event instanceof NavigationCancel ||
        event instanceof NavigationError
      ) {
        this.loadingService.hide();
      }
    });
  }
}

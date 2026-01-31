import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AlertToastComponent } from './shared/components/alert-toast/alert-toast.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, AlertToastComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('sipa_v2');
}

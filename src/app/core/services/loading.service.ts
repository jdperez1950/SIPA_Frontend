import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  readonly isLoading = signal<boolean>(false);
  readonly message = signal<string | null>(null);

  show(message: string | null = null) {
    this.message.set(message);
    this.isLoading.set(true);
  }

  hide() {
    this.isLoading.set(false);
    this.message.set(null);
  }
}

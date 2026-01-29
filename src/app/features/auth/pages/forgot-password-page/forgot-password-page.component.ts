import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/auth/services/auth.service';

@Component({
  selector: 'app-forgot-password-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './forgot-password-page.component.html',
  styles: []
})
export class ForgotPasswordPageComponent {
  private authService = inject(AuthService);

  isLoading = signal(false);
  successMessage = signal(false);

  form = new FormGroup({
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email]
    })
  });

  onSubmit() {
    if (this.form.valid) {
      this.isLoading.set(true);
      const email = this.form.getRawValue().email;
      
      this.authService.recoverPassword(email).subscribe(() => {
        this.isLoading.set(false);
        this.successMessage.set(true);
        this.form.reset();
      });
    } else {
      this.form.markAllAsTouched();
    }
  }
}

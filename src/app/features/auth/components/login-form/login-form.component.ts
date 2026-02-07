import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-login-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login-form.component.html',
  styles: []
})
export class LoginFormComponent {
  isLoading = input.required<boolean>();
  login = output<{email: string, password: string}>();

  form = new FormGroup({
    email: new FormControl('', {
      nonNullable: true, 
      validators: [Validators.required, Validators.email]
    }),
    password: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(6)]
    })
  });

  onSubmit() {
    if (this.form.valid) {
      const rawValue = this.form.getRawValue();
      this.login.emit({
        email: rawValue.email.trim(),
        password: rawValue.password // Password usually shouldn't be trimmed if it allows spaces, but standard practice often trims. I'll trim email only for safety.
      });
    } else {
      this.form.markAllAsTouched();
    }
  }
}

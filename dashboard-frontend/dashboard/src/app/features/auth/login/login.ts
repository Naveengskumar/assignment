import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { AuthStore } from '../../../core/auth/auth.store';

function requiredMsg(ctrl: AbstractControl | null) {
  return ctrl?.hasError('required') ? 'This field is required.' : null;
}
function emailMsg(ctrl: AbstractControl | null) {
  return ctrl?.hasError('email') ? 'Enter a valid email address.' : null;
}
function minLenMsg(ctrl: AbstractControl | null, n: number) {
  return ctrl?.hasError('minlength') ? `Must be at least ${n} characters.` : null;
}

@Component({
  standalone: true,
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);
  private store = inject(AuthStore);

  loading = signal(false);
  error = signal<string | null>(null);
  submitted = signal(false);

  form = this.fb.group({
    email: ['admin@example.com', [Validators.required, Validators.email]],
    password: ['Admin@123', [Validators.required, Validators.minLength(6)]],
  });

  // Helpers to show errors only when needed
  showError(path: string) {
    const c = this.form.get(path);
    return !!c && (c.touched || this.submitted()) && c.invalid;
  }
  messageFor(path: string) {
    const c = this.form.get(path);
    if (!c) return null;
    return requiredMsg(c) || emailMsg(c) || minLenMsg(c, 6);
  }

  onSubmit() {
    this.submitted.set(true);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading.set(true);
    this.error.set(null);
    const { email, password } = this.form.getRawValue()!;
    this.auth.login(email!, password!).subscribe({
      next: () => {
        const role = this.store.getSnapshot().role;
        this.router.navigateByUrl(role === 'ADMIN' ? '/admin' : '/user');
      },
      error: (err) => {
        this.error.set(err?.error?.error ?? 'Login failed');
        this.loading.set(false);
      }
    });
  }
}

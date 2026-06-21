import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { IamStore } from '../../../application/iam.store';
import { ResetPasswordCommand } from '../../../domain/model/commands/reset-password.command';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { ArrowBack } from '../../../../shared/presentation/components/arrow-back/arrow-back';
import { TranslateModule } from '@ngx-translate/core';

export const passwordMatchValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const newPassword = control.get('newPassword');
  const confirmPassword = control.get('confirmPassword');

  if (newPassword && confirmPassword && newPassword.value !== confirmPassword.value) {
    confirmPassword.setErrors({ ...confirmPassword.errors, passwordMismatch: true });
    return { passwordMismatch: true };
  } else {
    if (confirmPassword?.hasError('passwordMismatch')) {
      const errors = { ...confirmPassword.errors };
      delete errors['passwordMismatch'];
      confirmPassword.setErrors(Object.keys(errors).length ? errors : null);
    }
    return null;
  }
};

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    ArrowBack,
    TranslateModule
  ],
  templateUrl: './reset-password.html',
  styleUrls: ['./reset-password.css']
})
export class ResetPasswordComponent implements OnInit {
  private fb = inject(FormBuilder);
  public iamStore = inject(IamStore);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  token = signal<string | null>(null);
  errorMessage = signal<string | null>(null);
  isSubmitting = signal<boolean>(false);

  hideNewPassword = signal(true);
  hideConfirmPassword = signal(true);

  resetPasswordForm: FormGroup = this.fb.group({
    newPassword: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required]]
  }, { validators: passwordMatchValidator });
  get newPasswordControl() { return this.resetPasswordForm.get('newPassword'); }
  get confirmPasswordControl() { return this.resetPasswordForm.get('confirmPassword'); }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['token']) {
        this.token.set(params['token']);
      } else {
        this.errorMessage.set('reset-password.error_missing_token');
        this.resetPasswordForm.disable();
      }
    });
  }

  onSubmit(): void {
    if (this.resetPasswordForm.invalid || !this.token()) {
      this.resetPasswordForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    const { newPassword } = this.resetPasswordForm.value;
    const command = new ResetPasswordCommand({ token: this.token()!, newPassword });

    this.iamStore.resetPassword(command).subscribe({
      next: () => {
        // Redirect to sign in page
        this.router.navigate(['/sign-in']);
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.errorMessage.set('reset-password.error_invalid_token');
        console.error('Reset password error:', err);
      }
    });
  }
}

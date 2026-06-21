import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { IamStore } from '../../../application/iam.store';
import { GeneratePasswordRecoveryTokenCommand } from '../../../domain/model/commands/generate-password-recovery-token.command';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { ArrowBack } from '../../../../shared/presentation/components/arrow-back/arrow-back';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    ArrowBack,
    TranslateModule
  ],
  templateUrl: './forgot-password.html',
  styleUrls: ['./forgot-password.css']
})
export class ForgotPasswordComponent {
  private fb = inject(FormBuilder);
  public iamStore = inject(IamStore);

  successMessage = signal<string | null>(null);
  errorMessage = signal<string | null>(null);
  isSubmitting = signal<boolean>(false);

  forgotPasswordForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]]
  });

  get emailControl() { return this.forgotPasswordForm.get('email'); }

  onSubmit(): void {
    if (this.forgotPasswordForm.invalid) {
      this.forgotPasswordForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.successMessage.set(null);
    this.errorMessage.set(null);

    const { email } = this.forgotPasswordForm.value;
    const command = new GeneratePasswordRecoveryTokenCommand({ email });

    this.iamStore.forgotPassword(command).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.successMessage.set('forgot-password.success_message');
        this.forgotPasswordForm.reset();
      },
      error: (err) => {
        this.isSubmitting.set(false);
        let errorMsg = 'forgot-password.error_default';

        // Check if it's a client error (e.g., 400 Bad Request or 404 Not Found)
        if (err.status >= 400 && err.status < 500) {
           // Backend may send the message directly in err.error or err.error.message
           errorMsg = err.error?.message || (typeof err.error === 'string' ? err.error : 'forgot-password.error_not_found');
        }

        this.errorMessage.set(errorMsg);
        console.error('Forgot password error:', err);
      }
    });
  }

  onGoogleSignIn(): void {
    console.log('Iniciando flujo de Google Sign-In...');
  }
}

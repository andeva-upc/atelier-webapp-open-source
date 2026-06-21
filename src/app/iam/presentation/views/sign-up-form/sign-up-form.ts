import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IamStore } from '../../../application/iam.store';
import { SignUpCommand } from '../../../domain/model/commands/sign-up.command';

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { RouterLink } from '@angular/router';
import { ArrowBack } from '../../../../shared/presentation/components/arrow-back/arrow-back';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCheckboxModule,
    RouterLink,
    ArrowBack,
    TranslateModule
  ],
  templateUrl: './sign-up-form.html',
  styleUrls: ['./sign-up-form.css']
})
export class SignUpComponent {
  private fb = inject(FormBuilder);
  private iamStore = inject(IamStore);
  private router = inject(Router);

  signUpForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    terms: [false, [Validators.requiredTrue]]
  });

  get emailControl() { return this.signUpForm.get('email'); }
  get passwordControl() { return this.signUpForm.get('password'); }
  get termsControl() { return this.signUpForm.get('terms'); }

  onSubmit(): void {
    if (this.signUpForm.invalid) {
      this.signUpForm.markAllAsTouched();
      return;
    }
    const { email, password } = this.signUpForm.value;
    const command = new SignUpCommand({ email, password });
    this.iamStore.signUp(command, this.router);
  }

  onGoogleSignIn(): void {
    console.log('Iniciando flujo de Google Sign-In...');
  }
}

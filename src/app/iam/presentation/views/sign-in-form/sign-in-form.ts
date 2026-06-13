import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IamStore } from '../../../application/iam.store';
import { SignInCommand } from '../../../domain/model/commands/sign-in.command';

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ArrowBack } from '../../../../shared/presentation/components/arrow-back/arrow-back';

@Component({
  selector: 'app-sign-in',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCheckboxModule,
    NgIf,
    RouterLink,
    ArrowBack
  ],
  templateUrl: './sign-in-form.html',
  styleUrls: ['./sign-in-form.css']
})
export class SignInComponent {
  private fb = inject(FormBuilder);
  private iamStore = inject(IamStore);
  private router = inject(Router);

  signInForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    rememberMe: [false]
  });

  get emailControl() { return this.signInForm.get('email'); }
  get passwordControl() { return this.signInForm.get('password'); }

  onSubmit(): void {
    if (this.signInForm.invalid) {
      this.signInForm.markAllAsTouched();
      return;
    }
    const { email, password } = this.signInForm.value;
    const command = new SignInCommand({ email, password });
    this.iamStore.signIn(command, this.router);
  }

  onGoogleSignIn(): void {
    console.log('Iniciando flujo de Google Sign-In...');
  }
}

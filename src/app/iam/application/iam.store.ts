import { computed, Injectable, signal } from '@angular/core';
import { User } from '../domain/model/entities/user.entity';
import { SignInCommand } from '../domain/model/commands/sign-in.command';
import { Router } from '@angular/router';
import { IamApi } from '../infrastructure/iam-api';
import { SignUpCommand } from '../domain/model/commands/sign-up.command';
import { GoogleSignInCommand } from '../domain/model/commands/google-sign-in.command';
import { GeneratePasswordRecoveryTokenCommand } from '../domain/model/commands/generate-password-recovery-token.command';
import { ResetPasswordCommand } from '../domain/model/commands/reset-password.command';
import { UpdateUserEmailCommand } from '../domain/model/commands/update-user-email.command';
import { UpdateUserPasswordCommand } from '../domain/model/commands/update-user-password.command';

@Injectable({providedIn: 'root'})
export class IamStore {
  private readonly isSignedInSignal = signal<boolean>(false);
  private readonly currentUsernameSignal = signal<string | null>(null);
  private readonly currentUserIdSignal = signal<string | null>(null);

  readonly isSignedIn = this.isSignedInSignal.asReadonly();
  readonly currentUsername = this.currentUsernameSignal.asReadonly();
  readonly currentUserId = this.currentUserIdSignal.asReadonly();

  readonly currentToken = computed(() => this.isSignedIn() ? localStorage.getItem('token') : null);

  constructor(private iamApi: IamApi) {
    this.isSignedInSignal.set(false);
    this.currentUsernameSignal.set(null);
    this.currentUserIdSignal.set(null);
  }

  signIn(signInCommand: SignInCommand, router: Router) {
    this.iamApi.signIn(signInCommand).subscribe({
      next: (signInResource) => {
        localStorage.setItem('token', signInResource.token);
        this.isSignedInSignal.set(true);
        this.currentUsernameSignal.set(signInResource.email);
        this.currentUserIdSignal.set(signInResource.id);
        router.navigate(['/home']).then();
      },
      error: (err) => {
        console.error('Sign-in failed:', err);
        this.isSignedInSignal.set(false);
        this.currentUsernameSignal.set(null);
        this.currentUserIdSignal.set(null);
        router.navigate(['/sign-in']).then();
      }
    });
  }

  googleSignIn(command: GoogleSignInCommand, router: Router) {
    this.iamApi.googleSignIn(command).subscribe({
      next: (resource) => {
        localStorage.setItem('token', resource.token);
        this.isSignedInSignal.set(true);
        this.currentUsernameSignal.set(resource.email);
        this.currentUserIdSignal.set(resource.id);
        router.navigate(['/home']).then();
      },
      error: (err) => {
        console.error('Google Sign-in failed:', err);
        this.isSignedInSignal.set(false);
        this.currentUsernameSignal.set(null);
        this.currentUserIdSignal.set(null);
        router.navigate(['/sign-in']).then();
      }
    });
  }

  signUp(signUpCommand: SignUpCommand, router: Router) {
    this.iamApi.signUp(signUpCommand).subscribe({
      next: (signUpResource) => {
        console.log('Sign-up successful:', signUpResource);
        router.navigate(['/sign-in']).then();
      },
      error: (err) => {
        console.error('Sign-up failed:', err);
        this.isSignedInSignal.set(false);
        this.currentUsernameSignal.set(null);
        this.currentUserIdSignal.set(null);
        router.navigate(['/sign-up']).then();
      }
    });
  }

  signOut(router: Router) {
    localStorage.removeItem('token');
    this.isSignedInSignal.set(false);
    this.currentUsernameSignal.set(null);
    this.currentUserIdSignal.set(null);
    router.navigate(['/sign-in']).then();
  }

  forgotPassword(command: GeneratePasswordRecoveryTokenCommand) {
    return this.iamApi.forgotPassword(command);
  }

  resetPassword(command: ResetPasswordCommand) {
    return this.iamApi.resetPassword(command);
  }

  updateUserEmail(command: UpdateUserEmailCommand) {
    return this.iamApi.updateUserEmail(command);
  }

  updateUserPassword(command: UpdateUserPasswordCommand) {
    return this.iamApi.updateUserPassword(command);
  }

  readonly currentUserProfile = signal<any | null>(null);

  loadUserProfile(userId: string) {
    this.iamApi.getUserById(userId).subscribe({
      next: (resource) => this.currentUserProfile.set(resource),
      error: (err) => console.error('Failed to load user profile:', err)
    });
  }
}

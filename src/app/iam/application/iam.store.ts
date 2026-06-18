import { computed, Injectable, signal } from '@angular/core';
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
  private readonly signInErrorSignal = signal<string | null>(null);

  readonly isSignedIn = this.isSignedInSignal.asReadonly();
  readonly currentUsername = this.currentUsernameSignal.asReadonly();
  readonly currentUserId = this.currentUserIdSignal.asReadonly();
  readonly signInError = this.signInErrorSignal.asReadonly();

  readonly currentToken = computed(() => this.isSignedIn() ? (localStorage.getItem('token') || sessionStorage.getItem('token')) : null);

  constructor(private iamApi: IamApi) {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const userId = localStorage.getItem('userId') || sessionStorage.getItem('userId');
    if (token && userId) {
      this.isSignedInSignal.set(true);
      this.currentUserIdSignal.set(userId);
      this.loadUserProfile(userId);
    } else {
      this.isSignedInSignal.set(false);
      this.currentUsernameSignal.set(null);
      this.currentUserIdSignal.set(null);
    }
  }

  signIn(signInCommand: SignInCommand, rememberMe: boolean, router: Router) {
    this.signInErrorSignal.set(null);
    this.iamApi.signIn(signInCommand).subscribe({
      next: (signInResource) => {
        const storage = rememberMe ? localStorage : sessionStorage;
        storage.setItem('token', signInResource.token);
        storage.setItem('userId', signInResource.id.toString());
        this.isSignedInSignal.set(true);
        this.currentUsernameSignal.set(signInResource.email);
        this.currentUserIdSignal.set(signInResource.id);
        router.navigate(['/role-selection']).then();
      },
      error: (err) => {
        console.error('Sign-in failed:', err);
        this.isSignedInSignal.set(false);
        this.currentUsernameSignal.set(null);
        this.currentUserIdSignal.set(null);
        this.signInErrorSignal.set('sign-in.error_invalid_credentials');
      }
    });
  }

  googleSignIn(command: GoogleSignInCommand, router: Router) {
    this.iamApi.googleSignIn(command).subscribe({
      next: (resource) => {
        localStorage.setItem('token', resource.token);
        localStorage.setItem('userId', resource.id.toString());
        this.isSignedInSignal.set(true);
        this.currentUsernameSignal.set(resource.email);
        this.currentUserIdSignal.set(resource.id);
        router.navigate(['/role-selection']).then();
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
    localStorage.removeItem('userId');
    localStorage.removeItem('employeeId');
    localStorage.removeItem('customerId');
    localStorage.removeItem('tenantBranchId');
    localStorage.removeItem('activeRole');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('userId');
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
      next: (resource) => {
        this.currentUserProfile.set(resource);
        this.currentUsernameSignal.set(resource.email);
      },
      error: (err) => console.error('Failed to load user profile:', err)
    });
  }
}

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
import { AuthenticatedUser } from '../domain/model/entities/authenticated-user.entity';
import { User } from '../domain/model/entities/user.entity';
import { UserAssembler } from '../infrastructure/assemblers/user-assembler';

@Injectable({providedIn: 'root'})
export class IamStore {
  private readonly isSignedInSignal = signal<boolean>(false);
  private readonly currentUsernameSignal = signal<string | null>(null);
  private readonly currentUserIdSignal = signal<string | null>(null);
  private readonly signInErrorSignal = signal<string | null>(null);
  private readonly authenticatedUserSignal = signal<AuthenticatedUser | null>(null);

  readonly isSignedIn = this.isSignedInSignal.asReadonly();
  readonly currentUsername = this.currentUsernameSignal.asReadonly();
  readonly currentUserId = this.currentUserIdSignal.asReadonly();
  readonly signInError = this.signInErrorSignal.asReadonly();
  readonly authenticatedUser = this.authenticatedUserSignal.asReadonly();

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
      this.authenticatedUserSignal.set(null);
    }
  }

  signIn(signInCommand: SignInCommand, rememberMe: boolean, router: Router) {
    this.signInErrorSignal.set(null);
    this.iamApi.signIn(signInCommand).subscribe({
      next: (signInResource) => {
        const storage = rememberMe ? localStorage : sessionStorage;
        storage.setItem('token', signInResource.token);
        storage.setItem('userId', signInResource.id.toString());
        
        const user = new User({ id: signInResource.id.toString(), email: signInResource.email });
        const authenticatedUser = new AuthenticatedUser({ id: signInResource.id.toString(), token: signInResource.token, user: user });
        
        this.isSignedInSignal.set(true);
        this.currentUsernameSignal.set(signInResource.email);
        this.currentUserIdSignal.set(signInResource.id);
        this.authenticatedUserSignal.set(authenticatedUser);
        
        router.navigate(['/role-selection']).then();
      },
      error: (err) => {
        console.error('Sign-in failed:', err);
        this.isSignedInSignal.set(false);
        this.currentUsernameSignal.set(null);
        this.currentUserIdSignal.set(null);
        this.authenticatedUserSignal.set(null);
        this.signInErrorSignal.set('sign-in.error_invalid_credentials');
      }
    });
  }

  googleSignIn(command: GoogleSignInCommand, router: Router) {
    this.iamApi.googleSignIn(command).subscribe({
      next: (resource) => {
        localStorage.setItem('token', resource.token);
        localStorage.setItem('userId', resource.id.toString());
        
        const user = new User({ id: resource.id.toString(), email: resource.email });
        const authenticatedUser = new AuthenticatedUser({ id: resource.id.toString(), token: resource.token, user: user });

        this.isSignedInSignal.set(true);
        this.currentUsernameSignal.set(resource.email);
        this.currentUserIdSignal.set(resource.id);
        this.authenticatedUserSignal.set(authenticatedUser);
        
        router.navigate(['/role-selection']).then();
      },
      error: (err) => {
        console.error('Google Sign-in failed:', err);
        this.isSignedInSignal.set(false);
        this.currentUsernameSignal.set(null);
        this.currentUserIdSignal.set(null);
        this.authenticatedUserSignal.set(null);
        router.navigate(['/sign-in']).then();
      }
    });
  }

  signUp(signUpCommand: SignUpCommand, router: Router) {
    this.iamApi.signUp(signUpCommand).subscribe({
      next: (signUpResource) => {
        console.log('Sign-up successful:', signUpResource);
        const signInCommand = new SignInCommand({ email: signUpCommand.email, password: signUpCommand.password });
        this.signIn(signInCommand, true, router);
      },
      error: (err) => {
        console.error('Sign-up failed, attempting sign-in as fallback:', err);
        // If the user already exists, attempting to sign in with the provided credentials
        const signInCommand = new SignInCommand({ email: signUpCommand.email, password: signUpCommand.password });
        this.signIn(signInCommand, true, router);
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
    this.authenticatedUserSignal.set(null);
    
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

  readonly currentUserProfile = signal<User | null>(null);

  loadUserProfile(userId: string) {
    this.iamApi.getUserById(userId).subscribe({
      next: (resource) => {
        const assembler = new UserAssembler();
        const userEntity = assembler.toEntityFromResource(resource);
        this.currentUserProfile.set(userEntity);
        this.currentUsernameSignal.set(userEntity.email);
        
        // Also update authenticatedUser if we have a token
        const token = this.currentToken();
        if (token) {
          const authUser = new AuthenticatedUser({ id: userEntity.id as string, token: token, user: userEntity });
          this.authenticatedUserSignal.set(authUser);
        }
      },
      error: (err) => console.error('Failed to load user profile:', err)
    });
  }
}


import { Injectable } from '@angular/core';
import { BaseApi } from '../../shared/infrastructure/base-api';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { SignUpApiEndpoint } from './endpoints/sign-up-api-endpoint';
import { SignUpAssembler } from './assemblers/sign-up-assembler';
import { SignUpCommand } from '../domain/model/commands/sign-up.command';
import { SignUpResponse } from './responses/sign-up-response';

import { SignInApiEndpoint } from './endpoints/sign-in-api-endpoint';
import { SignInAssembler } from './assemblers/sign-in-assembler';
import { SignInCommand } from '../domain/model/commands/sign-in.command';
import { SignInResponse } from './responses/sign-in-response';

import { GoogleSignInApiEndpoint } from './endpoints/google-sign-in-api-endpoint';
import { GoogleSignInAssembler } from './assemblers/google-sign-in-assembler';
import { GoogleSignInCommand } from '../domain/model/commands/google-sign-in.command';
import { GoogleSignInResponse } from './responses/google-sign-in-response';

import { ForgotPasswordApiEndpoint } from './endpoints/forgot-password-api-endpoint';
import { ForgotPasswordAssembler } from './assemblers/forgot-password-assembler';
import { GeneratePasswordRecoveryTokenCommand } from '../domain/model/commands/generate-password-recovery-token.command';
import { ForgotPasswordResponse } from './responses/forgot-password-response';

import { ResetPasswordApiEndpoint } from './endpoints/reset-password-api-endpoint';
import { ResetPasswordAssembler } from './assemblers/reset-password-assembler';
import { ResetPasswordCommand } from '../domain/model/commands/reset-password.command';
import { ResetPasswordResponse } from './responses/reset-password-response';

import { UpdateUserEmailApiEndpoint } from './endpoints/update-user-email-api-endpoint';
import { UpdateUserEmailAssembler } from './assemblers/update-user-email-assembler';
import { UpdateUserEmailCommand } from '../domain/model/commands/update-user-email.command';
import { UpdateUserEmailResponse } from './responses/update-user-email-response';

import { UpdateUserPasswordApiEndpoint } from './endpoints/update-user-password-api-endpoint';
import { UpdateUserPasswordAssembler } from './assemblers/update-user-password-assembler';
import { UpdateUserPasswordCommand } from '../domain/model/commands/update-user-password.command';
import { UpdateUserPasswordResponse } from './responses/update-user-password-response';

import { UsersApiEndpoint } from './endpoints/users-api-endpoint';
import { UserResource } from './responses/user-response';

@Injectable({providedIn: 'root'})
export class IamApi extends BaseApi {
  private readonly signUpEndpoint: SignUpApiEndpoint;
  private readonly signInEndpoint: SignInApiEndpoint;
  private readonly googleSignInEndpoint: GoogleSignInApiEndpoint;
  private readonly forgotPasswordEndpoint: ForgotPasswordApiEndpoint;
  private readonly resetPasswordEndpoint: ResetPasswordApiEndpoint;
  private readonly updateUserEmailEndpoint: UpdateUserEmailApiEndpoint;
  private readonly updateUserPasswordEndpoint: UpdateUserPasswordApiEndpoint;
  private readonly usersEndpoint: UsersApiEndpoint;

  constructor(http: HttpClient) {
    super();
    this.signUpEndpoint = new SignUpApiEndpoint(http, new SignUpAssembler());
    this.signInEndpoint = new SignInApiEndpoint(http, new SignInAssembler());
    this.googleSignInEndpoint = new GoogleSignInApiEndpoint(http, new GoogleSignInAssembler());
    this.forgotPasswordEndpoint = new ForgotPasswordApiEndpoint(http, new ForgotPasswordAssembler());
    this.resetPasswordEndpoint = new ResetPasswordApiEndpoint(http, new ResetPasswordAssembler());
    this.updateUserEmailEndpoint = new UpdateUserEmailApiEndpoint(http, new UpdateUserEmailAssembler());
    this.updateUserPasswordEndpoint = new UpdateUserPasswordApiEndpoint(http, new UpdateUserPasswordAssembler());
    this.usersEndpoint = new UsersApiEndpoint(http);
  }

  signUp(command: SignUpCommand): Observable<SignUpResponse>  {
    return this.signUpEndpoint.signUp(command);
  }

  signIn(command: SignInCommand): Observable<SignInResponse> {
    return this.signInEndpoint.signIn(command);
  }

  googleSignIn(command: GoogleSignInCommand): Observable<GoogleSignInResponse> {
    return this.googleSignInEndpoint.googleSignIn(command);
  }

  forgotPassword(command: GeneratePasswordRecoveryTokenCommand): Observable<ForgotPasswordResponse> {
    return this.forgotPasswordEndpoint.forgotPassword(command);
  }

  resetPassword(command: ResetPasswordCommand): Observable<ResetPasswordResponse> {
    return this.resetPasswordEndpoint.resetPassword(command);
  }

  updateUserEmail(command: UpdateUserEmailCommand): Observable<UpdateUserEmailResponse> {
    return this.updateUserEmailEndpoint.updateUserEmail(command);
  }

  updateUserPassword(command: UpdateUserPasswordCommand): Observable<UpdateUserPasswordResponse> {
    return this.updateUserPasswordEndpoint.updateUserPassword(command);
  }

  getUserById(userId: string): Observable<UserResource> {
    return this.usersEndpoint.getUserById(userId);
  }

  getUserByEmail(email: string): Observable<UserResource> {
    return this.usersEndpoint.getUserByEmail(email);
  }
}

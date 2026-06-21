import { Routes } from '@angular/router';

const signInForm = () => import('./views/sign-in-form/sign-in-form').then((m) => m.SignInComponent);
const signUpForm = () => import('./views/sign-up-form/sign-up-form').then((m) => m.SignUpComponent);
const forgotPasswordForm = () => import('./views/forgot-password/forgot-password').then((m) => m.ForgotPasswordComponent);
const resetPasswordForm = () => import('./views/reset-password/reset-password').then((m) => m.ResetPasswordComponent);

export const iamRoutes: Routes = [
  { path: '', redirectTo: 'sign-in', pathMatch: 'full' },
  { path: 'sign-in', loadComponent: signInForm },
  { path: 'sign-up', loadComponent: signUpForm },
  { path: 'forgot-password', loadComponent: forgotPasswordForm },
  { path: 'reset-password', loadComponent: resetPasswordForm }
];

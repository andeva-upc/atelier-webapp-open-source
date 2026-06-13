import { Routes } from '@angular/router';

const signInForm = () => import('./views/sign-in-form/sign-in-form').then((m) => m.SignInComponent);
const signUpForm = () => import('./views/sign-up-form/sign-up-form').then((m) => m.SignUpComponent);

export const iamRoutes: Routes = [
  { path: 'sign-in', loadComponent: signInForm },
  { path: 'sign-up', loadComponent: signUpForm }
];

import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { CustomerOnboardingFormComponent } from '../../components/customer-onboarding-form/customer-onboarding-form';
import { EmployeeOnboardingFormComponent } from '../../components/employee-onboarding-form/employee-onboarding-form';
import { OwnerOnboardingWizardComponent } from '../../components/owner-onboarding-wizard/owner-onboarding-wizard';
import { CoreStore } from '../../../application/core.store';
import { TranslateModule } from '@ngx-translate/core';

type ProfileType = 'customer' | 'employee' | 'owner' | null;

@Component({
  selector: 'app-onboarding',
  standalone: true,
  imports: [
    CommonModule, 
    MatCardModule, 
    MatButtonModule,
    CustomerOnboardingFormComponent,
    EmployeeOnboardingFormComponent,
    OwnerOnboardingWizardComponent
  , TranslateModule],
  templateUrl: './onboarding.html',
  styleUrls: ['./onboarding.css']
})
export class OnboardingComponent {
  private coreStore = inject(CoreStore);
  selectedProfile = signal<ProfileType>(null);

  hasRole(role: string): boolean {
    const roles = this.coreStore.currentRoles();
    if (!roles) return false;
    return roles.some(r => r.toUpperCase().includes(role.toUpperCase()));
  }

  selectProfile(type: ProfileType) {
    this.selectedProfile.set(type);
  }

  cancelSelection() {
    this.selectedProfile.set(null);
  }
}

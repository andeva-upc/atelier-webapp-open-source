import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CoreStore } from '../../../application/core.store';
import { CreateOwnerCommand } from '../../../domain/model/commands/create-owner.command';
import { CreateWorkshopCommand } from '../../../domain/model/commands/create-workshop.command';
import { CreateBranchCommand } from '../../../domain/model/commands/create-branch.command';
import { AssignSubscriptionCommand } from '../../../domain/model/commands/assign-subscription.command';

import { MatStepperModule } from '@angular/material/stepper';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { SubscriptionPlansComponent, SubscriptionPlan } from '../subscription-plans/subscription-plans';
import { SubscriptionPaymentComponent } from '../subscription-payment/subscription-payment';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-owner-onboarding-wizard',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatStepperModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    SubscriptionPlansComponent,
    SubscriptionPaymentComponent
  , TranslateModule],
  templateUrl: './owner-onboarding-wizard.html',
  styleUrls: ['./owner-onboarding-wizard.css']
})
export class OwnerOnboardingWizardComponent {
  private fb = inject(FormBuilder);
  private coreStore = inject(CoreStore);
  private router = inject(Router);

  ownerForm: FormGroup = this.fb.group({
    firstName: ['', [Validators.required]],
    lastName: ['', [Validators.required]],
    documentType: ['DNI', [Validators.required]],
    documentNumber: ['', [Validators.required]],
    phone: ['', [Validators.required]],
  });

  workshopForm: FormGroup = this.fb.group({
    businessName: ['', [Validators.required]],
    brandName: ['', [Validators.required]],
    taxId: ['', [Validators.required, Validators.pattern('^[0-9]{11}$')]]
  });

  branchForm: FormGroup = this.fb.group({
    name: ['', [Validators.required]],
    address: ['', [Validators.required]],
    code: ['', [Validators.required]],
    phone: ['', [Validators.required]]
  });

  selectedPlan: SubscriptionPlan | null = null;
  paymentData: any = null;

  isSubmitting = false;

  onPlanSelected(plan: SubscriptionPlan, stepper: any) {
    setTimeout(() => {
      this.selectedPlan = plan;
      stepper.next();
    });
  }

  onPaymentSubmit(paymentData: any) {
    setTimeout(() => {
      this.paymentData = paymentData;
      this.submitWizard();
    });
  }

  async submitWizard() {
    if (this.ownerForm.invalid || this.workshopForm.invalid || this.branchForm.invalid || !this.selectedPlan || !this.paymentData) {
      return;
    }

    const userId = localStorage.getItem('userId') || sessionStorage.getItem('userId');
    if (!userId) return;

    this.isSubmitting = true;

    try {
      const ownerCmd = new CreateOwnerCommand({
        userId,
        firstName: this.ownerForm.value.firstName,
        lastName: this.ownerForm.value.lastName,
        documentType: this.ownerForm.value.documentType,
        documentNumber: this.ownerForm.value.documentNumber,
        phone: this.ownerForm.value.phone
      });
      
      const coreApi = (this.coreStore as any).coreApi;
      
      coreApi.owners.create(ownerCmd).subscribe({
        next: (owner: any) => {
          this.proceedWithWorkshop(owner.id, userId, coreApi);
        },
        error: (err: any) => {
          console.error('Failed to create owner', err);
          if (err.error) console.error('Details:', JSON.stringify(err.error));
          
          // Fallback: Check if owner already exists
          coreApi.owners.getByUserId(userId).subscribe({
            next: (existingOwner: any) => {
              if (existingOwner && existingOwner.id) {
                console.log('Using existing owner profile');
                this.proceedWithWorkshop(existingOwner.id, userId, coreApi);
              } else {
                this.isSubmitting = false;
              }
            },
            error: (fetchErr: any) => {
              console.error('Failed to fetch existing owner after creation failed', fetchErr);
              this.isSubmitting = false;
            }
          });
        }
      });

    } catch (err) {
      console.error(err);
      this.isSubmitting = false;
    }
  }

  private proceedWithWorkshop(ownerId: string, userId: string, coreApi: any) {
    const workshopCmd = new CreateWorkshopCommand({
      ownerId: ownerId,
      businessName: this.workshopForm.value.businessName,
      brandName: this.workshopForm.value.brandName,
      taxId: this.workshopForm.value.taxId,
      mileageIntervalConfig: 5000 // default
    });
    
    coreApi.workshops.create(workshopCmd).subscribe({
      next: (workshop: any) => {
        this.proceedWithBranch(workshop.id, userId, coreApi);
      },
      error: (err: any) => {
        console.error('Failed to create workshop', err);
        if (err.error) console.error('Details:', JSON.stringify(err.error));
        
        // Fallback: Check if workshop already exists
        coreApi.workshops.getByOwnerId(ownerId).subscribe({
          next: (workshops: any[]) => {
            if (workshops && workshops.length > 0) {
              console.log('Using existing workshop');
              this.proceedWithBranch(workshops[0].id, userId, coreApi);
            } else {
              this.isSubmitting = false;
            }
          },
          error: (fetchErr: any) => {
            console.error('Failed to fetch existing workshop', fetchErr);
            this.isSubmitting = false;
          }
        });
      }
    });
  }

  private proceedWithBranch(workshopId: string, userId: string, coreApi: any) {
    const branchCmd = new CreateBranchCommand({
      workshopId: workshopId,
      code: this.branchForm.value.code,
      name: this.branchForm.value.name,
      address: this.branchForm.value.address,
      phone: this.branchForm.value.phone
    });
    
    coreApi.branches.create(branchCmd).subscribe({
      next: (branch: any) => {
        this.proceedWithSubscription(branch.id, userId, coreApi);
      },
      error: (err: any) => {
        console.error('Failed to create branch', err);
        if (err.error) console.error('Details:', err.error);
        
        // Fallback: Check if branch already exists
        coreApi.branches.getByWorkshopId(workshopId).subscribe({
          next: (branches: any[]) => {
            if (branches && branches.length > 0) {
              console.log('Using existing branch');
              this.proceedWithSubscription(branches[0].id, userId, coreApi);
            } else {
              this.isSubmitting = false;
            }
          },
          error: (fetchErr: any) => {
            console.error('Failed to fetch existing branch', fetchErr);
            this.isSubmitting = false;
          }
        });
      }
    });
  }

  private proceedWithSubscription(branchId: string, userId: string, coreApi: any) {
    const paymentInfo = this.paymentData.payment;
    
    // Parse MMYY to MM/YY (add slash if missing)
    let formattedDate = paymentInfo.expirationDate;
    if (formattedDate && formattedDate.length === 4 && !formattedDate.includes('/')) {
      formattedDate = `${formattedDate.substring(0, 2)}/${formattedDate.substring(2, 4)}`;
    }

    const subCmd = new AssignSubscriptionCommand({
      planId: this.selectedPlan!.id, // We keep the UUID for now
      billingCycle: 'MONTHLY',
      cardNumber: paymentInfo.cardNumber.replace(/\s+/g, ''),
      cardHolderName: paymentInfo.cardName,
      expirationDate: formattedDate,
      cvv: paymentInfo.cvc
    });
    
    coreApi.branches.assignSubscription(branchId, subCmd).subscribe({
      next: () => {
        this.coreStore.loadOwnerByUserId(userId);
        this.router.navigate(['/home']);
      },
      error: (err: any) => {
        console.error('Failed to assign subscription', err);
        if (err.error) console.error('Details:', err.error);
        this.isSubmitting = false;
      }
    });
  }
}

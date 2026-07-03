import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CoreStore } from '../../../application/core.store';
import { CreateCustomerCommand } from '../../../domain/model/commands/create-customer.command';

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-customer-onboarding-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatSlideToggleModule
  , TranslateModule],
  templateUrl: './customer-onboarding-form.html',
  styleUrls: ['./customer-onboarding-form.css']
})
export class CustomerOnboardingFormComponent {
  private fb = inject(FormBuilder);
  private coreStore = inject(CoreStore);
  private router = inject(Router);

  isCorporate = false;

  customerForm: FormGroup = this.fb.group({
    firstname: ['', [Validators.required]],
    lastname: ['', [Validators.required]],
    documentType: ['DNI', [Validators.required]],
    documentNumber: ['', [Validators.required]],
    phone: ['', [Validators.required]],
    businessName: ['']
  });

  toggleCorporate() {
    this.isCorporate = !this.isCorporate;
    if (this.isCorporate) {
      this.customerForm.get('documentType')?.setValue('RUC');
      this.customerForm.get('firstname')?.clearValidators();
      this.customerForm.get('lastname')?.clearValidators();
      this.customerForm.get('businessName')?.setValidators([Validators.required]);
    } else {
      this.customerForm.get('documentType')?.setValue('DNI');
      this.customerForm.get('firstname')?.setValidators([Validators.required]);
      this.customerForm.get('lastname')?.setValidators([Validators.required]);
      this.customerForm.get('businessName')?.clearValidators();
    }
    this.customerForm.get('firstname')?.updateValueAndValidity();
    this.customerForm.get('lastname')?.updateValueAndValidity();
    this.customerForm.get('businessName')?.updateValueAndValidity();
  }

  onSubmit() {
    if (this.customerForm.invalid) {
      this.customerForm.markAllAsTouched();
      return;
    }

    const userId = localStorage.getItem('userId') || sessionStorage.getItem('userId');
    if (!userId) {
      console.error('No userId found');
      return;
    }

    const { firstname, lastname, documentType, documentNumber, phone, businessName } = this.customerForm.value;
    
    const command = new CreateCustomerCommand({
      userId: userId,
      firstName: this.isCorporate ? '' : firstname,
      lastName: this.isCorporate ? '' : lastname,
      documentType: documentType,
      documentNumber: documentNumber,
      phone: phone,
      isCorporate: this.isCorporate,
      businessName: this.isCorporate ? businessName : ''
    });

    this.coreStore.createCustomer(command, this.router);
  }
}

import { Component, EventEmitter, Input, Output, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { SubscriptionPlan } from '../subscription-plans/subscription-plans';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-subscription-payment',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule
  , TranslateModule],
  templateUrl: './subscription-payment.html',
  styleUrls: ['./subscription-payment.css']
})
export class SubscriptionPaymentComponent implements OnInit {
  @Input() selectedPlan!: SubscriptionPlan;
  @Output() paymentSubmit = new EventEmitter<any>();

  private fb = inject(FormBuilder);

  billingForm!: FormGroup;
  paymentForm!: FormGroup;

  ngOnInit() {
    this.billingForm = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      country: ['Perú', [Validators.required]],
      phone: ['', [Validators.required]],
      address: ['', [Validators.required]],
      city: ['', [Validators.required]],
      zipCode: ['', [Validators.required]]
    });

    this.paymentForm = this.fb.group({
      cardName: ['', [Validators.required]],
      cardNumber: ['', [Validators.required, Validators.pattern('^[0-9]{16}$')]],
      expirationDate: ['', [Validators.required, Validators.pattern('^(0[1-9]|1[0-2])\/?([0-9]{2})$')]],
      cvc: ['', [Validators.required, Validators.pattern('^[0-9]{3,4}$')]]
    });
  }

  onSubmit() {
    if (this.billingForm.invalid || this.paymentForm.invalid) {
      this.billingForm.markAllAsTouched();
      this.paymentForm.markAllAsTouched();
      return;
    }

    const paymentData = {
      billing: this.billingForm.value,
      payment: this.paymentForm.value,
      planId: this.selectedPlan.id
    };

    this.paymentSubmit.emit(paymentData);
  }
}

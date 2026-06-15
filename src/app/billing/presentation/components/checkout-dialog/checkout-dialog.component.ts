import { Component, Inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatRadioModule } from '@angular/material/radio';
import { MatButtonModule } from '@angular/material/button';
import { TranslateModule } from '@ngx-translate/core';
import { QuoteResource } from '../../../infrastructure/responses/billing-responses';

export interface CheckoutDialogData {
  approvedQuotes: QuoteResource[];
}

@Component({
  selector: 'app-checkout-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    MatDialogModule, 
    MatFormFieldModule, 
    MatInputModule, 
    MatSelectModule, 
    MatRadioModule, 
    MatButtonModule,
    TranslateModule
  ],
  templateUrl: './checkout-dialog.component.html',
  styleUrls: ['./checkout-dialog.component.css']
})
export class CheckoutDialogComponent implements OnInit {
  checkoutForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<CheckoutDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: CheckoutDialogData
  ) {}

  ngOnInit() {
    this.initForm();
    
    this.checkoutForm.get('quoteId')?.valueChanges.subscribe(quoteId => {
      const selectedQuote = this.data.approvedQuotes.find(q => q.id === quoteId);
      if (selectedQuote) {
        if (selectedQuote.totalAmount <= 0) {
          this.checkoutForm.get('quoteId')?.setErrors({ zeroTotal: true });
        }
      }
    });
  }

  private initForm() {
    this.checkoutForm = this.fb.group({
      quoteId: ['', Validators.required],
      type: ['RECEIPT', Validators.required],
      customerId: ['', Validators.required],
      customerName: ['', Validators.required],
      customerEmail: ['', [Validators.required, Validators.email]]
    });
  }

  onSubmit() {
    if (this.checkoutForm.valid) {
      this.dialogRef.close(this.checkoutForm.value);
    }
  }

  onCancel() {
    this.dialogRef.close();
  }
}

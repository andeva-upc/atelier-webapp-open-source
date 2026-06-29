import { Component, Inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { TranslateModule } from '@ngx-translate/core';
import { WorkOrderResource } from '../../../../operations/infrastructure/responses/work-order.response';

export interface CreateQuoteDialogData {
  completedWorkOrders: WorkOrderResource[];
}

@Component({
  selector: 'app-create-quote-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    TranslateModule
  ],
  templateUrl: './create-quote-dialog.component.html',
  styleUrls: ['./create-quote-dialog.component.css']
})
export class CreateQuoteDialogComponent implements OnInit {
  quoteForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<CreateQuoteDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: CreateQuoteDialogData
  ) {}

  ngOnInit() {
    this.initForm();
  }

  private initForm() {
    this.quoteForm = this.fb.group({
      workOrderId: ['', Validators.required],
      discountPercentage: [0.0, [Validators.required, Validators.min(0), Validators.max(100)]]
    });
  }

  onSubmit() {
    if (this.quoteForm.valid) {
      this.dialogRef.close(this.quoteForm.value);
    }
  }

  onCancel() {
    this.dialogRef.close();
  }
}

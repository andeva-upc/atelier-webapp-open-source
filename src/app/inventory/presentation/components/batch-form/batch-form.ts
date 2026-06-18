import { Component, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-batch-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule],
  templateUrl: './batch-form.html',
  styleUrls: ['./batch-form.css']
})
export class BatchFormComponent implements OnInit {
  @Output() save = new EventEmitter<any>();
  @Output() cancel = new EventEmitter<void>();

  batchForm!: FormGroup;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.batchForm = this.fb.group({
      initialQuantity: [null, [Validators.required, Validators.min(1)]],
      acquisitionCost: [null, [Validators.required, Validators.min(0)]]
    });
  }

  onSubmit(): void {
    if (this.batchForm.valid) {
      this.save.emit(this.batchForm.value);
    } else {
      this.batchForm.markAllAsTouched();
    }
  }

  onCancel(): void {
    this.cancel.emit();
  }

  hasError(field: string): boolean {
    const control = this.batchForm.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }
}

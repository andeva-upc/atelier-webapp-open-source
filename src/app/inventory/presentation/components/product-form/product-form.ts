import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule],
  templateUrl: './product-form.html',
  styleUrls: ['./product-form.css']
})
export class ProductFormComponent implements OnInit {
  @Input() initialData: any = {};
  @Input() isEditMode = false;
  
  @Output() save = new EventEmitter<any>();
  @Output() cancel = new EventEmitter<void>();

  productForm!: FormGroup;

  // Categories enum from backend
  categories = [
    { value: 'TIRES', label: 'Llantas' },
    { value: 'SPARE_PARTS', label: 'Repuestos' },
    { value: 'ACCESSORIES', label: 'Accesorios' },
    { value: 'FLUIDS', label: 'Fluidos/Aceites' }
  ];

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.productForm = this.fb.group({
      category: [this.initialData?.category || '', Validators.required],
      name: [this.initialData?.name || '', [Validators.required, Validators.maxLength(100)]],
      sku: [this.initialData?.sku || '', Validators.required],
      description: [this.initialData?.description || ''],
      salePrice: [this.initialData?.salePrice || null, [Validators.required, Validators.min(0)]],
      minimumStock: [this.initialData?.minimumStock || null, [Validators.required, Validators.min(0)]]
    });
  }

  onSubmit(): void {
    if (this.productForm.valid) {
      this.save.emit(this.productForm.value);
    } else {
      this.productForm.markAllAsTouched();
    }
  }

  onCancel(): void {
    this.cancel.emit();
  }

  // Helper to show validation errors in template
  hasError(field: string): boolean {
    const control = this.productForm.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }
}

import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { IotStore } from '../../../application/iot.store';
import { RegisterVehicleCommand } from '../../../domain/model/commands/register-vehicle.command';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-vehicle-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, TranslatePipe, TranslateModule],
  templateUrl: './vehicle-create.html',
  styleUrl: './vehicle-create.css',
})
export class VehicleCreateComponent {
  form: FormGroup;
  isSubmitting = false;
  errorMessage: string | null = null;

  private readonly customerId: string;

  constructor(
    private fb: FormBuilder,
    private store: IotStore,
    private router: Router
  ) {
    this.customerId = localStorage.getItem('customerId') || '';

    this.form = this.fb.group({
      plateNumber: ['', [Validators.required, Validators.maxLength(10)]],
      brand: ['', [Validators.required, Validators.maxLength(60)]],
      model: ['', [Validators.required, Validators.maxLength(60)]],
      year: [
        '',
        [Validators.required, Validators.min(1950), Validators.max(new Date().getFullYear() + 1)],
      ],
      vin: [
        '',
        [
          Validators.required,
          Validators.minLength(17),
          Validators.maxLength(17),
          Validators.pattern(/^[A-HJ-NPR-Z0-9]{17}$/i),
        ],
      ],
    });
  }

  get f() {
    return this.form.controls;
  }

  onSubmit(): void {
    if (this.form.invalid || this.isSubmitting) return;
    this.isSubmitting = true;
    this.errorMessage = null;

    const { plateNumber, brand, model, year, vin } = this.form.value;
    const command = new RegisterVehicleCommand(
      plateNumber.trim().toUpperCase(),
      brand.trim(),
      model.trim(),
      Number(year),
      vin.trim().toUpperCase()
    );

    this.store.registerVehicle(command, this.customerId);

    // Navigate back after brief delay (store handles update reactively)
    setTimeout(() => {
      this.isSubmitting = false;
      this.router.navigate(['/vehicles']);
    }, 500);
  }

  cancel(): void {
    this.router.navigate(['/vehicles']);
  }
}

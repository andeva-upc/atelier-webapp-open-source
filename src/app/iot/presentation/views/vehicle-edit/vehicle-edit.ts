import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { IotStore } from '../../../application/iot.store';
import { UpdateVehicleCommand } from '../../../domain/model/commands/update-vehicle.command';

@Component({
  selector: 'app-vehicle-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, TranslatePipe],
  templateUrl: './vehicle-edit.html',
  styleUrl: './vehicle-edit.css',
})
export class VehicleEditComponent implements OnInit {
  form: FormGroup;
  isSubmitting = false;
  isLoading = true;
  errorMessage: string | null = null;
  vehicleId: string = '';

  constructor(
    private fb: FormBuilder,
    private store: IotStore,
    private router: Router,
    private route: ActivatedRoute
  ) {
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

  ngOnInit(): void {
    this.vehicleId = this.route.snapshot.paramMap.get('id') || '';

    // Try to find from store first (already loaded)
    const customerId = localStorage.getItem('customerId') || '';
    if (this.store.vehicles().length === 0 && customerId) {
      this.store.loadVehiclesByCustomerId(customerId);
    }

    const vehicle = this.store.vehicles().find((v) => v.id === this.vehicleId);
    if (vehicle) {
      this.form.patchValue({
        plateNumber: vehicle.plateNumber,
        brand: vehicle.brand,
        model: vehicle.model,
        year: vehicle.year,
        vin: vehicle.vin,
      });
      this.isLoading = false;
    } else {
      // Brief wait for store to load
      setTimeout(() => {
        const v = this.store.vehicles().find((v) => v.id === this.vehicleId);
        if (v) {
          this.form.patchValue({
            plateNumber: v.plateNumber,
            brand: v.brand,
            model: v.model,
            year: v.year,
            vin: v.vin,
          });
        }
        this.isLoading = false;
      }, 800);
    }
  }

  get f() {
    return this.form.controls;
  }

  onSubmit(): void {
    if (this.form.invalid || this.isSubmitting || !this.vehicleId) return;
    this.isSubmitting = true;
    this.errorMessage = null;

    const { plateNumber, brand, model, year, vin } = this.form.value;
    const command = new UpdateVehicleCommand(
      plateNumber.trim().toUpperCase(),
      brand.trim(),
      model.trim(),
      Number(year),
      vin.trim().toUpperCase()
    );

    this.store.updateVehicle(this.vehicleId, command);

    setTimeout(() => {
      this.isSubmitting = false;
      this.router.navigate(['/vehicles']);
    }, 500);
  }

  cancel(): void {
    this.router.navigate(['/vehicles']);
  }
}

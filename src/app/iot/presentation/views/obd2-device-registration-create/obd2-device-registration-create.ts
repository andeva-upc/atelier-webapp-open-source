import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { IotStore } from '../../../application/iot.store';
import { LinkObd2DeviceCommand } from '../../../domain/model/commands/link-obd2-device.command';

@Component({
  selector: 'app-obd2-device-registration-create',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule
  ],
  templateUrl: './obd2-device-registration-create.html',
  styleUrl: './obd2-device-registration-create.css'
})
export class Obd2DeviceRegistrationCreateComponent implements OnInit {
  private fb = inject(FormBuilder);
  protected store = inject(IotStore);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  linkForm: FormGroup;
  branchId = '';
  errorMessage: string | null = null;

  constructor() {
    this.linkForm = this.fb.group({
      vehicleId: ['', Validators.required],
      obd2DeviceId: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.branchId = localStorage.getItem('tenantBranchId') || '';
    if (this.branchId) {
      this.store.loadAvailableVehicles(this.branchId);
      this.store.loadAvailableObd2Devices(this.branchId);
    }

    // Subscribe to query params to pre-populate the form controls if provided
    this.route.queryParams.subscribe(params => {
      const vId = params['vehicleId'];
      const dId = params['obd2DeviceId'];

      if (vId) {
        this.linkForm.patchValue({ vehicleId: vId });
      }
      if (dId) {
        this.linkForm.patchValue({ obd2DeviceId: dId });
      }
    });
  }

  onSubmit(): void {
    if (this.linkForm.invalid) {
      this.errorMessage = 'iot.linkDialog.errorAllRequired';
      return;
    }

    const { vehicleId, obd2DeviceId } = this.linkForm.value;
    this.errorMessage = null;

    const command = new LinkObd2DeviceCommand(obd2DeviceId, this.branchId, vehicleId);

    this.store.linkObd2Device(command).subscribe({
      next: () => {
        // Redirect to dashboard on successful linking
        this.router.navigate(['/telemetry']);
      },
      error: (err) => {
        console.error('Failed to link OBD2 device to vehicle:', err);
        if (err.status === 409) {
          this.errorMessage = 'iot.linkDialog.errorConflict';
        } else {
          this.errorMessage = 'iot.linkDialog.errorLinking';
        }
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/telemetry']);
  }
}

import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { IotStore } from '../../../application/iot.store';
import { CreateObd2DeviceCommand } from '../../../domain/model/commands/create-obd2-device.command';

@Component({
  selector: 'app-obd2-device-create',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule
  ],
  templateUrl: './obd2-device-create.html',
  styleUrl: './obd2-device-create.css'
})
export class Obd2DeviceCreateComponent implements OnInit {
  private fb = inject(FormBuilder);
  protected store = inject(IotStore);
  private router = inject(Router);

  obd2Form: FormGroup;
  branchId = '';
  errorMessage: string | null = null;

  constructor() {
    this.obd2Form = this.fb.group({
      macAddress: ['', [
        Validators.required,
        Validators.pattern(/^([0-9A-Fa-f]{2}\s*[:-]\s*){5}([0-9A-Fa-f]{2})$/)
      ]]
    });
  }

  ngOnInit(): void {
    this.branchId = localStorage.getItem('tenantBranchId') || '';
  }

  onSubmit(): void {
    if (this.obd2Form.invalid) {
      this.errorMessage = 'iot.obd2Dialog.invalidMac';
      return;
    }

    const mac = this.obd2Form.value.macAddress.replace(/\s+/g, '').toUpperCase();
    this.errorMessage = null;

    if (!this.branchId) {
      this.errorMessage = 'iot.obd2Dialog.errorBadRequest';
      return;
    }

    const command = new CreateObd2DeviceCommand(this.branchId, mac);
    
    this.store.createObd2Device(command).subscribe({
      next: () => {
        // Redirect to list on successful creation
        this.router.navigate(['/telemetry/odb2_devices']);
      },
      error: (err) => {
        console.error('Failed to register OBD2 device:', err);
        if (err.status === 409) {
          this.errorMessage = 'iot.obd2Dialog.errorConflict';
        } else if (err.status === 400) {
          this.errorMessage = 'iot.obd2Dialog.errorBadRequest';
        } else {
          this.errorMessage = 'iot.obd2Dialog.errorSaving';
        }
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/telemetry/odb2_devices']);
  }
}

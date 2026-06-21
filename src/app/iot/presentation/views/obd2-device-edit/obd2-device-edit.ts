import { Component, OnInit, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { IotStore } from '../../../application/iot.store';
import { UpdateObd2DeviceCommand } from '../../../domain/model/commands/update-obd2-device.command';

@Component({
  selector: 'app-obd2-device-edit',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule
  ],
  templateUrl: './obd2-device-edit.html',
  styleUrl: './obd2-device-edit.css'
})
export class Obd2DeviceEditComponent implements OnInit {
  private fb = inject(FormBuilder);
  protected store = inject(IotStore);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  obd2Form: FormGroup;
  deviceId = '';
  errorMessage: string | null = null;

  constructor() {
    this.obd2Form = this.fb.group({
      macAddress: ['', [
        Validators.required,
        Validators.pattern(/^([0-9A-Fa-f]{2}\s*[:-]\s*){5}([0-9A-Fa-f]{2})$/)
      ]]
    });

    // Automatically fill the form when activeObd2Device loads from the store
    effect(() => {
      const device = this.store.activeObd2Device();
      if (device && device.id === this.deviceId) {
        this.obd2Form.patchValue({
          macAddress: device.macAddress
        });
      }
    });
  }

  ngOnInit(): void {
    this.deviceId = this.route.snapshot.paramMap.get('id') || '';
    if (this.deviceId) {
      this.store.loadObd2DeviceById(this.deviceId);
    }
  }

  onSubmit(): void {
    if (this.obd2Form.invalid) {
      this.errorMessage = 'iot.obd2Dialog.invalidMac';
      return;
    }

    const mac = this.obd2Form.value.macAddress.replace(/\s+/g, '').toUpperCase();
    this.errorMessage = null;

    const command = new UpdateObd2DeviceCommand(mac);

    this.store.updateObd2Device(this.deviceId, command).subscribe({
      next: () => {
        // Redirect to list view on successful update
        this.router.navigate(['/telemetry/obd2-devices']);
      },
      error: (err) => {
        console.error('Failed to update OBD2 device:', err);
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
    this.router.navigate(['/telemetry/obd2-devices']);
  }
}

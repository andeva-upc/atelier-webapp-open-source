import { Component, inject, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Modal } from '../../../shared/presentation/modal/modal';
import { TelemetryStore } from '../../application/telemetry.store';

/**
 * Modal component for linking an OBD2 device to a vehicle.
 */
@Component({
  selector: 'app-link-obd-modal',
  standalone: true,
  imports: [CommonModule, TranslateModule, ReactiveFormsModule, Modal],
  templateUrl: './link-obd-modal.html',
  styleUrl: './link-obd-modal.css'
})
export class LinkObdModal {
  private readonly fb = inject(FormBuilder);
  private readonly store = inject(TelemetryStore);

  /** Input indicating if the modal is currently open */
  isOpen = input<boolean>(false);
  /** Output emitted when the modal is closed */
  close = output<void>();

  readonly vehicles = this.store.vehicles;

  linkForm = this.fb.group({
    vehicleId: ['', Validators.required],
    deviceId: ['', Validators.required]
  });

  onClose(): void {
    this.linkForm.reset();
    this.close.emit();
  }

  onSubmit(): void {
    if (this.linkForm.valid) {
      const { deviceId, vehicleId } = this.linkForm.value;
      this.store.linkDevice(deviceId!, vehicleId!);
      this.onClose();
    }
  }
}

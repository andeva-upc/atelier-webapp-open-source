import { Component, Input, Output, EventEmitter, inject, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { IotStore } from '../../../application/iot.store';
import { SharedModalComponent } from '../../../../shared/presentation/components/modal/modal';
import { CreateObd2DeviceCommand } from '../../../domain/model/commands/create-obd2-device.command';
import { UpdateObd2DeviceCommand } from '../../../domain/model/commands/update-obd2-device.command';

@Component({
  selector: 'app-obd2-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule, SharedModalComponent],
  templateUrl: './obd2-dialog.html',
  styleUrl: './obd2-dialog.css'
})
export class Obd2DialogComponent implements OnChanges {
  @Input() isOpen = false;
  @Input() branchId = '';
  @Output() close = new EventEmitter<void>();

  private fb = inject(FormBuilder);
  protected store = inject(IotStore);

  obd2Form: FormGroup;
  editingDeviceId: string | null = null;
  errorMessage: string | null = null;

  constructor() {
    this.obd2Form = this.fb.group({
      macAddress: ['', [
        Validators.required,
        Validators.pattern(/^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/)
      ]]
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isOpen'] && this.isOpen && this.branchId) {
      this.store.loadObd2Devices(this.branchId);
      this.resetForm();
    }
  }

  resetForm(): void {
    this.obd2Form.reset();
    this.editingDeviceId = null;
    this.errorMessage = null;
  }

  onSubmit(): void {
    if (this.obd2Form.invalid) {
      this.errorMessage = 'iot.obd2Dialog.invalidMac';
      return;
    }

    const mac = this.obd2Form.value.macAddress.trim().toUpperCase();
    this.errorMessage = null;

    if (this.editingDeviceId) {
      const command = new UpdateObd2DeviceCommand(mac);
      this.store.updateObd2Device(this.editingDeviceId, command).subscribe({
        next: () => {
          this.resetForm();
        },
        error: (err) => {
          console.error(err);
          this.errorMessage = 'iot.obd2Dialog.errorSaving';
        }
      });
    } else {
      const command = new CreateObd2DeviceCommand(this.branchId, mac);
      this.store.createObd2Device(command).subscribe({
        next: () => {
          this.resetForm();
        },
        error: (err) => {
          console.error(err);
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
  }

  startEdit(device: any): void {
    this.editingDeviceId = device.id;
    this.obd2Form.patchValue({
      macAddress: device.macAddress
    });
  }

  deleteDevice(id: string): void {
    if (confirm('¿Estás seguro de que deseas dar de baja este dispositivo OBD2?')) {
      this.store.deleteObd2Device(id).subscribe({
        error: (err) => {
          console.error(err);
          alert('No se pudo dar de baja el dispositivo.');
        }
      });
    }
  }

  onClose(): void {
    this.close.emit();
  }
}

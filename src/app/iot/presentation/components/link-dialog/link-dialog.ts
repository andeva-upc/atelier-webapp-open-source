import { Component, Input, Output, EventEmitter, inject, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { IotStore } from '../../../application/iot.store';
import { SharedModalComponent } from '../../../../shared/presentation/components/modal/modal';
import { LinkObd2DeviceCommand } from '../../../domain/model/commands/link-obd2-device.command';

@Component({
  selector: 'app-link-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule, SharedModalComponent],
  templateUrl: './link-dialog.html',
  styleUrl: './link-dialog.css'
})
export class LinkDialogComponent implements OnChanges {
  @Input() isOpen = false;
  @Input() branchId = '';
  @Output() close = new EventEmitter<void>();

  private fb = inject(FormBuilder);
  protected store = inject(IotStore);

  linkForm: FormGroup;
  errorMessage: string | null = null;

  constructor() {
    this.linkForm = this.fb.group({
      vehicleId: ['', Validators.required],
      obd2DeviceId: ['', Validators.required]
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isOpen'] && this.isOpen && this.branchId) {
      this.store.loadAvailableObd2Devices(this.branchId);
      this.store.loadAvailableVehicles(this.branchId);
      this.linkForm.reset({
        vehicleId: '',
        obd2DeviceId: ''
      });
      this.errorMessage = null;
    }
  }

  onSubmit(): void {
    if (this.linkForm.invalid) {
      this.errorMessage = 'iot.linkDialog.errorAllRequired';
      return;
    }

    const command = new LinkObd2DeviceCommand(
      this.linkForm.value.obd2DeviceId,
      this.branchId,
      this.linkForm.value.vehicleId
    );

    this.store.linkObd2Device(command);
    this.close.emit();
  }

  onClose(): void {
    this.close.emit();
  }
}

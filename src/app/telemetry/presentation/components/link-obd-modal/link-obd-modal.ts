import { Component, inject, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Modal } from '../../../../shared/presentation/modal/modal';
import { TelemetryStore } from '../../../application/telemetry.store';

@Component({
  selector: 'app-link-obd-modal',
  standalone: true,
  imports: [CommonModule, TranslateModule, ReactiveFormsModule, Modal],
  template: `
    <app-modal [isOpen]="isOpen()" (close)="onClose()">
      <!-- Modal Title -->
      <h2 modal-title class="modal-title">
        {{ 'telemetry.modals.link.title' | translate }}
      </h2>
      
      <!-- Modal Body -->
      <form modal-body [formGroup]="linkForm" (ngSubmit)="onSubmit()" class="link-form">
        <div class="form-group">
          <label for="vehicle">{{ 'telemetry.modals.link.vehicle-label' | translate }}</label>
          <select id="vehicle" formControlName="vehicleId" class="form-control">
            <option value="" disabled>{{ 'telemetry.modals.link.select-vehicle' | translate }}</option>
            @for (v of vehicles(); track v.id) {
              <option [value]="v.id">{{ v.plateNumber }} - {{ v.brand }} {{ v.model }}</option>
            }
          </select>
        </div>

        <div class="form-group">
          <label for="deviceId">{{ 'telemetry.modals.link.device-label' | translate }} *</label>
            <input 
              id="deviceId" 
              type="text" 
              formControlName="deviceId" 
              class="form-control"
              [placeholder]="'telemetry.modals.link.device-placeholder' | translate"
            >
        </div>
      </form>

      <!-- Modal Actions -->
      <div modal-actions class="modal-actions">
        <button type="button" class="btn-secondary" (click)="onClose()">
          {{ 'telemetry.actions.cancel' | translate }}
        </button>
        <button type="button" class="btn-primary" [disabled]="linkForm.invalid" (click)="onSubmit()">
          {{ 'telemetry.actions.link' | translate }}
        </button>
      </div>
    </app-modal>
  `,
  styles: [`
    .modal-title {
      font-size: 1.25rem;
      font-weight: 700;
      color: #1e293b;
      margin: 0;
      font-family: 'Mona Sans', sans-serif;
    }
    .link-form {
      padding: 0.5rem 0;
    }
    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      margin-bottom: 1.5rem;
    }
    .form-group label {
      font-size: 0.875rem;
      font-weight: 500;
      color: #1e293b;
      font-family: 'Arimo', sans-serif;
    }
    .form-control {
      padding: 0.75rem 1rem;
      border-radius: 0.5rem;
      border: 1px solid #e2e8f0;
      background: #f8fafc;
      font-size: 0.9rem;
      color: #1e293b;
      width: 100%;
      box-sizing: border-box;
      transition: all 0.2s;
    }
    .form-control:focus {
      outline: none;
      border-color: #0071EB;
      background: white;
      box-shadow: 0 0 0 3px rgba(0, 113, 235, 0.1);
    }
    .modal-actions {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
      width: 100%;
    }
    .btn-primary {
      background: #0071EB;
      color: white;
      border: none;
      padding: 0.75rem 2.5rem;
      border-radius: 0.5rem;
      font-weight: 600;
      cursor: pointer;
      flex: 1;
    }
    .btn-primary:disabled {
      background: #cbd5e1;
      cursor: not-allowed;
    }
    .btn-secondary {
      background: white;
      color: #64748b;
      border: 1px solid #e2e8f0;
      padding: 0.75rem 2.5rem;
      border-radius: 0.5rem;
      font-weight: 600;
      cursor: pointer;
      flex: 1;
    }
  `]
})
export class LinkObdModal {
  private readonly fb = inject(FormBuilder);
  private readonly store = inject(TelemetryStore);

  isOpen = input<boolean>(false);
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

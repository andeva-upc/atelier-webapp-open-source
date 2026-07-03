import { Component, Input, Output, EventEmitter, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';

import { FleetStore } from '../../../application/fleet.store';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-appointment-selector',
  standalone: true,
  imports: [CommonModule, FormsModule, MatSelectModule, MatFormFieldModule, TranslateModule],
  templateUrl: './appointment-selector.html',
  styleUrl: './appointment-selector.css'
})
export class AppointmentSelectorComponent implements OnInit {
  @Input({ required: true }) branchId!: string;
  @Input() selectedAppointmentId: string | null = null;
  @Input() disabled: boolean = false;
  
  @Output() appointmentSelected = new EventEmitter<{id: string, customerId: string, vehicleId: string}>();

  fleetStore = inject(FleetStore);

  ngOnInit() {
    this.fleetStore.loadAppointmentsByBranchIdAndStatus(this.branchId, 'PENDING');
  }

  onSelectionChange(id: string) {
    const appointment = this.fleetStore.appointments().find(a => a.id === id);
    if (appointment) {
      this.appointmentSelected.emit({
        id: appointment.id,
        customerId: appointment.customerId,
        vehicleId: appointment.vehicleId
      });
    }
  }
}

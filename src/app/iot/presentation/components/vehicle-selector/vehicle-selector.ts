import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { IotStore } from '../../../application/iot.store';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-vehicle-selector',
  standalone: true,
  imports: [CommonModule, MatFormFieldModule, MatSelectModule, FormsModule, TranslateModule],
  templateUrl: './vehicle-selector.html'
})
export class VehicleSelectorComponent implements OnChanges {
  @Input({ required: true }) customerId: string | null = null;
  @Input() selectedVehicleId: string | null = null;
  @Input() disabled: boolean = false;
  
  @Output() vehicleSelected = new EventEmitter<string>();

  iotStore = inject(IotStore);

  ngOnChanges(changes: SimpleChanges) {
    if (changes['customerId'] && this.customerId) {
      this.iotStore.loadVehiclesByCustomerId(this.customerId);
    } else if (changes['customerId'] && !this.customerId) {
      // Clear or do nothing
    }
  }

  onSelectionChange(id: string) {
    this.vehicleSelected.emit(id);
  }
}

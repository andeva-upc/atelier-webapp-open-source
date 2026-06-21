import { Component, Input, Output, EventEmitter, OnInit, signal, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { FleetStore } from '../../../application/fleet.store';
import { CustomerNameComponent } from '../../../../core/presentation/components/customer-name/customer-name';

@Component({
  selector: 'app-customer-selector',
  standalone: true,
  imports: [CommonModule, MatFormFieldModule, MatSelectModule, FormsModule, CustomerNameComponent],
  templateUrl: './customer-selector.html'
})
export class CustomerSelectorComponent implements OnInit {
  @Input({ required: true }) branchId!: string;
  @Input() selectedCustomerId: string | null = null;
  @Input() disabled: boolean = false;
  
  @Output() customerSelected = new EventEmitter<string>();

  fleetStore = inject(FleetStore);

  ngOnInit() {
    this.fleetStore.loadCustomerRegistrationsByBranchIdAndStatus(this.branchId, 'ACTIVE');
  }

  onSelectionChange(id: string) {
    this.customerSelected.emit(id);
  }
}

import { Component, Input, Output, EventEmitter, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { FleetStore } from '../../../application/fleet.store';
import { EmployeeNameComponent } from '../../../../core/presentation/components/employee-name/employee-name';

@Component({
  selector: 'app-mechanic-selector',
  standalone: true,
  imports: [CommonModule, MatFormFieldModule, MatSelectModule, FormsModule, EmployeeNameComponent],
  templateUrl: './mechanic-selector.html'
})
export class MechanicSelectorComponent implements OnInit {
  @Input({ required: true }) branchId!: string;
  @Input() selectedMechanicId: string | null = null;
  @Input() disabled: boolean = false;
  
  @Output() mechanicSelected = new EventEmitter<string>();

  fleetStore = inject(FleetStore);

  ngOnInit() {
    this.fleetStore.loadEmployeeRegistrationsByBranchIdAndStatus(this.branchId, 'ACTIVE');
  }

  onSelectionChange(id: string) {
    this.mechanicSelected.emit(id);
  }
}

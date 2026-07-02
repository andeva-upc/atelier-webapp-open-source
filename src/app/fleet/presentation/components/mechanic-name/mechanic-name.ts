import { Component, Input, OnChanges, SimpleChanges, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FleetStore } from '../../../application/fleet.store';
import { EmployeeNameComponent } from '../../../../core/presentation/components/employee-name/employee-name';

@Component({
  selector: 'app-mechanic-name',
  standalone: true,
  imports: [CommonModule, EmployeeNameComponent],
  templateUrl: './mechanic-name.html'
})
export class MechanicNameComponent implements OnChanges {
  @Input({ required: true }) mechanicId!: string;
  private fleetStore = inject(FleetStore);

  employeeId = signal<string>('');
  loading = signal<boolean>(true);
  error = signal<boolean>(false);

  ngOnChanges(changes: SimpleChanges) {
    if (changes['mechanicId']) {
      this.fetchEmployeeRegistration();
    }
  }

  private fetchEmployeeRegistration() {
    if (!this.mechanicId) {
      this.loading.set(false);
      return;
    }

    this.loading.set(true);
    this.error.set(false);

    this.fleetStore.getEmployeeRegistrationByIdObservable(this.mechanicId).subscribe({
      next: (registration) => {
        this.employeeId.set(registration.employeeId);
        this.loading.set(false);
      },
      error: () => {
        this.error.set(true);
        this.loading.set(false);
      }
    });
  }
}

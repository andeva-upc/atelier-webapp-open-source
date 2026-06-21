import { Component, Input, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CoreStore } from '../../../application/core.store';

@Component({
  selector: 'app-employee-name',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './employee-name.html'
})
export class EmployeeNameComponent implements OnInit {
  @Input({ required: true }) employeeId!: string;
  private coreStore = inject(CoreStore);

  name = signal<string>('');
  loading = signal<boolean>(true);
  error = signal<boolean>(false);

  ngOnInit() {
    this.coreStore.getEmployeeByIdObservable(this.employeeId).subscribe({
      next: (employee) => {
        this.name.set(`${employee.firstName} ${employee.lastName}`);
        this.loading.set(false);
      },
      error: () => {
        this.error.set(true);
        this.loading.set(false);
      }
    });
  }
}

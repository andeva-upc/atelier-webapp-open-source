import { Component, Input, OnInit, OnChanges, SimpleChanges, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CoreStore } from '../../../application/core.store';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-employee-name',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './employee-name.html'
})
export class EmployeeNameComponent implements OnInit, OnChanges {
  @Input({ required: true }) employeeId!: string;
  private coreStore = inject(CoreStore);

  name = signal<string>('');
  loading = signal<boolean>(true);
  error = signal<boolean>(false);

  ngOnInit() {
    this.fetchEmployee();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['employeeId'] && !changes['employeeId'].isFirstChange()) {
      this.fetchEmployee();
    }
  }

  private fetchEmployee() {
    if (!this.employeeId) return;

    this.loading.set(true);
    this.error.set(false);

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


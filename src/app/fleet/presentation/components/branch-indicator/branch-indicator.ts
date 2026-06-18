import { Component, OnInit, signal, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FleetStore } from '../../../application/fleet.store';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-fleet-branch-indicator',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './branch-indicator.html',
  styleUrl: './branch-indicator.css'
})
export class FleetBranchIndicatorComponent implements OnInit {
  private fleetStore = inject(FleetStore);
  private http = inject(HttpClient);

  branchName = signal<string>('');
  activeRole = localStorage.getItem('activeRole') || '';

  constructor() {
    effect(() => {
      const activeEmployeeReg = this.fleetStore.activeEmployeeRegistration();
      if (this.activeRole.includes('EMPLOYEE') && activeEmployeeReg && activeEmployeeReg.branchId) {
        this.fetchBranchName(activeEmployeeReg.branchId);
      }
    });

    effect(() => {
      const activeCustomerReg = this.fleetStore.activeCustomerRegistration();
      if (this.activeRole.includes('CUSTOMER') && activeCustomerReg && activeCustomerReg.branchId) {
        this.fetchBranchName(activeCustomerReg.branchId);
      }
    });
  }

  ngOnInit() {
    const employeeId = localStorage.getItem('employeeId');
    const customerId = localStorage.getItem('customerId');

    if (this.activeRole.includes('EMPLOYEE') && employeeId) {
      this.fleetStore.loadEmployeeRegistrationByEmployeeId(employeeId);
    } else if (this.activeRole.includes('CUSTOMER') && customerId) {
      this.fleetStore.loadCustomerRegistrationByCustomerId(customerId);
    }
  }

  private fetchBranchName(branchId: string) {
    const url = `${environment.apiBaseUrl}${environment.endpoints.core.branches}/${branchId}`;
    this.http.get<any>(url).subscribe({
      next: (branch) => {
        if (branch && branch.name) {
          this.branchName.set(branch.name);
          localStorage.setItem('tenantBranchId', branchId);
        }
      },
      error: (err) => console.error('Failed to fetch branch name:', err)
    });
  }
}

import { Component, OnInit, signal, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FleetStore } from '../../../application/fleet.store';
import { environment } from '../../../../../environments/environment';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-fleet-branch-indicator',
  standalone: true,
  imports: [CommonModule, TranslateModule],
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
      console.log('[FleetBranchIndicator] activeEmployeeReg signal emitted:', activeEmployeeReg);
      const activeRole = localStorage.getItem('activeRole') || '';
      if (activeRole.includes('EMPLOYEE') && activeEmployeeReg && activeEmployeeReg.branchId) {
        this.fetchBranchName(activeEmployeeReg.branchId);
      }
    });

    effect(() => {
      const activeCustomerReg = this.fleetStore.activeCustomerRegistration();
      console.log('[FleetBranchIndicator] activeCustomerReg signal emitted:', activeCustomerReg);
      const activeRole = localStorage.getItem('activeRole') || '';
      if (activeRole.includes('CUSTOMER') && activeCustomerReg && activeCustomerReg.branchId) {
        this.fetchBranchName(activeCustomerReg.branchId);
      }
    });
  }

  ngOnInit() {
    let attempts = 0;
    console.log('[FleetBranchIndicator] OnInit started. activeRole:', this.activeRole);
    const interval = setInterval(() => {
      attempts++;
      const activeRole = localStorage.getItem('activeRole') || '';
      const employeeId = localStorage.getItem('employeeId');
      const customerId = localStorage.getItem('customerId');

      if (activeRole.includes('EMPLOYEE') && employeeId) {
        console.log('[FleetBranchIndicator] Polling found Employee role & employeeId:', employeeId);
        this.fleetStore.loadEmployeeRegistrationByEmployeeId(employeeId);
        clearInterval(interval);
      } else if (activeRole.includes('CUSTOMER') && customerId) {
        console.log('[FleetBranchIndicator] Polling found Customer role & customerId:', customerId);
        this.fleetStore.loadCustomerRegistrationByCustomerId(customerId);
        clearInterval(interval);
      }

      if (attempts >= 100) {
        console.log('[FleetBranchIndicator] Polling timed out after 10s. activeRole:', activeRole, 'employeeId:', employeeId, 'customerId:', customerId);
        clearInterval(interval);
      }
    }, 100);
  }

  private fetchBranchName(branchId: string) {
    const url = `${environment.apiBaseUrl}${environment.endpoints.core.branches}/${branchId}`;
    console.log('[FleetBranchIndicator] Fetching branch name from:', url);
    this.http.get<any>(url).subscribe({
      next: (branch) => {
        console.log('[FleetBranchIndicator] Branch fetched successfully:', branch);
        if (branch && branch.name) {
          this.branchName.set(branch.name);
          localStorage.setItem('tenantBranchId', branchId);
        }
      },
      error: (err) => console.error('[FleetBranchIndicator] Failed to fetch branch name:', err)
    });
  }
}

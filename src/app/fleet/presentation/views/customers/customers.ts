import { Component, OnInit, signal, computed, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { forkJoin } from 'rxjs';

import { CoreStore } from '../../../../core/application/core.store';
import { CoreApi } from '../../../../core/infrastructure/core-api';
import { FleetApi } from '../../../infrastructure/fleet-api';
import { CustomerResource } from '../../../../core/infrastructure/responses/customer-response';

export interface CustomerViewModel {
  registrationId: string;
  customerId: string;
  branchId: string;
  status: string;
  createdAt: string;
  
  // Enriched fields from profile
  firstName: string;
  lastName: string;
  businessName: string;
  documentType: string;
  documentNumber: string;
  phone: string;
  isCorporate: boolean;
}

@Component({
  selector: 'app-customers-view',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule
  ],
  templateUrl: './customers.html',
  styleUrls: ['./customers.css']
})
export class CustomersViewComponent implements OnInit {
  private coreStore = inject(CoreStore);
  private coreApi = inject(CoreApi);
  private fleetApi = inject(FleetApi);

  isLoading = signal<boolean>(false);
  customers = signal<CustomerViewModel[]>([]);
  searchQuery = signal<string>('');

  constructor() {
    // Reactively load registrations when active branch changes
    effect(() => {
      const branch = this.coreStore.currentBranch();
      if (branch?.id) {
        this.loadCustomers(branch.id.toString());
      } else {
        this.customers.set([]);
      }
    });
  }

  ngOnInit(): void {}

  private loadCustomers(branchId: string): void {
    this.isLoading.set(true);
    this.fleetApi.customerRegistrations.getByBranchId(branchId).subscribe({
      next: (registrations) => {
        const activeRegs = registrations.filter(r => r.status === 'ACTIVE');
        if (activeRegs.length === 0) {
          this.customers.set([]);
          this.isLoading.set(false);
          return;
        }

        // Fetch each customer profile details
        const profileRequests = activeRegs.map(r => this.coreApi.customers.getById(r.customerId));
        forkJoin(profileRequests).subscribe({
          next: (profiles: CustomerResource[]) => {
            const mapped: CustomerViewModel[] = activeRegs.map((reg, index) => {
              const profile = profiles[index];
              return {
                registrationId: reg.id,
                customerId: reg.customerId,
                branchId: reg.branchId,
                status: reg.status,
                createdAt: reg.createdAt,
                firstName: profile.firstName || '',
                lastName: profile.lastName || '',
                businessName: profile.businessName || '',
                documentType: profile.documentType || '',
                documentNumber: profile.documentNumber || '',
                phone: profile.phone || '',
                isCorporate: profile.isCorporate || false
              };
            });
            this.customers.set(mapped);
            this.isLoading.set(false);
          },
          error: (err) => {
            console.error('Failed to load customer profiles:', err);
            this.isLoading.set(false);
          }
        });
      },
      error: (err) => {
        console.error('Failed to load customer registrations:', err);
        this.isLoading.set(false);
      }
    });
  }

  // Computed signal to filter customers by search query
  filteredCustomers = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const allCustomers = this.customers();

    if (!query) {
      return allCustomers;
    }

    return allCustomers.filter(c => {
      const fullName = `${c.firstName} ${c.lastName}`.toLowerCase();
      const businessName = c.businessName.toLowerCase();
      const docNum = c.documentNumber.toLowerCase();
      const phone = c.phone.toLowerCase();

      return fullName.includes(query) ||
             businessName.includes(query) ||
             docNum.includes(query) ||
             phone.includes(query);
    });
  });
}

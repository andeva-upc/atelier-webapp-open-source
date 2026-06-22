import { Component, OnInit, signal, computed, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { CoreStore } from '../../../../core/application/core.store';
import { CoreApi } from '../../../../core/infrastructure/core-api';
import { IamApi } from '../../../../iam/infrastructure/iam-api';
import { FleetApi } from '../../../infrastructure/fleet-api';
import { FleetStore } from '../../../application/fleet.store';
import { CustomerResource } from '../../../../core/infrastructure/responses/customer-response';
import { CreateCustomerCommand } from '../../../../core/domain/model/commands/create-customer.command';
import { CreateCustomerRegistrationCommand } from '../../../domain/model/commands/create-customer-registration.command';

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
  private iamApi = inject(IamApi);
  private fleetApi = inject(FleetApi);
  private fleetStore = inject(FleetStore);
  private translate = inject(TranslateService);

  isLoading = signal<boolean>(false);
  customers = signal<CustomerViewModel[]>([]);
  searchQuery = signal<string>('');

  // --- Add Modal State Signals ---
  isAddModalOpen = signal<boolean>(false);
  searchEmail = signal<string>('');
  searchedCustomer = signal<CustomerResource | null>(null);
  foundUserId = signal<string | null>(null);
  isSearching = signal<boolean>(false);
  modalErrorMessage = signal<string>('');
  
  // --- Create Profile Form Signals ---
  showCreateProfileForm = signal<boolean>(false);
  newFirstName = signal<string>('');
  newLastName = signal<string>('');
  newDocType = signal<string>('DNI');
  newDocNumber = signal<string>('');
  newPhone = signal<string>('');
  newBusinessName = signal<string>('');
  newIsCorporate = signal<boolean>(false);

  // --- Dropdown State Signals ---
  openDropdownId = signal<string | null>(null);

  // --- Deregister Modal State Signals ---
  isDeregisterModalOpen = signal<boolean>(false);
  customerToDeregister = signal<CustomerViewModel | null>(null);
  isDeregistering = signal<boolean>(false);
  deregisterErrorMessage = signal<string>('');

  constructor() {
    // Reactively load registrations when active branch changes
    effect(() => {
      const branch = this.coreStore.currentBranch();
      if (branch?.id) {
        this.fleetStore.loadCustomerRegistrationsByBranchId(branch.id.toString());
      } else {
        this.customers.set([]);
      }
    });

    // Reactively enrich registrations whenever they change in the FleetStore
    effect(() => {
      const registrations = this.fleetStore.customerRegistrations();
      const activeRegs = registrations.filter(r => r.status === 'ACTIVE');
      
      if (activeRegs.length === 0) {
        this.customers.set([]);
        this.isLoading.set(false);
        return;
      }

      this.isLoading.set(true);
      const profileRequests = activeRegs.map(r => 
        this.coreApi.customers.getById(r.customerId).pipe(
          catchError(err => {
            console.error('Customer profile not found for ID:', r.customerId, err);
            return of(null);
          })
        )
      );
      
      forkJoin(profileRequests).subscribe({
        next: (profiles) => {
          const mapped: CustomerViewModel[] = [];
          
          activeRegs.forEach((reg, index) => {
            const profile = profiles[index];
            if (profile) {
              mapped.push({
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
              });
            }
          });
          
          this.customers.set(mapped);
          this.isLoading.set(false);
        },
        error: (err) => {
          console.error('Failed to load customer profiles:', err);
          this.isLoading.set(false);
        }
      });
    }, { allowSignalWrites: true });
  }

  ngOnInit(): void {}

  // --- Add Modal Action Methods ---
  
  openAddModal(): void {
    this.isAddModalOpen.set(true);
    this.searchEmail.set('');
    this.searchedCustomer.set(null);
    this.foundUserId.set(null);
    this.showCreateProfileForm.set(false);
    this.modalErrorMessage.set('');
  }

  closeAddModal(): void {
    this.isAddModalOpen.set(false);
  }

  onSearchCustomer(): void {
    this.modalErrorMessage.set('');
    this.searchedCustomer.set(null);
    this.foundUserId.set(null);
    this.showCreateProfileForm.set(false);
    
    const email = this.searchEmail().trim();
    if (!email) {
      return;
    }

    this.isSearching.set(true);

    // 1. Query global IAM registry by email
    this.iamApi.getUserByEmail(email).subscribe({
      next: (user) => {
        // 2. Si el usuario existe, buscar su perfil de cliente en Core
        this.coreApi.customers.getByUserId(user.id).subscribe({
          next: (profile) => {
            // Check local duplicates (already registered in this branch)
            const isAlreadyRegistered = this.customers().some(c => c.customerId === profile.id);
            if (isAlreadyRegistered) {
              this.modalErrorMessage.set(this.translate.instant('fleet.customers.addModal.alreadyRegistered'));
            } else {
              this.searchedCustomer.set(profile);
            }
            this.isSearching.set(false);
          },
          error: (err) => {
            console.error('Customer profile not found for user:', err);
            // El usuario existe pero no tiene perfil de cliente. 
            this.modalErrorMessage.set(this.translate.instant('fleet.customers.addModal.userHasNoProfile'));
            this.foundUserId.set(user.id);
            this.showCreateProfileForm.set(true);
            this.isSearching.set(false);
          }
        });
      },
      error: (err) => {
        console.error('User search by email failed:', err);
        this.modalErrorMessage.set(this.translate.instant('fleet.customers.addModal.notFound'));
        this.isSearching.set(false);
      }
    });
  }

  onRegisterCustomer(): void {
    const profile = this.searchedCustomer();
    const branch = this.coreStore.currentBranch();
    
    if (!profile || !branch?.id) return;

    const command = new CreateCustomerRegistrationCommand(profile.id, branch.id.toString());
    this.fleetStore.createCustomerRegistration(command);
    this.closeAddModal();
  }

  onCreateAndRegisterCustomer(): void {
    const userId = this.foundUserId();
    const branch = this.coreStore.currentBranch();
    
    if (!userId || !branch?.id) return;

    const command = new CreateCustomerCommand({
      userId: userId,
      firstName: this.newFirstName(),
      lastName: this.newLastName(),
      businessName: this.newBusinessName(),
      documentType: this.newDocType(),
      documentNumber: this.newDocNumber(),
      phone: this.newPhone(),
      isCorporate: this.newIsCorporate()
    });

    this.coreApi.customers.create(command).subscribe({
      next: (profile) => {
        const regCommand = new CreateCustomerRegistrationCommand(profile.id, branch.id.toString());
        this.fleetStore.createCustomerRegistration(regCommand);
        this.closeAddModal();
      },
      error: (err) => {
        console.error('Error creating customer profile:', err);
        this.modalErrorMessage.set(this.translate.instant('fleet.customers.addModal.createProfileError'));
      }
    });
  }

  // --- Dropdown Methods ---

  toggleDropdown(registrationId: string, event: Event): void {
    event.stopPropagation();
    if (this.openDropdownId() === registrationId) {
      this.openDropdownId.set(null);
    } else {
      this.openDropdownId.set(registrationId);
    }
  }

  closeDropdown(): void {
    this.openDropdownId.set(null);
  }

  // --- Deregister Modal Methods ---

  openDeregisterModal(customer: CustomerViewModel): void {
    this.closeDropdown();
    this.customerToDeregister.set(customer);
    this.isDeregisterModalOpen.set(true);
  }

  closeDeregisterModal(): void {
    this.isDeregisterModalOpen.set(false);
    this.customerToDeregister.set(null);
  }

  onDeregisterCustomer(): void {
    const customer = this.customerToDeregister();
    if (!customer) return;

    this.isDeregistering.set(true);
    this.deregisterErrorMessage.set('');
    
    // El backend de Render no tiene el DELETE activado, así que hacemos un "Soft Delete" actualizando el estado a INACTIVE
    this.fleetStore.updateCustomerRegistration(customer.registrationId, { status: 'INACTIVE' }).subscribe({
      next: () => {
        this.isDeregistering.set(false);
        this.closeDeregisterModal();
      },
      error: (err) => {
        console.error('Deregister failed', err);
        this.isDeregistering.set(false);
        this.deregisterErrorMessage.set(err.message || 'Error al intentar desvincular al cliente. Revisa la consola.');
      }
    });
  }

  // --- Computed filter logic ---
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

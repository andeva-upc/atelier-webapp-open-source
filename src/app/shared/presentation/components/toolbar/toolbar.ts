import { Component, computed, signal, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { LayoutService } from '../layout/layout.service';

import { SharedLanguageSelectorComponent } from '../language-selector/language-selector';
import { CoreBranchSelectorComponent } from '../../../../core/presentation/components/branch-selector/branch-selector';
import { CoreUserInfoComponent } from '../../../../core/presentation/components/user-profile-button/user-profile-button';
import { IamLogoutButtonComponent } from '../../../../iam/presentation/components/logout-menu-item/logout-menu-item';
import { CoreStore } from '../../../../core/application/core.store';
import { FleetStore } from '../../../../fleet/application/fleet.store';

@Component({
  selector: 'app-toolbar',
  imports: [
    CommonModule, 
    MatToolbarModule, 
    MatMenuModule, 
    MatBadgeModule,
    TranslateModule,
    SharedLanguageSelectorComponent,
    CoreBranchSelectorComponent,
    CoreUserInfoComponent,
    IamLogoutButtonComponent
  ],
  templateUrl: './toolbar.html',
  styleUrl: './toolbar.css',
})
export class Toolbar {
  private coreStore = inject(CoreStore);
  private fleetStore = inject(FleetStore);

  constructor(
    private translate: TranslateService,
    public layoutService: LayoutService
  ) {
    this.translate.setFallbackLang('es');

    effect(() => {
      const customer = this.coreStore.currentCustomer();
      if (customer && customer.id) {
        this.fleetStore.loadCustomerRegistrationById(customer.id);
      }
    });

    effect(() => {
      const employee = this.coreStore.currentEmployee();
      if (employee && employee.id) {
        this.fleetStore.loadEmployeeRegistrationById(employee.id);
      }
    });

    effect(() => {
      const customerReg = this.fleetStore.activeCustomerRegistration();
      if (customerReg && customerReg.branchId) {
        this.coreStore.loadBranchById(customerReg.branchId);
      }
    });

    effect(() => {
      const employeeReg = this.fleetStore.activeEmployeeRegistration();
      if (employeeReg && employeeReg.branchId) {
        this.coreStore.loadBranchById(employeeReg.branchId);
      }
    });
  }

  get currentLang(): string | null {
    return this.translate.getFallbackLang();
  }

  switchLanguage(lang: string) {
    this.translate.use(lang);
  }

  hasNotifications = computed(() => this.notificationCount() > 0);

  notificationCount = signal(0);
}

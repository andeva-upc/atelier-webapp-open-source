import { Component, Input, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CoreStore } from '../../../application/core.store';

@Component({
  selector: 'app-customer-name',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './customer-name.html'
})
export class CustomerNameComponent implements OnInit {
  @Input({ required: true }) customerId!: string;
  private coreStore = inject(CoreStore);

  name = signal<string>('');
  loading = signal<boolean>(true);
  error = signal<boolean>(false);

  ngOnInit() {
    this.coreStore.getCustomerByIdObservable(this.customerId).subscribe({
      next: (customer) => {
        this.name.set(customer.isCorporate ? customer.businessName : `${customer.firstName} ${customer.lastName}`);
        this.loading.set(false);
      },
      error: () => {
        this.error.set(true);
        this.loading.set(false);
      }
    });
  }
}

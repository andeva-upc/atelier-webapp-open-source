import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe, CurrencyPipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { InventoryStore } from '../../../application/inventory.store';

@Component({
  selector: 'app-batch-list-view',
  standalone: true,
  imports: [CommonModule, DatePipe, CurrencyPipe],
  templateUrl: './batch-list-view.html',
  styleUrls: ['./batch-list-view.css']
})
export class BatchListViewComponent implements OnInit {
  private store = inject(InventoryStore);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  productId: string | null = null;
  activeProduct = this.store.activeProduct;

  ngOnInit(): void {
    this.productId = this.route.snapshot.paramMap.get('id');
    if (this.productId) {
      this.store.loadProductById(this.productId);
    }
  }

  onBack(): void {
    if (this.productId) {
      this.router.navigate(['/inventory/products', this.productId]);
    } else {
      this.router.navigate(['/inventory']);
    }
  }

  onAddBatch(): void {
    if (this.productId) {
      this.router.navigate(['/inventory/products', this.productId, 'batches', 'new']);
    }
  }
}

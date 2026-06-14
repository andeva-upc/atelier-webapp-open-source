import { Routes } from '@angular/router';
import { InventoryListComponent } from './presentation/views/inventory-list/inventory-list';
import { ProductFormViewComponent } from './presentation/views/product-form-view/product-form-view';
import { ProductDetailViewComponent } from './presentation/views/product-detail-view/product-detail-view';
import { BatchListViewComponent } from './presentation/views/batch-list-view/batch-list-view';
import { BatchFormViewComponent } from './presentation/views/batch-form-view/batch-form-view';
import { InventoryLayoutComponent } from './presentation/components/inventory-layout/inventory-layout';

export const INVENTORY_ROUTES: Routes = [
  {
    path: '',
    component: InventoryLayoutComponent,
    children: [
      { path: '', component: InventoryListComponent },
      { path: 'products/new', component: ProductFormViewComponent },
      { path: 'products/:id/edit', component: ProductFormViewComponent },
      { path: 'products/:id', component: ProductDetailViewComponent },
      { path: 'products/:id/batches', component: BatchListViewComponent },
      { path: 'products/:id/batches/new', component: BatchFormViewComponent }
    ]
  }
];

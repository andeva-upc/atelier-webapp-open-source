import { Routes } from '@angular/router';
import { InventoryListComponent } from './presentation/views/inventory-list/inventory-list';
import { ProductFormComponent } from './presentation/views/product-form/product-form';
import { BatchFormComponent } from './presentation/views/batch-form/batch-form';

export const INVENTORY_ROUTES: Routes = [
  { path: '', component: InventoryListComponent },
  { path: 'products/new', component: ProductFormComponent },
  { path: 'batches/new', component: BatchFormComponent }
];

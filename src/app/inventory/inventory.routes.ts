import { Routes } from '@angular/router';
import { InventoryListComponent } from './presentation/views/inventory-list/inventory-list';
import { ProductFormViewComponent } from './presentation/views/product-form-view/product-form-view';
import { ProductDetailViewComponent } from './presentation/views/product-detail-view/product-detail-view';

export const INVENTORY_ROUTES: Routes = [
  { path: '', component: InventoryListComponent },
  { path: 'products/new', component: ProductFormViewComponent },
  { path: 'products/:id/edit', component: ProductFormViewComponent },
  { path: 'products/:id', component: ProductDetailViewComponent }
];

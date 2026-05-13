import { Routes } from '@angular/router';
import { InventoryList } from './views/inventory-list/inventory-list';

export const inventoryRoutes: Routes = [
  {
    path: '',
    component: InventoryList,
  },
];

import { Routes } from '@angular/router';
import { InventoryListComponent } from './views/inventory-list/inventory-list.component';

const inventoryRoutes: Routes = [
  {
    path: '',
    component: InventoryListComponent
  }
];

export default inventoryRoutes;

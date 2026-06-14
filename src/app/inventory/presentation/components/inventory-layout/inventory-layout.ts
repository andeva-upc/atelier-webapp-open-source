import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { LeftSidebar } from '../../../../shared/presentation/components/left-sidebar/left-sidebar';
import { Toolbar } from '../../../../shared/presentation/components/toolbar/toolbar';

@Component({
  selector: 'app-inventory-layout',
  standalone: true,
  imports: [RouterOutlet, CommonModule, LeftSidebar, Toolbar],
  templateUrl: './inventory-layout.html',
  styleUrl: './inventory-layout.css'
})
export class InventoryLayoutComponent {}

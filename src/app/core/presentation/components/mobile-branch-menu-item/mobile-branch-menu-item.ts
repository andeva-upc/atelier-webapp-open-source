import { Component, inject, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatMenuModule } from '@angular/material/menu';
import { CoreStore } from '../../../application/core.store';
import { BranchResource } from '../../../infrastructure/responses/branch-response';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-core-mobile-branch-menu-item',
  standalone: true,
  imports: [CommonModule, MatMenuModule, TranslateModule],
  encapsulation: ViewEncapsulation.None,
  templateUrl: './mobile-branch-menu-item.html',
  styleUrls: ['./mobile-branch-menu-item.css']
})
export class CoreMobileBranchMenuItemComponent {
  private coreStore = inject(CoreStore);
  activeRole = localStorage.getItem('activeRole') || sessionStorage.getItem('activeRole') || '';
  currentBranch = this.coreStore.currentBranch;
  currentWorkshopBranches = this.coreStore.currentWorkshopBranches;

  onBranchSelect(branch: BranchResource) {
    this.coreStore.selectBranch(branch);
  }
}

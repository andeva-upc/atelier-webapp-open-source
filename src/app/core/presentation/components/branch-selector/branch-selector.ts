import { Component, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatMenuModule } from '@angular/material/menu';
import { CoreStore } from '../../../application/core.store';
import { BranchResource } from '../../../infrastructure/responses/branch-response';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-core-branch-selector',
  standalone: true,
  imports: [CommonModule, MatMenuModule, TranslateModule],
  templateUrl: './branch-selector.html',
  styleUrl: './branch-selector.css'
})
export class CoreBranchSelectorComponent {
  private coreStore = inject(CoreStore);
  activeRole = localStorage.getItem('activeRole') || sessionStorage.getItem('activeRole') || '';
  currentBranch = this.coreStore.currentBranch;
  currentWorkshopBranches = this.coreStore.currentWorkshopBranches;

  @ViewChild('branchMenu') branchMenu: any;

  onBranchSelect(branch: BranchResource) {
    this.coreStore.selectBranch(branch);
  }
}

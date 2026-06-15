import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { LayoutService } from '../layout/layout.service';

import { SharedLanguageSelectorComponent } from '../language-selector/language-selector';
import { CoreBranchSelectorComponent } from '../../../../core/presentation/components/branch-selector/branch-selector';
import { CoreUserInfoComponent } from '../../../../core/presentation/components/user-profile-button/user-profile-button';
import { IamLogoutButtonComponent } from '../../../../iam/presentation/components/logout-menu-item/logout-menu-item';

@Component({
  selector: 'app-toolbar',
  imports: [
    CommonModule, 
    MatToolbarModule, 
    MatMenuModule, 
    MatBadgeModule,
    TranslateModule,
    SharedLanguageSelectorComponent,
    CoreBranchSelectorComponent,
    CoreUserInfoComponent,
    IamLogoutButtonComponent
  ],
  templateUrl: './toolbar.html',
  styleUrl: './toolbar.css',
})
export class Toolbar {

  constructor(
    private translate: TranslateService,
    public layoutService: LayoutService
  ) {
    this.translate.setFallbackLang('es');
  }

  get currentLang(): string | null {
    return this.translate.getFallbackLang();
  }

  switchLanguage(lang: string) {
    this.translate.use(lang);
  }

  hasNotifications = computed(() => this.notificationCount() > 0);

  notificationCount = signal(0);
}

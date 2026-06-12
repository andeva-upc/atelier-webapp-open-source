import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { TranslateService } from '@ngx-translate/core';
import { LayoutService } from '../layout/layout.service';

@Component({
  selector: 'app-toolbar',
  imports: [CommonModule, MatToolbarModule, MatMenuModule, MatBadgeModule],
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

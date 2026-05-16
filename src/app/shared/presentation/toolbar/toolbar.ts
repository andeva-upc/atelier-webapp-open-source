import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-toolbar',
  imports: [CommonModule, MatToolbarModule, MatMenuModule, MatBadgeModule],
  templateUrl: './toolbar.html',
  styleUrl: './toolbar.css',
})
export class Toolbar {
  notificationCount = signal(0);
  currentUser = signal({
    name: 'Juan Carlos',
    email: 'juan@example.com'
  });

  constructor(private translate: TranslateService) {
    this.translate.setDefaultLang('es');
  }

  userInitials = computed(() => {
    return this.currentUser().name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .join('')
      .slice(0, 2);
  });

  hasNotifications = computed(() => this.notificationCount() > 0);

  get currentLang(): string {
    return this.translate.currentLang || this.translate.defaultLang || 'es';
  }

  switchLanguage(lang: string) {
    this.translate.use(lang);
  }
}


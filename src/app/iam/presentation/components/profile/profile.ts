import { Component, computed, input, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { IamStore } from '../../../application/iam.store';
import { Router } from '@angular/router';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { CoreMobileBranchMenuItemComponent } from '../../../../core/presentation/components/mobile-branch-menu-item/mobile-branch-menu-item';

@Component({
  selector: 'app-profile',
  imports: [
    CommonModule, MatToolbarModule, MatMenuModule, MatBadgeModule, TranslateModule, CoreMobileBranchMenuItemComponent
  ],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile implements OnInit {
  public userName = input<string>('');
  
  private iamStore = inject(IamStore);
  private router = inject(Router);
  private translate = inject(TranslateService);
  activeRole = signal<string>('');

  ngOnInit() {
    const role = localStorage.getItem('activeRole') || sessionStorage.getItem('activeRole') || '';
    this.activeRole.set(role);
  }

  currentLang = computed(() => this.translate.getFallbackLang());

  switchLanguage(lang: string) {
    this.translate.use(lang);
  }

  userInitials = computed(() => {
    const name = this.userName() || 'Usuario';
    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .join('')
      .slice(0, 2);
  });

  onSignOut() {
    this.iamStore.signOut(this.router);
  }
}

import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LayoutService {
  isMobileSidebarOpen = signal(false);

  isDesktopSidebarExpanded = signal(false);

  toggleMobileSidebar() {
    this.isMobileSidebarOpen.update(val => !val);
  }

  closeMobileSidebar() {
    this.isMobileSidebarOpen.set(false);
  }

  toggleDesktopSidebar() {
    this.isDesktopSidebarExpanded.update(val => !val);
  }
}

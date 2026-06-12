import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';

@Component({
  selector: 'app-profile',
  imports: [
    CommonModule, MatToolbarModule, MatMenuModule, MatBadgeModule
  ],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile {

  currentUser = signal({
    name: 'Juan Carlos',
    email: 'juan@example.com'
  });


  userInitials = computed(() => {
    return this.currentUser().name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .join('')
      .slice(0, 2);
  });

}

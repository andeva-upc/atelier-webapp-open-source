import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-home-dashboard',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './home-dashboard.html',
  styleUrls: ['./home-dashboard.css']
})
export class HomeDashboardComponent {
  activeRole: string = '';

  constructor() {
    this.activeRole = localStorage.getItem('activeRole') || sessionStorage.getItem('activeRole') || '';
  }
}

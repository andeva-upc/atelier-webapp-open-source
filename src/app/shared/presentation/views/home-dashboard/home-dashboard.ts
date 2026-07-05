import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home-dashboard',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './home-dashboard.html',
  styleUrls: ['./home-dashboard.css']
})
export class HomeDashboardComponent implements OnInit {
  activeRole: string = '';

  constructor(private router: Router) {}

  ngOnInit() {
    this.activeRole = localStorage.getItem('activeRole') || sessionStorage.getItem('activeRole') || '';
    
    if (this.activeRole.includes('CUSTOMER')) {
      this.router.navigate(['/customer/dashboard']);
    } else if (this.activeRole.includes('OWNER') || this.activeRole.includes('EMPLOYEE')) {
      this.router.navigate(['/admin/dashboard']);
    }
  }
}

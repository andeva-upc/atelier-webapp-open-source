import { Component, inject } from '@angular/core';
import { IamStore } from '../../../application/iam.store';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-iam-logout',
  standalone: true,
  imports: [TranslateModule],
  templateUrl: './logout-menu-item.html',
  styleUrl: './logout-menu-item.css'
})
export class IamLogoutButtonComponent {
  private iamStore = inject(IamStore);
  private router = inject(Router);

  onSignOut() {
    this.iamStore.signOut(this.router);
  }
}

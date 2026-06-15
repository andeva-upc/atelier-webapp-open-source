import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-expense-list',
  standalone: true,
  imports: [CommonModule, MatIconModule, TranslateModule],
  templateUrl: './expense-list.component.html',
  styleUrls: ['./expense-list.component.css']
})
export class ExpenseListComponent {
  // Empty array as there is no endpoint yet for operational expenses
  expenses: any[] = [];
}

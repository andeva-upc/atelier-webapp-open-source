import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-staff-list',
  standalone: true,
  imports: [CommonModule, MatCardModule],
  templateUrl: './staff-list.html',
  styleUrls: ['./staff-list.css']
})
export class StaffListComponent {
  // Container logic will be added in the next commit
}

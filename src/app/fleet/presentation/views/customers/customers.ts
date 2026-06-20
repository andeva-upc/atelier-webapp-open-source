import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-customers-view',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule
  ],
  templateUrl: './customers.html',
  styleUrls: ['./customers.css']
})
export class CustomersViewComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {
    console.log('CustomersViewComponent initialized');
  }
}

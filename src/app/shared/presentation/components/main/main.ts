import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Toolbar } from '../toolbar/toolbar';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-main',
  imports: [RouterOutlet, CommonModule, Toolbar, TranslateModule],
  templateUrl: './main.html',
  styleUrl: './main.css',
})
export class Main {}

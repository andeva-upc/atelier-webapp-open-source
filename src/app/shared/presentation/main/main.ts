import { Component, input } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Toolbar } from '../toolbar/toolbar';

@Component({
  selector: 'app-main',
  imports: [RouterOutlet, CommonModule, Toolbar],
  templateUrl: './main.html',
  styleUrl: './main.css',
})
export class Main {

}


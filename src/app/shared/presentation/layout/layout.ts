import { Component, signal } from '@angular/core';
import { LeftSidebar } from '../left-sidebar/left-sidebar';
import { Main } from '../main/main';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-layout',
  imports: [LeftSidebar, Main, RouterOutlet],
  templateUrl: './layout.html',
  styleUrl: './layout.css',
})
export class Layout {
}

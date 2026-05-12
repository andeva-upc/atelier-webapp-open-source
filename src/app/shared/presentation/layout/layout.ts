import { Component, signal } from '@angular/core';
import { LeftSidebar } from '../left-sidebar/left-sidebar';
import { Main } from '../main/main';

@Component({
  selector: 'app-layout',
  imports: [LeftSidebar, Main],
  templateUrl: './layout.html',
  styleUrl: './layout.css',
})
export class Layout {
}

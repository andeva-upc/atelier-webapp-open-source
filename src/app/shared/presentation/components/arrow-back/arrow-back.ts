import {Component, Input} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {RouterLink} from '@angular/router';

@Component({
  selector: 'app-arrow-back',
  imports: [
    RouterLink, MatButtonModule
  ],
  templateUrl: './arrow-back.html',
  styleUrl: './arrow-back.css',
})
export class ArrowBack {
  @Input({ required: true }) link!: string | any[];

  get isExternalLink(): boolean {
    return typeof this.link === 'string' && this.link.startsWith('http');
  }
}

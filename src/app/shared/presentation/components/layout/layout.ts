import { Component } from '@angular/core';
import {RouterOutlet} from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-layout',
  imports: [RouterOutlet, TranslateModule],
  templateUrl: './layout.html',
  styleUrl: './layout.css',
})
export class Layout {}

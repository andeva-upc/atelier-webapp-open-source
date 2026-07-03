import { Component, inject, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatMenuModule } from '@angular/material/menu';
import { TranslateService } from '@ngx-translate/core';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-shared-language-selector',
  standalone: true,
  imports: [CommonModule, MatMenuModule, TranslateModule],
  templateUrl: './language-selector.html',
  styleUrl: './language-selector.css'
})
export class SharedLanguageSelectorComponent {
  private translate = inject(TranslateService);

  @ViewChild('langMenu') langMenu: any;

  currentLang = signal<string>(this.translate.currentLang || this.translate.getFallbackLang() || 'es');

  constructor() {
    this.translate.onLangChange.subscribe((event) => {
      this.currentLang.set(event.lang);
    });
  }

  switchLanguage(lang: string) {
    this.currentLang.set(lang);
    this.translate.use(lang);
  }
}

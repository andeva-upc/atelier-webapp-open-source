import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { matClose } from '@ng-icons/material-icons/baseline';

/**
 * Reusable premium modal component designed for rich aesthetics,
 * accessible overlays, and clean content projection.
 * 
 * Uses OnPush change detection for optimized performance.
 */
@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule, NgIcon, TranslateModule],
  providers: [
    provideIcons({ matClose })
  ],
  templateUrl: './modal.html',
  styleUrl: './modal.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SharedModalComponent {
  /**
   * Input to toggle the modal open/close state.
   */
  @Input() isOpen: boolean = false;

  /**
   * Output emitted when the modal is closed by the user.
   */
  @Output() close = new EventEmitter<void>();

  /**
   * Handles closing the modal window from close button or backdrop click.
   */
  onClose(): void {
    this.close.emit();
  }

  /**
   * Prevents mouse click propagation from the modal wrapper to avoid backdrop trigger closing.
   * 
   * @param event - The mouse event trigger.
   */
  stopPropagation(event: MouseEvent): void {
    event.stopPropagation();
  }
}

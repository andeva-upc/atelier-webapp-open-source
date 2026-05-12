import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { matClose } from '@ng-icons/material-icons/baseline';

/**
 * Reusable premium modal component designed for rich aesthetics,
 * accessible overlays, and clean content projection.
 * 
 * Uses OnPush change detection and signals for state synchronization.
 */
@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule, NgIcon],
  providers: [
    provideIcons({ matClose })
  ],
  templateUrl: './modal.html',
  styleUrl: './modal.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Modal {
  /**
   * Signal-based input to toggle the modal open/close state.
   */
  isOpen = input<boolean>(false);

  /**
   * Signal-based output emitted when the modal is closed by the user.
   */
  close = output<void>();

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

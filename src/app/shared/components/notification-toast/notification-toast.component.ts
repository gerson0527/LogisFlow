import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, state, style, transition, animate } from '@angular/animations';

@Component({
    selector: 'app-notification-toast',
    imports: [CommonModule],
    animations: [
        trigger('slideAnimation', [
            state('void', style({
                transform: 'translateX(100%)',
                opacity: 0
            })),
            state('*', style({
                transform: 'translateX(0)',
                opacity: 1
            })),
            transition(':enter', [
                style({ transform: 'translateX(100%)', opacity: 0 }),
                animate('300ms ease-out', style({ transform: 'translateX(0)', opacity: 1 }))
            ]),
            transition(':leave', [
                animate('200ms ease-in', style({ transform: 'translateX(100%)', opacity: 0 }))
            ])
        ]),
        trigger('fadeAnimation', [
            state('void', style({ opacity: 0 })),
            state('*', style({ opacity: 1 })),
            transition(':enter', animate('300ms ease-out')),
            transition(':leave', animate('200ms ease-in', style({ opacity: 0 })))
        ])
    ],
    template: `
    @if (message) {
      <div
        class="fixed bottom-4 right-4 z-50"
        [@slideAnimation]
      >
        <div class="bg-neutral-950 border border-orange-500/50 p-4 max-w-sm" [@fadeAnimation]>
          <div class="flex items-start gap-3">
            <div class="flex-shrink-0 w-6 h-6 border border-orange-500 flex items-center justify-center">
              <div class="w-1.5 h-1.5 bg-orange-500 pulse-orange"></div>
            </div>
            <div>
              <p class="text-xs font-mono text-orange-500 tracking-wider mb-1">NOTIFICACIÓN DEL SISTEMA</p>
              <p class="text-sm font-mono text-gray-300">{{ message }}</p>
            </div>
          </div>
        </div>
      </div>
    }
  `,
    styles: [`
    @keyframes pulse-orange {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }
    .pulse-orange {
      animation: pulse-orange 2s infinite;
    }
  `]
})
export class NotificationToastComponent {
  @Input() message: string | null = null;
}
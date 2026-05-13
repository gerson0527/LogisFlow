import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, state, style, transition, animate } from '@angular/animations';

@Component({
    selector: 'app-confirm-dialog',
    imports: [CommonModule],
    animations: [
        trigger('backdropAnimation', [
            state('void', style({ opacity: 0 })),
            state('*', style({ opacity: 1 })),
            transition(':enter', animate('200ms ease-out')),
            transition(':leave', animate('150ms ease-in', style({ opacity: 0 })))
        ]),
        trigger('dialogAnimation', [
            state('void', style({
                transform: 'scale(0.9)',
                opacity: 0
            })),
            state('*', style({
                transform: 'scale(1)',
                opacity: 1
            })),
            transition(':enter', [
                style({ transform: 'scale(0.9)', opacity: 0 }),
                animate('200ms ease-out', style({ transform: 'scale(1)', opacity: 1 }))
            ]),
            transition(':leave', [
                animate('150ms ease-in', style({ transform: 'scale(0.9)', opacity: 0 }))
            ])
        ])
    ],
    template: `
    @if (isOpen()) {
      <div
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4 backdrop-blur-sm"
        [@backdropAnimation]
        (click)="onCancel()"
      >
        <div
          class="relative w-full max-w-md border border-orange-500/50 bg-neutral-950 shadow-2xl shadow-black/40"
          [@dialogAnimation]
          (click)="$event.stopPropagation()"
        >
          <div class="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-orange-500/50 via-transparent to-orange-500/50"></div>

          <div class="p-6 border-b border-neutral-800">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 border border-orange-500 flex items-center justify-center">
                <svg class="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                </svg>
              </div>
              <div>
                <h3 class="text-lg font-mono font-bold text-white tracking-wider">CONFIRMAR ENTREGA</h3>
                <p class="text-xs font-mono text-gray-500 tracking-wider">ACCIÓN IRREVERSIBLE</p>
              </div>
            </div>
          </div>

          <div class="p-6">
            <div class="bg-black border border-neutral-800 p-4 mb-6">
              <div class="grid grid-cols-2 gap-4 text-xs font-mono">
                <div>
                  <span class="text-gray-500 tracking-wider">PAQUETE:</span>
                  <span class="text-orange-500 ml-2">{{ packageCode() }}</span>
                </div>
                <div>
                  <span class="text-gray-500 tracking-wider">DESTINO:</span>
                  <span class="text-gray-300 ml-2">{{ destination() }}</span>
                </div>
              </div>
            </div>

            <p class="text-sm font-mono text-gray-400 text-center mb-6 tracking-wider">
              ¿ESTÁ SEGURO DE CONFIRMAR LA ENTREGA DE ESTE PAQUETE?
            </p>

            @if (loading()) {
              <div class="mb-6 flex items-center justify-center gap-3 border border-orange-500/20 bg-orange-500/10 px-4 py-3 text-xs font-mono tracking-wider text-orange-400">
                <div class="h-4 w-4 animate-spin rounded-full border border-orange-500/40 border-t-orange-500"></div>
                <span>PROCESANDO ENTREGA...</span>
              </div>
            }

            <div class="flex gap-3">
              <button
                (click)="onCancel()"
                [disabled]="loading()"
                class="flex-1 py-3 px-4 border border-neutral-800 text-gray-400 font-mono text-sm tracking-wider hover:border-orange-500 hover:text-orange-500 hover:bg-orange-500/10 transition disabled:cursor-not-allowed disabled:opacity-50"
              >
                CANCELAR
              </button>
              <button
                (click)="onConfirm()"
                [disabled]="loading()"
                class="flex-1 py-3 px-4 bg-orange-600 hover:bg-orange-500 text-black font-mono text-sm font-bold tracking-wider transition hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:bg-orange-700 disabled:hover:scale-100 disabled:active:scale-100"
              >
                {{ loading() ? 'PROCESANDO...' : 'CONFIRMAR' }}
              </button>
            </div>
          </div>

          <div class="p-4 border-t border-neutral-800 bg-black/50">
            <div class="flex items-center justify-center gap-2 text-xs font-mono text-gray-600">
              <div class="w-2 h-2 bg-red-500 blink"></div>
              <span>ESTA ACCIÓN NO SE PUEDE DESHACER</span>
            </div>
          </div>
        </div>
      </div>
    }
  `,
    styles: [`
    @keyframes blink {
      0%, 50% { opacity: 1; }
      51%, 100% { opacity: 0; }
    }
    .blink {
      animation: blink 1s infinite;
    }
    button {
      transition: all 0.2s ease;
    }
  `]
})
export class ConfirmDialogComponent {
  isOpen = input.required<boolean>();
  loading = input(false);
  packageCode = input.required<string>();
  destination = input.required<string>();

  confirm = output<void>();
  cancel = output<void>();

  onConfirm(): void {
    if (this.loading()) return;
    this.confirm.emit();
  }

  onCancel(): void {
    if (this.loading()) return;
    this.cancel.emit();
  }
}
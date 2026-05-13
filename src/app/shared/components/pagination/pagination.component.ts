import { Component, input, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, style, transition, animate } from '@angular/animations';

export interface PageEvent {
  page: number;
  pageSize: number;
}

@Component({
    selector: 'app-pagination',
    imports: [CommonModule],
    animations: [
        trigger('buttonAnimation', [
            transition(':enter', [
                style({ opacity: 0, transform: 'scale(0.8)' }),
                animate('150ms ease-out', style({ opacity: 1, transform: 'scale(1)' }))
            ])
        ])
    ],
    template: `
    <div class="flex items-center justify-between px-4 py-3 border-t border-neutral-800 bg-black/50">
      <div class="flex items-center gap-4">
        <span class="text-xs font-mono text-gray-500 tracking-wider">
          MOSTRAR
        </span>
        <select
          [value]="pageSize()"
          (change)="onPageSizeChange($event)"
          class="bg-black border border-neutral-800 text-gray-300 font-mono text-xs px-2 py-1 focus:border-orange-500 focus:outline-none hover:border-orange-500/50 transition"
        >
          @for (size of pageSizeOptions; track size) {
            <option [value]="size">{{ size }}</option>
          }
        </select>
        <span class="text-xs font-mono text-gray-500 tracking-wider">
          REGISTROS
        </span>
      </div>

      <div class="flex items-center gap-2">
        <span class="text-xs font-mono text-gray-500 tracking-wider">
          PÁGINA {{ currentPage() }} DE {{ totalPages() }}
        </span>
        <span class="text-xs font-mono text-gray-600 mx-2">|</span>
        <span class="text-xs font-mono text-orange-500 tracking-wider">
          TOTAL: {{ total() }}
        </span>
      </div>

      <div class="flex items-center gap-1">
        <button
          (click)="goToPage(1)"
          [disabled]="currentPage() === 1"
          class="px-2 py-1 border border-neutral-800 text-gray-500 font-mono text-xs hover:border-orange-500 hover:text-orange-500 hover:bg-orange-500/10 disabled:opacity-30 disabled:cursor-not-allowed transition"
        >
          <<
        </button>
        <button
          (click)="goToPage(currentPage() - 1)"
          [disabled]="currentPage() === 1"
          class="px-2 py-1 border border-neutral-800 text-gray-500 font-mono text-xs hover:border-orange-500 hover:text-orange-500 hover:bg-orange-500/10 disabled:opacity-30 disabled:cursor-not-allowed transition"
        >
          <
        </button>

        @for (page of visiblePages(); track page) {
          @if (page === -1) {
            <span class="px-1 text-gray-600 font-mono text-xs">...</span>
          } @else {
            <button
              (click)="goToPage(page)"
              [@buttonAnimation]
              [class]="currentPage() === page
                ? 'px-3 py-1 bg-orange-600 text-black font-mono text-xs font-bold scale-110'
                : 'px-3 py-1 border border-neutral-800 text-gray-500 font-mono text-xs hover:border-orange-500 hover:text-orange-500 hover:bg-orange-500/10 transition'"
            >
              {{ page }}
            </button>
          }
        }

        <button
          (click)="goToPage(currentPage() + 1)"
          [disabled]="currentPage() === totalPages()"
          class="px-2 py-1 border border-neutral-800 text-gray-500 font-mono text-xs hover:border-orange-500 hover:text-orange-500 hover:bg-orange-500/10 disabled:opacity-30 disabled:cursor-not-allowed transition"
        >
          >
        </button>
        <button
          (click)="goToPage(totalPages())"
          [disabled]="currentPage() === totalPages()"
          class="px-2 py-1 border border-neutral-800 text-gray-500 font-mono text-xs hover:border-orange-500 hover:text-orange-500 hover:bg-orange-500/10 disabled:opacity-30 disabled:cursor-not-allowed transition"
        >
          >>
        </button>
      </div>
    </div>
  `
})
export class PaginationComponent {
  total = input.required<number>();
  pageSize = input<number>(10);
  currentPage = input<number>(1);

  pageChange = output<PageEvent>();

  pageSizeOptions = [10, 25, 50, 100];

  totalPages = computed(() => Math.max(1, Math.ceil(this.total() / this.pageSize())));

  visiblePages = computed(() => {
    const total = this.totalPages();
    const current = this.currentPage();
    const pages: number[] = [];

    if (total <= 7) {
      for (let i = 1; i <= total; i++) pages.push(i);
    } else {
      pages.push(1);
      if (current > 3) pages.push(-1);
      for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
        pages.push(i);
      }
      if (current < total - 2) pages.push(-1);
      pages.push(total);
    }

    return pages;
  });

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages() || page === this.currentPage()) return;
    this.pageChange.emit({ page, pageSize: this.pageSize() });
  }

  onPageSizeChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const newSize = Number(select.value);
    this.pageChange.emit({ page: 1, pageSize: newSize });
  }
}
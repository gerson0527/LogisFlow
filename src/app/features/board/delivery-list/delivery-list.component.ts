import { Component, inject, signal, computed, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { DeliveryService } from '../../../core/services/delivery.service';
import { AuthService } from '../../../core/services/auth.service';
import { PaginationComponent, PageEvent } from '../../../shared/components/pagination/pagination.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { Delivery, DeliveryStatus } from '../../../core/models/delivery.model';

@Component({
    selector: 'app-delivery-list',
    imports: [CommonModule, PaginationComponent, ConfirmDialogComponent],
    templateUrl: './delivery-list.component.html',
    styleUrls: ['./delivery-list.component.css']
})
export class DeliveryListComponent implements OnDestroy {
  private readonly dialogAnimationMs = 200;
  private deliveryService = inject(DeliveryService);
  private authService = inject(AuthService);
  private updateSubscription: Subscription | null = null;

  isUpdating = signal(false);
  errorMessage = signal<string | null>(null);
  packageCodeFilter = signal('');
  statusFilter = signal<'ALL' | DeliveryStatus>('ALL');

  currentPage = signal(1);
  pageSize = signal(10);

  showConfirmDialog = signal(false);
  selectedDelivery = signal<Delivery | null>(null);

  allDeliveries = computed(() => {
    const user = this.authService.currentUser();
    if (!user) return [];
    return this.deliveryService.getDeliveriesForUser(user);
  });

  filteredDeliveries = computed(() => {
    const packageCodeQuery = this.packageCodeFilter().trim().toLowerCase();
    const selectedStatus = this.statusFilter();

    return this.allDeliveries().filter(delivery => {
      const matchesPackageCode = !packageCodeQuery
        || delivery.packageCode.toLowerCase().includes(packageCodeQuery);
      const matchesStatus = selectedStatus === 'ALL' || delivery.status === selectedStatus;

      return matchesPackageCode && matchesStatus;
    });
  });

  totalDeliveries = computed(() => this.filteredDeliveries().length);
  hasActiveFilters = computed(() => !!this.packageCodeFilter().trim() || this.statusFilter() !== 'ALL');

  deliveries = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize();
    const end = start + this.pageSize();
    return this.filteredDeliveries().slice(start, end);
  });

  isAdmin = this.authService.isAdmin;

  ngOnDestroy(): void {
    if (this.updateSubscription) this.updateSubscription.unsubscribe();
  }

  onPageChange(event: PageEvent): void {
    this.currentPage.set(event.page);
    this.pageSize.set(event.pageSize);
  }

  onPackageCodeFilterChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.packageCodeFilter.set(input.value);
    this.currentPage.set(1);
  }

  onStatusFilterChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.statusFilter.set(select.value as 'ALL' | DeliveryStatus);
    this.currentPage.set(1);
  }

  confirmDelivery(delivery: Delivery): void {
    this.selectedDelivery.set({ ...delivery });
    this.showConfirmDialog.set(true);
  }

  onConfirmDelivery(): void {
    const delivery = this.selectedDelivery();
    if (delivery) {
      this.isUpdating.set(true);
      this.errorMessage.set(null);

      if (this.updateSubscription) this.updateSubscription.unsubscribe();

      this.updateSubscription = this.deliveryService.updateStatus(delivery.id, 'DELIVERED').subscribe({
        next: () => {
          this.isUpdating.set(false);
          this.closeDialog();
        },
        error: (err: Error) => {
          this.isUpdating.set(false);
          this.errorMessage.set(err.message);
          this.closeDialog();
          setTimeout(() => this.errorMessage.set(null), 3000);
        }
      });
    }
  }

  private closeDialog(): void {
    this.showConfirmDialog.set(false);
    setTimeout(() => this.selectedDelivery.set(null), this.dialogAnimationMs + 20);
  }

  onCancelDelivery(): void {
    this.closeDialog();
  }

  getStatusBadgeClass(status: string): string {
    const baseClasses = 'px-2 py-1 text-xs font-mono font-bold tracking-wider border';
    switch (status) {
      case 'PENDING':
        return `${baseClasses} bg-yellow-500/10 border-yellow-500/50 text-yellow-500`;
      case 'IN_TRANSIT':
        return `${baseClasses} bg-blue-500/10 border-blue-500/50 text-blue-500`;
      case 'DELIVERED':
        return `${baseClasses} bg-green-500/10 border-green-500/50 text-green-500`;
      default:
        return baseClasses;
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'PENDING': return 'PENDIENTE';
      case 'IN_TRANSIT': return 'EN TRÁNSITO';
      case 'DELIVERED': return 'ENTREGADO';
      default: return status;
    }
  }
}
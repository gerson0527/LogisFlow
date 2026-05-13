import { Component, inject, signal, OnDestroy, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { NotificationToastComponent } from '../../../shared/components/notification-toast/notification-toast.component';

@Component({
    selector: 'app-dashboard',
    imports: [CommonModule, RouterOutlet, NotificationToastComponent],
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnDestroy {
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);
  private destroyRef = inject(DestroyRef);

  currentUser = this.authService.currentUser;
  isAdmin = this.authService.isAdmin;
  notificationMessage = signal<string | null>(null);
  currentUtcTime = '';
  private notificationTimeout: ReturnType<typeof setTimeout> | null = null;
  private timeInterval: ReturnType<typeof setInterval> | null = null;

  constructor() {
    this.updateTime();
    this.timeInterval = setInterval(() => this.updateTime(), 1000);

    this.notificationService.notifications$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(message => {
        this.showNotification(message);
      });
  }

  private updateTime(): void {
    const now = new Date();
    this.currentUtcTime = now.toISOString().slice(0, 19) + ' UTC';
  }

  showNotification(message: string): void {
    this.notificationMessage.set(message);
    if (this.notificationTimeout) {
      clearTimeout(this.notificationTimeout);
    }
    this.notificationTimeout = setTimeout(() => {
      this.notificationMessage.set(null);
    }, 4000);
  }

  logout(): void {
    this.authService.logout();
  }

  ngOnDestroy(): void {
    if (this.notificationTimeout) {
      clearTimeout(this.notificationTimeout);
    }
    if (this.timeInterval) {
      clearInterval(this.timeInterval);
    }
  }
}
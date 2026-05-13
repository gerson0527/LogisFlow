import { Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';

export const BOARD_ROUTES: Routes = [
  {
    path: '',
    component: DashboardComponent,
    children: [
      { path: '', loadComponent: () => import('./delivery-list/delivery-list.component').then(m => m.DeliveryListComponent) }
    ]
  }
];
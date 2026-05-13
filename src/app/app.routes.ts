import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: 'login', loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent) },
  { path: 'dashboard', canActivate: [authGuard], loadChildren: () => import('./features/board/board.routes').then(m => m.BOARD_ROUTES) },
  { path: '', redirectTo: 'login', pathMatch: 'full' }
];
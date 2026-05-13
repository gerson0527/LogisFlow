import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const token = auth.getToken();
  const isAuthenticated = auth.isAuthenticated();

  console.log(`[AuthGuard] Checking access - authenticated: ${isAuthenticated}, token: ${token ? 'present' : 'missing'}`);

  if (isAuthenticated && token) {
    console.log('[AuthGuard] Access granted to protected route');
    return true;
  }

  console.log('[AuthGuard] Access denied - redirecting to login');
  return router.createUrlTree(['/login']);
};
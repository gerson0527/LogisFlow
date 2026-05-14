import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const token = auth.getToken();
  const isAuthenticated = auth.isAuthenticated();


  if (isAuthenticated && token) {
    return true;
  }

  return router.createUrlTree(['/login']);
};
import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

export const authGuard: CanActivateFn = () => {
  const token = typeof window !== 'undefined' ? window.localStorage.getItem('jwtToken') : null;
  if (token) {
    return true;
  }
  const router = inject(Router);
  return router.parseUrl('/login');
};
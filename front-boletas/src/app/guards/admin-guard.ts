import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth';

export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);
  
  // Si estamos en el servidor, denegar acceso
  if (!isPlatformBrowser(platformId)) {
    return false;
  }
  
  const rol = authService.getRol();
  
  if (rol === 'ADMIN') {
    return true;
  }
  
  // Si no es admin, redirigir al inicio
  router.navigate(['/dashboard/inicio']);
  return false;
};
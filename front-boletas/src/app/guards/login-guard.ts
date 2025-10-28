import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth';

export const loginGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);
  
  // Si estamos en el servidor, permitir acceso
  if (!isPlatformBrowser(platformId)) {
    return true;
  }
  
  // Si ya tiene un token válido, redirigir al dashboard
  if (authService.isTokenValid()) {
    router.navigate(['/dashboard']);
    return false;
  }
  
  // Si el token existe pero no es válido, limpiarlo
  const token = authService.getToken();
  if (token && !authService.isTokenValid()) {
    // Solo intentar limpiar si estamos en el navegador
    if (isPlatformBrowser(platformId)) {
      localStorage.clear();
    }
  }
  
  // Permitir acceso al login
  return true;
};
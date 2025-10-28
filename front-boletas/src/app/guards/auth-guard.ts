import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);
  
  // Si estamos en el servidor, permitir acceso (se verificará en el cliente)
  if (!isPlatformBrowser(platformId)) {
    return true;
  }
  
  // Verificar si el token existe y es válido
  if (authService.isTokenValid()) {
    return true;
  }
  
  // Si el token no es válido o no existe, limpiar y redirigir
  if (authService.getToken()) {
    // Token existe pero no es válido (expirado), limpiar todo
    authService.logout();
  } else {
    // No hay token, solo redirigir
    router.navigate(['/login']);
  }
  
  return false;
};
import { CanActivateFn } from '@angular/router';

export const adminGuard: CanActivateFn = () => {
  const token = localStorage.getItem('jwtToken');
  if (!token) {
    window.location.href = '/login';
    return false;
  }
  try {
    const payload = token.split('.')[1];
    const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
    if (decoded.rol === 'ADMIN') {
      return true;
    }
  } catch {}
  window.location.href = '/dashboard'; 
  return false;
};
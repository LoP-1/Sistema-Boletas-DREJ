import { HttpInterceptorFn } from '@angular/common/http';

// Interceptor HTTP para adjuntar el token JWT a las peticiones
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // No agrega Authorization si la URL contiene '/login'
  if (req.url.includes('/login')) {
    return next(req);
  }

  // Busca token en localStorage
  const token = localStorage.getItem('jwtToken');
  if (token) {
    // Si hay token, clona la petición agregando encabezado Authorization
    const authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(authReq);
  }
  // Si no hay token, sigue con la petición original
  return next(req);
};
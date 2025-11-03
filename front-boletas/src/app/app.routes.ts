import { Routes } from '@angular/router';
import { Dashboard } from './components/dashboard/dashboard';
import { BoletasList } from './components/dashboard/boletas-list/boletas-list';
import { Profile } from './components/dashboard/profile/profile';
import { Inicio } from './components/dashboard/inicio/inicio';
import { Admin } from './components/dashboard/admin/admin';
import { authGuard } from './guards/auth-guard';
import { loginGuard } from './guards/login-guard';
import { adminGuard } from './guards/admin-guard';
import { SubirBoletas } from './components/dashboard/subir-boletas/subir-boletas';

export const routes: Routes = [
  // Ruta raíz: redirige a /dashboard por defecto
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },

  // Ruta pública para ver una boleta por su id (QR pública).
  // Se carga el componente de forma lazy (loadComponent).
  {
    path: 'boleta/:id',
    loadComponent: () => import('./components/qr/boleta-print/boleta-print').then(m => m.BoletaPrint),
    data: { ngSkipHydration: true }
  },

  // Área protegida "dashboard" (requiere estar autenticado)
  {
    path: 'dashboard',
    component: Dashboard,
    canActivate: [authGuard], // guard que evita acceso si no hay sesión válida
    children: [
      // Rutas hijas del dashboard
      { path: '', component: Inicio },           // /dashboard -> componente Inicio
      { path: 'boletas', component: BoletasList }, // /dashboard/boletas
      { path: 'perfil', component: Profile },      // /dashboard/perfil
      { path: 'inicio', component: Inicio },       // /dashboard/inicio (misma pantalla que '')
      // Rutas solo para administradores (adminGuard)
      { path: 'admin', component: Admin, canActivate: [adminGuard] },
      { 
        path: 'gestion-boletas', 
        loadComponent: () => import('./components/dashboard/boletas-gestion/boletas-gestion').then(m => m.BoletasGestion), 
        canActivate: [adminGuard],
        data: { ngSkipHydration: true } // evita rehidratación si se usa SSR
      },
      { 
        path: 'subir-boleta', 
        component: SubirBoletas, 
        canActivate: [adminGuard],
        data: { ngSkipHydration: true }
      },
    ]
  },

  // Ruta pública para login; loginGuard evita que usuarios ya autenticados accedan
  {
    path: 'login',
    loadComponent: () => import('./components/auth/login/login').then(m => m.Login),
    canActivate: [loginGuard]
  },

  // Wildcard: cualquier ruta no reconocida redirige al dashboard
  { path: '**', redirectTo: 'dashboard' }
];
import { Routes } from '@angular/router';
import { Dashboard } from './components/dashboard/dashboard';
import { BoletasList } from './components/dashboard/boletas-list/boletas-list';
import { Profile } from './components/dashboard/profile/profile';
import { Inicio } from './components/dashboard/inicio/inicio';
import { Admin } from './components/dashboard/admin/admin';
import { authGuard } from './guards/auth-guard';
import { adminGuard } from './guards/admin-guard';
import { BoletasGestion } from './components/dashboard/boletas-gestion/boletas-gestion';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: 'dashboard',
    component: Dashboard,
    canActivate: [authGuard],
    children: [
      { path: '', component: Inicio },
      { path: 'boletas', component: BoletasList },
      { path: 'perfil', component: Profile },
      { path: 'inicio', component: Inicio },
      { path: 'admin', component: Admin, canActivate: [adminGuard] },
      { path: 'gestion-boletas', component: BoletasGestion, canActivate: [adminGuard] },
    ]
  },
  {
    path: 'login',
    loadComponent: () => import('./components/auth/login/login').then(m => m.Login)
  }
];
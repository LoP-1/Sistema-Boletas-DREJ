import { Routes } from '@angular/router';
import { Dashboard } from './components/dashboard/dashboard';
import { BoletasList } from './components/dashboard/boletas-list/boletas-list';
import { Profile } from './components/dashboard/profile/profile';
import { Inicio } from './components/dashboard/inicio/inicio';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard/boletas',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    component: Dashboard,
    children: [
      { path: '', component: Inicio },
      { path: 'boletas', component: BoletasList},
      { path: 'perfil', component: Profile },
      { path: 'inicio', component: Inicio }
    ]
  },
  {
    path: 'login',
    loadComponent: () => import('./components/auth/login/login').then(m => m.Login)
  }
];
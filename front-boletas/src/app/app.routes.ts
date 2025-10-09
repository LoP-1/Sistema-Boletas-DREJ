import { Routes } from '@angular/router';
import { Login } from './auth/login/login';
import { Register } from './auth/register/register';
import { Dashboard } from './dashboard/dashboard';
import { BoletasList } from './dashboard/boletas-list/boletas-list';
import { BoletaDetalle } from './dashboard/boleta-detalle/boleta-detalle';
import { Profile } from './dashboard/profile/profile';

export const routes: Routes = [
  { path: '', component: Login },
  { path: 'register', component: Register },
  { path: 'dashboard', component: Dashboard },
  { path: 'boletas', component: BoletasList },
  { path: 'boletas/:id', component: BoletaDetalle },
  { path: 'profile', component: Profile },
];
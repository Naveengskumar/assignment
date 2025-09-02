import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { AdminNotificationsComponent } from './features/admin/admin-notifications.component';


export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  {
    path: 'admin',
    canActivate: [authGuard, roleGuard(['ADMIN'])],
    loadChildren: () =>
      import('../app/features/admin/admin.routes').then((m) => m.ADMIN_ROUTES),
  },

  {
    path: 'user',
    canActivate: [authGuard, roleGuard(['USER', 'ADMIN'])],
    loadChildren: () =>
      import('../app/features/users/users/user.routes').then((m) => m.USER_ROUTES),
  },

  {
    path: 'login',
    loadComponent: () =>
      import('../app/features/auth/login/login').then(
        (c) => c.LoginComponent
      ),
  },
  { path: 'admin/notifications', component: AdminNotificationsComponent },

  { path: '**', redirectTo: 'login' },
];

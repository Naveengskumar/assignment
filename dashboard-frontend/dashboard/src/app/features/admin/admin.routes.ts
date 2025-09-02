import { Routes } from '@angular/router';
import { UsersPageComponent } from './users/user-page.component';
import { AdminNotificationsComponent } from './admin-notifications.component';

export const ADMIN_ROUTES: Routes = [
  { path: '', component: UsersPageComponent },
  {path:'notification', component: AdminNotificationsComponent}
];

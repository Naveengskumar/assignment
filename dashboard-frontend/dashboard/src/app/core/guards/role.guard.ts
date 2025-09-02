import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthStore } from '../auth/auth.store';
import { map } from 'rxjs';

export const roleGuard = (roles: ('ADMIN'|'USER')[]): CanActivateFn => {
  return () => {
    const store = inject(AuthStore);
    const router = inject(Router);
    return store.role$.pipe(
      map(role => (role && roles.includes(role)) ? true : router.createUrlTree(['/']))
    );
  };
};

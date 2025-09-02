import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthStore } from '../auth/auth.store';
import { map } from 'rxjs';

export const authGuard: CanActivateFn = () => {
  const store = inject(AuthStore);
  const router = inject(Router);
  return store.isAuthed$.pipe(
    map(isAuthed => isAuthed ? true : router.createUrlTree(['/login']))
  );
};

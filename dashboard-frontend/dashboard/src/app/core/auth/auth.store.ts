import { Injectable } from '@angular/core';
import { BehaviorSubject, map } from 'rxjs';

export type Role = 'ADMIN' | 'USER';
export interface AuthState {
  token: string | null;
  role: Role | null;
}

function decodeRole(token: string | null): Role | null {
  try {
    if (!token) return null;
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload?.role ?? null;
  } catch {
    return null;
  }
}

function getLocalStorageItem(key: string): string | null {
  // ✅ Only try if window is available
  if (typeof window !== 'undefined' && window.localStorage) {
    return window.localStorage.getItem(key);
  }
  return null;
}

function setLocalStorageItem(key: string, value: string | null) {
  if (typeof window !== 'undefined' && window.localStorage) {
    if (value) window.localStorage.setItem(key, value);
    else window.localStorage.removeItem(key);
  }
}

@Injectable({ providedIn: 'root' })
export class AuthStore {
  private state$ = new BehaviorSubject<AuthState>({
    token: getLocalStorageItem('token'),
    role: decodeRole(getLocalStorageItem('token')),
  });

  readonly token$ = this.state$.pipe(map(s => s.token));
  readonly role$  = this.state$.pipe(map(s => s.role));
  readonly isAuthed$ = this.token$.pipe(map(Boolean));

  setToken(token: string | null) {
    setLocalStorageItem('token', token);
    this.state$.next({ token, role: decodeRole(token) });
  }

  getSnapshot(): AuthState {
    return this.state$.value;
  }
}

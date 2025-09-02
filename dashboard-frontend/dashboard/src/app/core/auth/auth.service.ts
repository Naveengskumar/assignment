import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs';
import { AuthStore } from './auth.store';

interface LoginResponse {
  token: string;
  user: { id: string; name: string; email: string; role: 'ADMIN'|'USER' };
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private base = 'http://localhost:3000/api/v1';

  constructor(private http: HttpClient, private store: AuthStore) {}

  login(email: string, password: string) {
    return this.http.post<LoginResponse>(`${this.base}/auth/login`, { email, password })
      .pipe(tap(res => this.store.setToken(res.token)));
  }

  logout() {
    this.store.setToken(null);
  }
}

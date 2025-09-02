import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, tap } from 'rxjs';

export type Role = 'ADMIN' | 'USER';

export interface UserVM {
  _id: string;
  name: string;
  email: string;
  role: Role;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateUserDTO {
  name: string;
  email: string;
  password: string;
  role: Role;
}

@Injectable({ providedIn: 'root' })
export class UsersService {
  private readonly base = 'http://localhost:3000/api/v1/users';

  // null = not yet loaded; [] = loaded but empty
  private readonly users$ = new BehaviorSubject<UserVM[] | null>(null);

  constructor(private http: HttpClient) {}

  /** Server fetch → updates stream */
  list() {
    return this.http.get<UserVM[]>(this.base).pipe(
      tap((list) => this.users$.next(list))
    );
  }

  /** Create user → optimistic update of stream */
  create(dto: CreateUserDTO) {
    return this.http.post<UserVM>(this.base, dto).pipe(
      tap((created) => {
        const curr = this.users$.value ?? [];
        // put newest at top
        this.users$.next([created, ...curr]);
      })
    );
  }

  /** Read-only stream for components */
  usersStream() {
    return this.users$.asObservable();
  }
}

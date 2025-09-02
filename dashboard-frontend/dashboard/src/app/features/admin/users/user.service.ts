import { Injectable } from '@angular/core';
import { HttpClient,HttpParams } from '@angular/common/http';
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

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
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

  private users$ = new BehaviorSubject<UserVM[] | null>(null);
  private total$ = new BehaviorSubject<number>(0);
  private page$  = new BehaviorSubject<number>(1);
  private limit$ = new BehaviorSubject<number>(10);

  constructor(private http: HttpClient) {}

  /** Server fetch → updates stream */
  // list() {
  //   return this.http.get<UserVM[]>(this.base).pipe(
  //     tap((list) => this.users$.next(list))
  //   );
  // }

   list(page = 1, limit = 10) {
    const params = new HttpParams().set('page', page).set('limit', limit);
    return this.http.get<Paginated<UserVM>>(this.base, { params }).pipe(
      tap(res => {
        this.users$.next(res.items);
        this.total$.next(res.total);
        this.page$.next(res.page);
        this.limit$.next(res.limit);
      })
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

  // CSV endpoints
  uploadPreview(file: File) {
    const form = new FormData();
    form.append('file', file);
    return this.http.post<{
      totalRows: number;
      preview: Array<CreateUserDTO>;
      validCount: number;
      errorCount: number;
      sampleErrors: any[];
    }>(`${this.base}/upload/preview`, form);
  }

  bulkImport(rows: CreateUserDTO[]) {
    return this.http.post<{created: number; conflicts: {email: string; reason: string}[]}>(
      `${this.base}/upload/bulk`,
      { rows }
    );
  }

  usersStream() { return this.users$.asObservable(); }
  totalStream() { return this.total$.asObservable(); }
  pageStream()  { return this.page$.asObservable(); }
  limitStream() { return this.limit$.asObservable(); }
}

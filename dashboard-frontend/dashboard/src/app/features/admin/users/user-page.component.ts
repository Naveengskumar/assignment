import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { UsersService, UserVM, CreateUserDTO } from './user.service';
import { Observable, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { Router } from '@angular/router';
import { SocketService } from '../../../core/socket.service';

const NAME_PATTERN = /^[A-Za-z ]+$/;
const STRONG_PW = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

@Component({
  standalone: true,
  selector: 'app-users-page',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './user-page.component.html',
  styleUrls: ['./user-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UsersPageComponent implements OnInit {
  private fb = inject(FormBuilder);
  private users = inject(UsersService);
  private socket = inject(SocketService);
  private router = inject(Router);
  // --- Tab state
  activeTab = signal<'single' | 'csv'>('single');

  // --- Single-add form
  submitted = signal(false);
  creating  = signal(false);
  form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2), Validators.pattern(NAME_PATTERN)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.pattern(STRONG_PW)]],
    role: ['USER', [Validators.required]],
  });

  // --- CSV preview/import state
  selectedFileName = signal<string | null>(null);
  preview = signal<CreateUserDTO[] | null>(null); // first 10 rows
  previewMeta = signal<{ totalRows: number; validCount: number; errorCount: number } | null>(null);
  importing = signal(false);

  // --- Pagination streams
  users$!: Observable<UserVM[] | null>;
  total$!: Observable<number>;
  page$!: Observable<number>;
  limit$!: Observable<number>;

  // --- View model for pagination footer
  vm$!: Observable<{ total: number; page: number; limit: number }>;

  // expose Math for template (strict template type checking)
 Math = Math;
Number = Number;

  ngOnInit(): void {
    this.users$ = this.users.usersStream();
    this.total$ = this.users.totalStream();
    this.page$  = this.users.pageStream();
    this.limit$ = this.users.limitStream();

    // bundle total/page/limit into one stream for the template
    this.vm$ = combineLatest([this.total$, this.page$, this.limit$]).pipe(
      map(([total, page, limit]) => ({ total, page, limit }))
    );

    this.users.list(1, 10).subscribe();
  }

  // ---- Validation helpers
  showError(path: string) {
    const c = this.form.get(path);
    return !!c && (c.touched || this.submitted()) && c.invalid;
  }
  msgFor(path: string) {
    const c = this.form.get(path);
    if (!c) return null;
    if (path === 'name')  return c.hasError('required') ? 'Required' :
                            c.hasError('minlength') ? 'Min 2 chars' :
                            c.hasError('pattern') ? 'Only letters/spaces' : null;
    if (path === 'email') return c.hasError('required') ? 'Required' :
                            c.hasError('email') ? 'Invalid email' : null;
    if (path === 'password') return c.hasError('required') ? 'Required' :
                               c.hasError('pattern') ? 'Min 8 incl. upper/lower/number/special' : null;
    if (path === 'role') return c.hasError('required') ? 'Required' : null;
    return null;
  }

  // ---- Single create
  onCreate() {
    this.submitted.set(true);
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.creating.set(true);
    this.users.create(this.form.getRawValue() as any).subscribe({
      next: () => {
        this.form.reset({ role: 'USER' });
        this.creating.set(false);
        // refresh current page
        combineLatest([this.page$, this.limit$]).subscribe(([p, l]) => {
          this.users.list(p, l).subscribe();
        }).unsubscribe();
      },
      error: (e) => { alert(e?.error?.error ?? 'Create failed'); this.creating.set(false); }
    });
  }

  // ---- CSV: file → preview
  onFileChange(ev: Event) {
    const input = ev.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this.selectedFileName.set(file.name);
    this.preview.set(null);
    this.previewMeta.set(null);
    this.users.uploadPreview(file).subscribe({
      next: (res) => {
        this.preview.set(res.preview);
        this.previewMeta.set({ totalRows: res.totalRows, validCount: res.validCount, errorCount: res.errorCount });
      },
      error: (e) => alert(e?.error?.error ?? 'Preview failed'),
    });
  }

  // ---- CSV: import previewed rows (first 10)
  onImport() {
    const rows = this.preview();
    if (!rows?.length) return;
    this.importing.set(true);
    this.users.bulkImport(rows).subscribe({
      next: (r) => {
        this.importing.set(false);
        combineLatest([this.page$, this.limit$]).subscribe(([p, l]) => {
          this.users.list(p, l).subscribe();
        }).unsubscribe();
        alert(`Imported: ${r.created}${r.conflicts.length ? `, conflicts: ${r.conflicts.length}` : ''}`);
        this.preview.set(null);
        this.selectedFileName.set(null);
      },
      error: (e) => { alert(e?.error?.error ?? 'Import failed'); this.importing.set(false); }
    });
  }

  // ---- Pagination
  goTo(page: number, limit: number) {
    if (page < 1) return;
    this.users.list(page, Number(limit)).subscribe();
  }

goToNotifications() {
  this.socket.connect(); 
  this.router.navigate(['/admin/notification']); // ✅ match route path
}

}

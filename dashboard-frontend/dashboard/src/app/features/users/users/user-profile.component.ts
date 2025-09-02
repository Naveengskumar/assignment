import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Component({
  standalone: true,
  selector: 'app-user-profile',
  imports: [CommonModule],
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserProfileComponent implements OnInit {
  private http = inject(HttpClient);
  data = signal<any>(null);
  error = signal<string | null>(null);
  loading = signal(false);

  ngOnInit(): void {
    this.loading.set(true);
    this.http.get('http://localhost:3000/api/v1/users/me').subscribe({
      next: d => { this.data.set(d); this.loading.set(false); },
      error: e => { this.error.set(e?.error?.error ?? 'Failed to load profile'); this.loading.set(false); }
    });
  }
}

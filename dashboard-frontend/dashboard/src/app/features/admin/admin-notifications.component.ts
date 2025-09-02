// src/app/features/admin/admin-notifications.component.ts
import { Component, computed, inject, Signal } from '@angular/core';
import { NgIf } from '@angular/common';
import { MatChipsModule } from '@angular/material/chips';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { SocketService } from '../../core/socket.service';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'admin-notifications',
  standalone: true,
  // ⬇️ Removed AsyncPipe + MatSlideToggleModule (not used)
  imports: [NgIf, MatChipsModule, MatButtonModule, MatIconModule],
  styles: [`
    .wrap { display: grid; gap: 16px; padding: 16px; max-width: 720px; }
    .row { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
    .spacer { flex: 1; }
    .dot { width: 10px; height: 10px; border-radius: 50%; display: inline-block; margin-right: 8px; background: #999; }
    .ok { background: #2e7d32; }   /* green */
    .err { background: #c62828; }  /* red */
  `],
  template: `
    <div class="wrap">
      <div class="row">
        <span class="dot" [class.ok]="connected()" [class.err]="!connected()"></span>
        <mat-chip [color]="connected() ? 'primary' : undefined" [disabled]="!connected()">
          {{ connected() ? 'Connected' : 'Disconnected' }}
        </mat-chip>
        <div class="spacer"></div>
        <button mat-stroked-button color="primary" (click)="tryConnect()" [disabled]="connected()">
           Connect
        </button>
        <button mat-stroked-button color="warn" (click)="tryDisconnect()" [disabled]="!connected()">
           Disconnect
        </button>
      </div>

      <div *ngIf="connected()" class="row">
        <mat-chip>Socket ID: {{ socketId() || '—' }}</mat-chip>
      </div>

      <div class="row" *ngIf="!connected()">
        Tip: Click <b>Connect</b> to start receiving “New Task Assigned” alerts.
      </div>
    </div>
  `
})
export class AdminNotificationsComponent {
  private socket = inject(SocketService);

  // Bridge Rx -> Signal
  stateSig = toSignal(this.socket.state$, { initialValue: { connected: false, id: null } });
  connected: Signal<boolean> = computed(() => this.stateSig().connected);
  socketId: Signal<string | null | undefined> = computed(() => this.stateSig().id);

  tryConnect()    { this.socket.connect(); }
  tryDisconnect() { this.socket.disconnect(); }
}

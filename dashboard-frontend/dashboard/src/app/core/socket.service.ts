
import { Injectable, NgZone, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { io, Socket } from 'socket.io-client';
import { BehaviorSubject, Observable, shareReplay } from 'rxjs';
import { environment } from '../../environments/environment';

export interface TaskAssignedPayload {
  id: number;
  title: string;
  message: string;
  assignedBy: string;
  createdAt: string;
}

type ConnState = { connected: boolean; id?: string | null };

@Injectable({ providedIn: 'root' })
export class SocketService {
  private zone = inject(NgZone);
  private platformId = inject(PLATFORM_ID);
  private socket?: Socket;
  private _state$ = new BehaviorSubject<ConnState>({ connected: false, id: null });
  state$ = this._state$.asObservable();

  private _task$?: Observable<TaskAssignedPayload>;

  connect(): void {
    if (!isPlatformBrowser(this.platformId)) return;         
    if (this.socket && this.socket.connected) return;        

    
    this.socket = io(environment.socketUrl, {
      transports: ['websocket'],
      withCredentials: true,
      autoConnect: false,
      reconnection: true,           
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    // Wire events
    this.socket.on('connect', () => {
        console.log('[socket] connected', this.socket?.id);
      this.zone.run(() => this._state$.next({ connected: true, id: this.socket?.id ?? null }));
    });

    this.socket.on('disconnect', () => {
      this.zone.run(() => this._state$.next({ connected: false, id: null }));
    });

    this.socket.on('connect_error', (err) => {
        console.error('[socket] connect_error', err.message);
        });
this.socket.on('error', (err) => {
  console.error('[socket] error', err);
});

    // Start the transport
    this.socket.connect();
  }

  /** Call from Admin UI to disconnect (and stop auto-reconnect) */
  disconnect(): void {
    if (!this.socket) return;
    try {
      // prevent automatic reconnection before disconnect
      this.socket.io.opts.reconnection = false;
    } catch {}
    this.socket.disconnect();
    this.socket = undefined;
    this._state$.next({ connected: false, id: null });
  }

  /** Observable of task notifications (emits only while connected) */
  onTaskAssigned(): Observable<TaskAssignedPayload> {
    if (!this._task$) {
      this._task$ = new Observable<TaskAssignedPayload>((sub) => {
        const handler = (payload: TaskAssignedPayload) => {
          this.zone.run(() => sub.next(payload));
        };
        const attach = () => this.socket?.on('task:assigned', handler);
        const detach = () => this.socket?.off('task:assigned', handler);

        attach();
        this.socket?.on('connect', attach);
        return () => {
          detach();
          this.socket?.off('connect', attach);
        };
      }).pipe(shareReplay(1));
    }
    return this._task$;
  }
}

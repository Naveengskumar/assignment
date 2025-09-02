
import { RouterOutlet } from '@angular/router';
import { SocketService } from './core/socket.service';
import { ToastService } from './core/toast.service';
import { Subscription, filter, switchMap } from 'rxjs';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

// @Component({
//   selector: 'app-root',
//   imports: [RouterOutlet],
//   templateUrl: './app.html',
//   styleUrl: './app.scss'
// })
// export class App {
//   protected readonly title = signal('dashboard');
// }


@Component({
  standalone: true,
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',   
})
export class App implements OnInit, OnDestroy {
  private socket = inject(SocketService);
  private toast = inject(ToastService);
  private sub?: Subscription;

  ngOnInit(): void {
    // Listen to task events whenever the socket is connected
    this.sub = this.socket.state$
      .pipe(
        filter(s => s.connected),
        switchMap(() => this.socket.onTaskAssigned())
      )
      .subscribe(task => {
        this.toast.show(`${task.title}: ${task.message}`);
      });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }
}


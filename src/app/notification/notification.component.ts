import { Component, OnInit, HostListener, OnDestroy } from '@angular/core';
import { NotificationService, Notification } from './notification.service';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.scss']
})
export class NotificationComponent implements OnInit, OnDestroy {
  private subscription: Subscription = new Subscription();
  notifications: Notification[] = [];
  showNotifications: boolean = false;
  unseenCount: number = 0;

  constructor(
    private notificationService: NotificationService,
    private router: Router,
  ) {}

  ngOnInit() {
    // Subscribe to notifications stream
    this.subscription = this.notificationService.notifications$.subscribe(notifications => {
      this.notifications = notifications;
      this.updateUnseenCount();
      console.log('Received notifications:', this.notifications);
    });

    // Initialize unseen count
    this.updateUnseenCount();
  }

  onNotificationClick(notification: Notification) {
    console.log('Clicked notification:', notification);
    this.notificationService.markAsSeen(notification.id);
    this.updateUnseenCount();
    // this.router.navigate(['/task-list'], { queryParams: { taskId: notification.id } });
    // console.log('Unseen count after click:', this.unseenCount);
  }

  isSeen(notificationId: string): boolean {
    return this.notificationService.isSeen(notificationId);
  }

  updateUnseenCount() {
    this.unseenCount = this.notificationService.getUnseenCount();
    console.log('Updated unseen count:', this.unseenCount);
  }

  toggleNotificationPanel() {
    this.showNotifications = !this.showNotifications;
  }

  clearNotifications() {
    this.notificationService.clearNotifications();
    this.showNotifications = false;
    this.updateUnseenCount();
  }

  @HostListener('document:click', ['$event'])
  onClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const notificationDrawer = document.querySelector('.notification-drawer');
    const notificationIcon = document.querySelector('.notification-icon');

    if (this.showNotifications &&
        !notificationDrawer?.contains(target) &&
        !notificationIcon?.contains(target)) {
      this.showNotifications = false; // Close the drawer
    }
  }

  ngOnDestroy() {
    this.subscription.unsubscribe(); // Clean up subscription
  }
}

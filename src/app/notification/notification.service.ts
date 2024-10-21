import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface Notification {
  id: string;
  title: string;
  message: string;
  status: string;
  date: string;
  type: 'due-soon' | 'overdue';
}

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private notifications: Notification[] = [];
  private seenTasks: Set<string> = new Set();
  private notificationSubject = new Subject<Notification[]>();
  private notificationsEnabled = true;
  notifications$ = this.notificationSubject.asObservable();

  constructor() {
    const storedPreference = localStorage.getItem(this.notificationsEnabledKey);
    this.notificationsEnabled = storedPreference === 'true';
    if (this.notificationsEnabled) {
      this.loadNotifications();
    }
  }

  private get notificationsEnabledKey(): string {
    return 'notificationsEnabled';
  }

  addNotification(notification: Notification) {
    if (this.notificationsEnabled && !this.seenTasks.has(notification.id) && !this.notifications.some(n => n.id === notification.id)) {
      this.notifications.push(notification);
      this.saveToLocalStorage();
      this.notificationSubject.next(this.notifications);
    }
  }

  isSeen(notificationId: string): boolean {
    return this.seenTasks.has(notificationId);
  }

  clearNotifications() {
    this.notifications = [];
    this.seenTasks.clear();
    this.notificationSubject.next(this.notifications);
    this.saveToLocalStorage();
  }

  getUnseenCount(): number {
    return this.notifications.filter(notification => !this.seenTasks.has(notification.id)).length;
  }

  markAsSeen(notificationId: string) {
    if (!this.seenTasks.has(notificationId)) {
      this.seenTasks.add(notificationId);
      this.notificationSubject.next(this.notifications);
    }
  }

  loadNotifications() {
    const storedNotifications = JSON.parse(localStorage.getItem('notifications') || '[]');
    this.notifications = storedNotifications;
    this.notificationSubject.next(this.notifications);
  }

  removeNotification(notificationId: string) {
    this.notifications = this.notifications.filter(notification => notification.id !== notificationId);
    this.seenTasks.delete(notificationId);
    this.notificationSubject.next(this.notifications);
    this.saveToLocalStorage();
  }

  private saveToLocalStorage() {
    localStorage.setItem('notifications', JSON.stringify(this.notifications));
  }
}

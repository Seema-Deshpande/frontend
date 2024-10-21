import { Component, OnInit } from '@angular/core';
import { NotificationService } from '../notification/notification.service';

@Component({
  selector: 'app-notification-preferences',
  templateUrl: './notification-preferences.component.html',
  styleUrls: ['./notification-preferences.component.scss']
})
export class NotificationPreferencesComponent implements OnInit {
  areNotificationsEnabled: boolean = true; // Default value

  constructor(private notificationService: NotificationService) {}

  ngOnInit() {
    const savedPreference = localStorage.getItem('notificationsEnabled');
    this.areNotificationsEnabled = savedPreference === 'true';
    if (this.areNotificationsEnabled) {
      this.notificationService.loadNotifications(); // Load notifications if enabled
    }
  }

  toggleNotifications() {
    this.areNotificationsEnabled = !this.areNotificationsEnabled;
    localStorage.setItem('notificationsEnabled', JSON.stringify(this.areNotificationsEnabled));
    if (this.areNotificationsEnabled) {
      this.notificationService.loadNotifications(); // Load notifications if enabled
    } else {
      this.notificationService.clearNotifications(); // Clear if disabled
    }
  }
}

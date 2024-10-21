import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NotificationPreferencesComponent } from './notification-preferences.component';
import { NotificationService } from '../notification/notification.service';
import { FormsModule } from '@angular/forms';

describe('NotificationPreferencesComponent', () => {
  let component: NotificationPreferencesComponent;
  let fixture: ComponentFixture<NotificationPreferencesComponent>;
  let notificationServiceSpy: jasmine.SpyObj<NotificationService>;

  beforeEach(async () => {
    notificationServiceSpy = jasmine.createSpyObj('NotificationService', ['loadNotifications', 'clearNotifications']);

    await TestBed.configureTestingModule({
      imports: [FormsModule],
      declarations: [NotificationPreferencesComponent],
      providers: [
        { provide: NotificationService, useValue: notificationServiceSpy }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NotificationPreferencesComponent);
    component = fixture.componentInstance;

    // Reset localStorage before each test
    localStorage.clear();
    component.ngOnInit(); // Initialize component
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize notificationsEnabled from localStorage', () => {
    localStorage.setItem('notificationsEnabled', 'true');
    component.ngOnInit();
    expect(component.areNotificationsEnabled).toBeTrue();

    localStorage.setItem('notificationsEnabled', 'false');
    component.ngOnInit();
    expect(component.areNotificationsEnabled).toBeFalse();
  });

  it('should toggle notifications and update localStorage', () => {
    // Initially set notificationsEnabled to false
    component.areNotificationsEnabled = false;
    localStorage.setItem('notificationsEnabled', 'false');

    component.toggleNotifications();
    expect(component.areNotificationsEnabled).toBeTrue(); // First toggle should enable notifications
    expect(localStorage.getItem('notificationsEnabled')).toBe('true');
    expect(notificationServiceSpy.loadNotifications).toHaveBeenCalled();

    component.toggleNotifications();
    expect(component.areNotificationsEnabled).toBeFalse(); // Second toggle should disable notifications
    expect(localStorage.getItem('notificationsEnabled')).toBe('false');
    expect(notificationServiceSpy.clearNotifications).toHaveBeenCalled();
  });
});

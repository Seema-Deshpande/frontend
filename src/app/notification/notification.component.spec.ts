import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NotificationComponent } from './notification.component';
import { NotificationService, Notification } from './notification.service';
import { of, Subject } from 'rxjs';
import { RouterTestingModule } from '@angular/router/testing'; // For testing routerLink

// Mock notifications
const mockNotifications: Notification[] = [
  { id: '1', title: 'Task Due Soon', message: 'Task 1 is due soon!', status: 'unseen', date: '2024-03-10', type: 'due-soon' },
  { id: '2', title: 'Task Overdue', message: 'Task 2 is overdue!', status: 'seen', date: '2024-03-05', type: 'overdue' }
];

describe('NotificationComponent', () => {
  let component: NotificationComponent;
  let service: NotificationService;
  let fixture: ComponentFixture<NotificationComponent>;
  let notificationServiceSpy: jasmine.SpyObj<NotificationService>;
  let mockNotificationsSubject: Subject<Notification[]>;

  beforeEach(async () => {
    mockNotificationsSubject = new Subject<Notification[]>();
    notificationServiceSpy = jasmine.createSpyObj('NotificationService',
      ['markAsSeen', 'isSeen', 'getUnseenCount', 'clearNotifications', 'removeNotification'],
      { notifications$: mockNotificationsSubject.asObservable() } // Mock the Observable
    );

    await TestBed.configureTestingModule({
      imports: [RouterTestingModule], // Add RouterTestingModule
      declarations: [NotificationComponent],
      providers: [
        { provide: NotificationService, useValue: notificationServiceSpy }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NotificationComponent);
    component = fixture.componentInstance;

    notificationServiceSpy.getUnseenCount.and.returnValue(1); // Mock unseen count
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load notifications on init', () => {
    mockNotificationsSubject.next(mockNotifications); // Emit mock notifications
    fixture.detectChanges(); // Trigger change detection

    expect(component.notifications).toEqual(mockNotifications);
  });

  it('should mark notification as seen on click', () => {
    const mockNotification = mockNotifications[0];
    component.onNotificationClick(mockNotification);

    expect(notificationServiceSpy.markAsSeen).toHaveBeenCalledWith(mockNotification.id);
  });

  it('should check if a notification is seen', () => {
    notificationServiceSpy.isSeen.and.returnValue(true); // Mock isSeen to return true
    const isSeen = component.isSeen('1');
    expect(isSeen).toBeTrue();
    expect(notificationServiceSpy.isSeen).toHaveBeenCalledWith('1');
  });

  it('should update unseen count', () => {
    component.updateUnseenCount();
    expect(notificationServiceSpy.getUnseenCount).toHaveBeenCalled();
    expect(component.unseenCount).toBe(1); // Based on the mock value
  });

  it('should clear notifications', () => {
    component.clearNotifications();
    expect(notificationServiceSpy.clearNotifications).toHaveBeenCalled();
    expect(component.showNotifications).toBeFalse();
  });

  it('should toggle notification panel', () => {
    component.toggleNotificationPanel();
    expect(component.showNotifications).toBeTrue();

    component.toggleNotificationPanel();
    expect(component.showNotifications).toBeFalse();
  });

  it('should close notification panel on outside click', () => {
    component.showNotifications = true;
    fixture.detectChanges();

    // Simulate click outside the component
    document.dispatchEvent(new MouseEvent('click'));
    fixture.detectChanges();

    expect(component.showNotifications).toBeFalse();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SettingsComponent } from './settings.component';
import { NotificationService } from '../notification/notification.service';

describe('SettingsComponent', () => {
  let component: SettingsComponent;
  let fixture: ComponentFixture<SettingsComponent>;
  let notificationServiceSpy: jasmine.SpyObj<NotificationService>;

  beforeEach(async () => {
    notificationServiceSpy = jasmine.createSpyObj('NotificationService', ['toggleNotifications']);

    await TestBed.configureTestingModule({
      declarations: [SettingsComponent],
      providers: [
        { provide: NotificationService, useValue: notificationServiceSpy }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should toggle the drawer', () => {
    expect(component.showDrawer).toBeFalse();
    component.toggleDrawer();
    expect(component.showDrawer).toBeTrue();
    component.toggleDrawer();
    expect(component.showDrawer).toBeFalse();
  });

  it('should close the drawer', () => {
    component.showDrawer = true;
    component.closeDrawer();
    expect(component.showDrawer).toBeFalse();
  });
});

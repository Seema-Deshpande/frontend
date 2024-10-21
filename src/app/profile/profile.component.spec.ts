import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProfileComponent } from './profile.component';
import { AuthService } from '../auth/auth.service';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { FormsModule } from '@angular/forms';

describe('ProfileComponent', () => {
  let component: ProfileComponent;
  let fixture: ComponentFixture<ProfileComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    authServiceSpy = jasmine.createSpyObj('AuthService', [
      'getProfile', 
      'updateProfile', 
      'logout'
    ]);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [FormsModule],
      declarations: [ProfileComponent],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should fetch profile on init', () => {
    const mockProfile = { username: 'testuser', email: 'test@example.com' };
    authServiceSpy.getProfile.and.returnValue(of(mockProfile));

    component.ngOnInit();

    expect(authServiceSpy.getProfile).toHaveBeenCalled();
    expect(component.username).toBe(mockProfile.username);
    expect(component.email).toBe(mockProfile.email);
  });

  it('should handle error when fetching profile fails', () => {
    const mockError = new Error('Failed to fetch profile');
    authServiceSpy.getProfile.and.returnValue(throwError(() => mockError));
    spyOn(console, 'error');

    component.ngOnInit();

    expect(authServiceSpy.getProfile).toHaveBeenCalled();
    expect(console.error).toHaveBeenCalledWith('Failed to fetch profile', mockError);
  });

  it('should update profile', () => {
    const updatedData = { username: 'newusername', email: 'new@example.com' };
    authServiceSpy.updateProfile.and.returnValue(of({}));

    component.username = updatedData.username;
    component.email = updatedData.email;
    component.updateProfile();

    expect(authServiceSpy.updateProfile).toHaveBeenCalledWith(updatedData);
  });

  it('should handle error when updating profile fails', () => {
    const mockError = new Error('Failed to update profile');
    authServiceSpy.updateProfile.and.returnValue(throwError(() => mockError));
    spyOn(console, 'error');

    component.updateProfile();

    expect(authServiceSpy.updateProfile).toHaveBeenCalled();
    expect(console.error).toHaveBeenCalledWith('Failed to update profile', mockError);
  });

  it('should logout', () => {
    authServiceSpy.logout.and.returnValue(of({ message: 'Logout successful' }));

    component.logout();

    expect(authServiceSpy.logout).toHaveBeenCalled();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should handle error during logout', () => {
    const mockError = new Error('Logout failed');
    authServiceSpy.logout.and.returnValue(throwError(() => mockError));
    spyOn(console, 'error');

    component.logout();

    expect(authServiceSpy.logout).toHaveBeenCalled();
    expect(console.error).toHaveBeenCalledWith('Logout failed', mockError);
  });
});

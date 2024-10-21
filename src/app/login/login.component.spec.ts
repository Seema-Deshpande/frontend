import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginComponent } from './login.component';
import { AuthService } from '../auth/auth.service';
import { Router } from '@angular/router';
import { FormsModule, NgForm } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { ToastrModule, ToastrService } from 'ngx-toastr';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let toastrSpy: jasmine.SpyObj<ToastrService>;

  beforeEach(async () => {
    authServiceSpy = jasmine.createSpyObj('AuthService', ['login']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    toastrSpy = jasmine.createSpyObj('ToastrService', ['success', 'error']);

    await TestBed.configureTestingModule({
      imports: [FormsModule, ToastrModule.forRoot()],
      declarations: [LoginComponent],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ToastrService, useValue: toastrSpy }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should login successfully and navigate to dashboard', () => {
    const mockResponse = {};
    authServiceSpy.login.and.returnValue(of(mockResponse));
    component.username = 'testuser';
    component.password = 'password';

    component.onSubmit({ valid: true } as NgForm);

    expect(authServiceSpy.login).toHaveBeenCalledWith('testuser', 'password');
    expect(toastrSpy.success).toHaveBeenCalledWith('Logged In Successfully', 'Success');
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/dashboard']);
  });

  it('should handle login error', () => {
    spyOn(console, 'error'); // Spy on console.error
    authServiceSpy.login.and.returnValue(throwError(() => new Error('Invalid credentials')));
    component.username = 'wronguser';
    component.password = 'wrongpassword';

    component.onSubmit({ valid: true } as NgForm);

    expect(authServiceSpy.login).toHaveBeenCalledWith('wronguser', 'wrongpassword');
    expect(component.errorMessage).toBe('Invalid username or password. Please try again.');
    expect(toastrSpy.error).toHaveBeenCalledWith('Invalid credentials', 'Error');
    expect(console.error).toHaveBeenCalledWith('Login error:', jasmine.any(Error));
  });

  it('should show error message if form is invalid', () => {
    component.onSubmit({ valid: false } as NgForm);

    expect(component.errorMessage).toBe('Please fill in all required fields.');
  });
});

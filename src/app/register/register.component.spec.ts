import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RegisterComponent } from './register.component';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RegisterService } from './register.service';
import { of, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing'; 
import { ToastrModule, ToastrService } from 'ngx-toastr'; 

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let registerServiceSpy: jasmine.SpyObj<RegisterService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let toastrSpy: jasmine.SpyObj<ToastrService>;

  beforeEach(async () => {
    registerServiceSpy = jasmine.createSpyObj('RegisterService', ['register']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    toastrSpy = jasmine.createSpyObj('ToastrService', ['success', 'error']);

    await TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule, 
        FormsModule,
        RouterTestingModule,
        ToastrModule.forRoot() 
      ],
      declarations: [RegisterComponent],
      providers: [
        FormBuilder, 
        { provide: RegisterService, useValue: registerServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ToastrService, useValue: toastrSpy }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should create a form with 3 controls', () => {
    expect(component.registerForm.contains('username')).toBeTruthy();
    expect(component.registerForm.contains('email')).toBeTruthy();
    expect(component.registerForm.contains('password')).toBeTruthy();
  });

  it('should make the username, email, and password controls required', () => {
    let username = component.registerForm.get('username');
    let email = component.registerForm.get('email');
    let password = component.registerForm.get('password');

    username?.setValue('');
    email?.setValue('');
    password?.setValue('');

    expect(username?.valid).toBeFalsy();
    expect(email?.valid).toBeFalsy();
    expect(password?.valid).toBeFalsy();
  });

  it('should make the username control at least 3 characters long', () => {
    let username = component.registerForm.get('username');
    username?.setValue('ab');
    expect(username?.valid).toBeFalsy();
  });

  it('should make the email control follow the correct email format', () => {
    let email = component.registerForm.get('email');
    email?.setValue('testemail');
    expect(email?.valid).toBeFalsy();
  });

  it('should make the password control at least 6 characters long', () => {
    let password = component.registerForm.get('password');
    password?.setValue('pass');
    expect(password?.valid).toBeFalsy();
  });

  it('should call register method and navigate to login on success', () => {
    const mockUser = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123'
    };
    registerServiceSpy.register.and.returnValue(of({}));

    component.registerForm.setValue(mockUser);

    component.onSubmit();

    expect(registerServiceSpy.register).toHaveBeenCalledWith(mockUser);
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
    expect(toastrSpy.success).toHaveBeenCalledWith('Registered Successfully', 'Success');
  });

  it('should handle registration error', () => {
    const mockError = new Error('Registration failed');
    registerServiceSpy.register.and.returnValue(throwError(() => mockError));

    component.registerForm.setValue({
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123'
    });

    component.onSubmit();

    expect(registerServiceSpy.register).toHaveBeenCalled();
    expect(toastrSpy.error).toHaveBeenCalledWith('Registration failed', 'Error');
  });
});

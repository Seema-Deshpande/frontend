import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing'; // Import RouterTestingModule
import { of, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule], // Add RouterTestingModule here
      providers: [AuthService]
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify(); // Verify that there are no outstanding HTTP requests
    localStorage.clear(); // Clear localStorage after each test
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should login successfully', () => {
    const mockUser = { username: 'testuser', password: 'password' };
    const mockResponse = { token: 'mockToken' };

    service.login(mockUser.username, mockUser.password).subscribe(response => {
      expect(response).toEqual(mockResponse);
      expect(localStorage.getItem('authToken')).toBe(mockResponse.token);
      expect(service['isLoggedInSubject'].getValue()).toBeTrue(); // Adjusted to check the subject directly
    });

    const req = httpMock.expectOne(`${service['apiUrl']}/login`);
    expect(req.request.method).toBe('POST');
    req.flush(mockResponse);
  });

  it('should handle login error', () => {
    const mockUser = { username: 'testuser', password: 'wrongpassword' };
    const mockErrorResponse = new HttpErrorResponse({
      error: { message: 'Invalid username or password' },
      status: 401,
      statusText: 'Unauthorized'
    });
    service.login(mockUser.username, mockUser.password).subscribe({
      next: () => fail('expected an error, not a login success'),
      error: (error) => {
        expect(error.status).toEqual(401);
        expect(error.error.message).toEqual('Invalid username or password');
      }
    });
    const req = httpMock.expectOne(`${service['apiUrl']}/login`);
    expect(req.request.method).toBe('POST');
    req.flush(mockErrorResponse.error, { status: 401, statusText: 'Unauthorized' });
  });

  it('should logout successfully when token exists', () => {
    localStorage.setItem('authToken', 'mockToken');
    service['isLoggedInSubject'].next(true); // Set logged in to true

    service.logout().subscribe(response => {
      expect(response).toEqual({ message: 'Logged out successfully' });
      expect(localStorage.getItem('authToken')).toBeNull();

      // Subscribe to isLoggedIn$ to check if it reflects false
      service.isLoggedIn$.subscribe(isLoggedIn => {
        expect(isLoggedIn).toBeFalse();
      });
    });

    const req = httpMock.expectOne(`${service['apiUrl']}/logout`);
    expect(req.request.method).toBe('POST');
    req.flush({ message: 'Logged out successfully' });
  });

  it('should logout locally when no token exists', () => {
    service.logout().subscribe(response => {
      expect(response).toEqual({ message: 'Logged out locally' });
      expect(localStorage.getItem('authToken')).toBeNull();
      expect(service['isLoggedInSubject'].getValue()).toBeFalse(); // Check the subject state
    }); 
    httpMock.expectNone(`${service['apiUrl']}/logout`); // No HTTP request should be made
  });

  it('should handle logout error', () => {
    localStorage.setItem('authToken', 'mockToken');
    service['isLoggedInSubject'].next(true); // Set logged in to true

    const mockErrorResponse = new HttpErrorResponse({
      error: 'Logout failed',
      status: 500,
      statusText: 'Internal Server Error'
    });

    service.logout().subscribe({
      next: () => fail('expected an error, not a logout success'),
      error: (error) => {
        expect(error.status).toEqual(500);
        expect(localStorage.getItem('authToken')).toBeNull(); // Ensure token is removed
        expect(service['isLoggedInSubject'].getValue()).toBeFalse(); // Check login state
      }
    });

    const req = httpMock.expectOne(`${service['apiUrl']}/logout`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ token: 'mockToken' }); // Ensure token is sent in request
    req.flush(mockErrorResponse.error, { status: 500, statusText: 'Internal Server Error' });
  });


  it('should get user profile', () => {
    const mockUserId = '123';
    const mockProfile = { username: 'testuser', email: 'test@example.com' };
    spyOn(service, 'getUserId').and.returnValue(mockUserId); // Mock getUserId to return a fixed ID

    service.getProfile().subscribe(profile => {
        expect(profile).toEqual(mockProfile);
    });

    const req = httpMock.expectOne(`${service['apiUrl']}/profile/${mockUserId}`);
    expect(req.request.method).toBe('GET');
    req.flush(mockProfile);
});

it('should handle get profile error', () => {
  const mockUsername = 'testuser';
  const mockErrorResponse = new HttpErrorResponse({
      error: { message: 'Failed to fetch profile' },
      status: 500,
      statusText: 'Internal Server Error'
  });
  
  // Mock local storage
  localStorage.setItem('username', mockUsername);

  // Mock the getUserId method to return a valid ID
  spyOn(service, 'getUserId').and.returnValue('123');

  service.getProfile().subscribe({
      next: () => fail('expected an error, not a profile'),
      error: (error) => {
          expect(error.status).toEqual(500);
          expect(error.error.message).toEqual('Failed to fetch profile');
      }
  });

  const req = httpMock.expectOne(`${service['apiUrl']}/profile/123`);
  expect(req.request.method).toBe('GET');
  req.flush(mockErrorResponse.error, { status: 500, statusText: 'Internal Server Error' });
});



  it('should handle update profile error', () => {
    const updatedData = { username: 'newusername', email: 'new@example.com' };
    const mockErrorResponse = new HttpErrorResponse({
        error: { message: 'Failed to update profile' },
        status: 500,
        statusText: 'Internal Server Error'
    });

    // Mock the getUserId method to return a valid ID
    spyOn(service, 'getUserId').and.returnValue('123');

    service.updateProfile(updatedData).subscribe({
        next: () => fail('expected an error, not a profile update success'),
        error: (error: HttpErrorResponse) => {
            expect(error.status).toEqual(500);
            expect(error.error.message).toEqual('Failed to update profile');
        }
    });

    // Adjust the expected endpoint to include the user ID
    const req = httpMock.expectOne(`${service['apiUrl']}/profile/123`);
    expect(req.request.method).toBe('PUT');
    req.flush(mockErrorResponse.error, { status: 500, statusText: 'Internal Server Error' });
});

  // ... other test cases for setToken, getToken, removeToken, hasToken, getUserId
  it('should set, get, and remove token correctly', () => {
    const mockToken = 'testToken';
    service['setToken'](mockToken);
    expect(localStorage.getItem('authToken')).toBe(mockToken);
    expect(service['getToken']()).toBe(mockToken);

    service['removeToken']();
    expect(localStorage.getItem('authToken')).toBeNull();
    expect(service['getToken']()).toBeNull();
  });

  it('should check for token existence', () => {
    expect(service['hasToken']()).toBeFalse();

    localStorage.setItem('authToken', 'someToken');
    expect(service['hasToken']()).toBeTrue();
  });

  it('should get user ID from token', () => {
    const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxMjMiLCJpYXQiOjE2OTI4Mjg1NDYsImV4cCI6MTk2ODIyODU0Nn0.mockToken';
    localStorage.setItem('authToken', mockToken);
    expect(service.getUserId()).toBe('123');
  });

  it('should return null for user ID when token is missing', () => {
    expect(service.getUserId()).toBeNull();
  });
});


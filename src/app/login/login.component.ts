import { Component } from '@angular/core';
import { NgForm} from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { ToastrService } from 'ngx-toastr';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  username: string = '';
  password: string = '';
  errorMessage: string = '';

  constructor(private authService: AuthService, private router: Router,  private toastr: ToastrService) { }

  onSubmit(loginForm: NgForm): void {
    if (loginForm.valid) {
      this.authService.login(this.username, this.password).subscribe({
        next: () => {
          this.toastr.success('Logged In Successfully', 'Success');
          this.router.navigate(['/dashboard']); // Redirect to a different route after successful login
        },
        error: (err) => {
          this.errorMessage = 'Invalid username or password. Please try again.';
          console.error('Login error:', err);
          this.toastr.error('Invalid credentials', 'Error');
        }
      });
    } else {
      this.errorMessage = 'Please fill in all required fields.';
    }
  }
}

import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';


@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  username: string = '';
  email: string = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.fetchProfile();
  }

  fetchProfile(): void {
    this.authService.getProfile().subscribe({
      next: (profile) => {
        this.username = profile.username;
        this.email = profile.email;
      },
      error: (err) => console.error('Failed to fetch profile', err),
    });
  }

  updateProfile(): void {
    const updatedData = {
      username: this.username,
      email: this.email // Assuming you have this.email available
    };
    this.authService.updateProfile(updatedData).subscribe({
      next: (response) => {
        this.toastr.success('Profile updated successfully', 'Success');
        console.log('Profile updated successfully', response);
        // Optionally, you can update localStorage or notify the user
      },
      error: (err) => {
        this.toastr.error('Failed to update profile', 'Error');
        console.error('Failed to update profile', err);
      }
    });
  }
  logout(): void {
    this.authService.logout().subscribe({
      next: (response) => {
        console.log(response.message);
        this.toastr.success('Logged out successfully', 'Success');
        this.router.navigate(['/login'])
        // Redirect or perform additional actions on successful logout
      },
      error: (err) => {
        this.toastr.error('Logout failed', 'Error');
        console.error('Logout failed', err);
        // Handle error
      }
    });
  }
}

import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { RegisterService } from './register.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private userService: RegisterService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.registerForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
     // Debug form state
  this.registerForm.statusChanges.subscribe(status => {
    console.log('Form status:', status);
    console.log('Form value:', this.registerForm.value);
    console.log('Is form valid?', this.registerForm.valid);
  });
  }

  get username() {
    return this.registerForm.get('username');
  }

  get email() {
    return this.registerForm.get('email');
  }

  get password() {
    return this.registerForm.get('password');
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      this.userService.register(this.registerForm.value).subscribe({
        next: (response) => {
          // Handle successful registration
          console.log('Registration successful:', response);
          this.toastr.success('Registered Successfully', 'Success');
          this.router.navigate(['/login']); // Navigate to login or another route
        },
        error: (error) => {
          // Handle error
          this.toastr.error('Registration failed', 'Error');
          console.error('Registration error:', error);
        }
      });
    }
  }
}

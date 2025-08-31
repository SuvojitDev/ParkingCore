import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { finalize } from 'rxjs';
import { AuthService } from 'src/app/core/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit, OnDestroy {
  loginForm!: FormGroup;
  isLoading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private toastr: ToastrService,
    private authService: AuthService,
  ) { }

  ngOnInit(): void {
    this.createLoginForm();
    // console.log('LoginComponent initialized');
  }

  createLoginForm(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  submitForm(): void {
    this.isLoading = true;
    console.log('submitForm::::', this.loginForm.value);
    if (this.loginForm.valid) {
      const payload = {
        email: this.loginForm.value.email,
        password: this.loginForm.value.password
      };
      console.log('Final Payload:', payload);
      this.authService.login(payload)
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (response) => {
          console.log('Login Response:', response);
          this.authService.setSession(response?.token, response?.user?.role, response?.user?.name);
          this.toastr.success('Login successful!');
          // Redirect based on role
          switch (response?.user?.role) {
            case 'Admin':
              this.router.navigate(['/admin/dashboard']);
              break;
            case 'Manager':
              this.router.navigate(['/manager/dashboard']);
              break;
            case 'Customer':
              this.router.navigate(['/customer/dashboard']);
              break;
            default:
              this.router.navigate(['/']);
          }
        },
        error: (error) => {
          console.error('Login Error:', error);
          this.toastr.error(error.error.message || 'Login failed, Please try again');
          this.isLoading = false;
        }
      });
    } else {
      this.toastr.error('Please fill all required fields');
    }
  }

  ngOnDestroy(): void {
    console.log('LoginComponent destroyed');
  }
}

import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { finalize } from 'rxjs';
import { AuthService } from 'src/app/core/services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup;
  isLoading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService,
  ) { }

  ngOnInit(): void {
    this.createRegisterForm();
  }

  createRegisterForm(): void {
    this.registerForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  submitRegisterForm(): void {
    this.isLoading = true;
    console.log('submitRegisterForm::::', this.registerForm.value);
    if (this.registerForm.valid) {
      const payload = {
        name: this.registerForm.value.name,
        email: this.registerForm.value.email,
        password: this.registerForm.value.password
      };
      console.log('Registration Payload:', payload);
      this.authService.register(payload)
        .pipe(finalize(() => this.isLoading = false))
        .subscribe({
          next: (response) => {
            // console.log('Registration successful:', response);
            this.toastr.success('Registration successful');
            this.router.navigate(['/auth/login']);
          },
          error: (error) => {
            console.error('Registration error:', error);
            this.toastr.error(error.error.message || 'Registration failed, Please try again.');
            this.isLoading = false;
          }
        });
    } else {
      this.registerForm.markAllAsTouched(); // show validation errors
    }
  }

  ngOnDestroy(): void { }
}

import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from 'src/app/core/services/auth.service';

@Component({
  selector: 'app-forget-password',
  templateUrl: './forget-password.component.html',
  styleUrls: ['./forget-password.component.css']
})
export class ForgetPasswordComponent implements OnInit {
  forgotPasswordForm!: FormGroup;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    this.createForgetPasswordForm();
  }

  createForgetPasswordForm() {
    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  submitForm(): void {
    if (this.forgotPasswordForm.valid) {
      this.isLoading = true;
      const { email } = this.forgotPasswordForm.value;

      this.authService.forgotPassword(email).subscribe({
        next: () => {
          this.toastr.success('Password reset link sent to your email');
          this.isLoading = false;
        },
        error: (err) => {
          this.toastr.error(err.error.message || 'Failed to send reset link');
          this.isLoading = false;
        }
      });
    } else {
      this.toastr.error('Please enter a valid email');
    }
  }
}

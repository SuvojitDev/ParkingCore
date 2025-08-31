// import { Component, OnInit } from '@angular/core';

// @Component({
//   selector: 'app-navbar',
//   templateUrl: './navbar.component.html',
//   styleUrls: ['./navbar.component.css']
// })
// export class NavbarComponent implements OnInit {

//   constructor() { }

//   ngOnInit(): void {
//     const token = sessionStorage.getItem('userName');
//     console.log('NavbarComponent initialized. Token:', token);
//   }
// }

// src/app/core/layout/navbar/navbar.component.ts
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Observable } from 'rxjs';
import { AuthService } from 'src/app/core/services/auth.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  isLoggedIn$!: Observable<boolean>;
  userRole$!: Observable<string | null>;
  userName$!: Observable<string | null>;

  constructor(
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService,
  ) { }

  ngOnInit(): void {
    this.isLoggedIn$ = this.authService.loggedIn$;
    this.userRole$ = this.authService.userRole$;
    this.userName$ = this.authService.userName$;
  }

  // Logout method
  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
    this.toastr.success('Logged out successfully');
  }
}
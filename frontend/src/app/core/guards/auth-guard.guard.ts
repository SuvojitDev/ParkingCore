// import { CanActivateFn } from '@angular/router';

// export const authGuardGuard: CanActivateFn = (route, state) => {
//   return true;
// };


import { CanActivateFn, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authGuardGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isLoggedIn()) {
    router.navigate(['/auth']);
    return false;
  }

  const expectedRoles = route.data['expectedRoles'] as string[];
  const userRole = authService.getRole();
  const userName = authService.getUserName();

  if (expectedRoles && !expectedRoles.includes(userRole!) && userName) {
    // Redirect to home or unauthorized page
    router.navigate(['/auth']);
    return false;
  }

  return true;
};

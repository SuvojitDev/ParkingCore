import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { authGuardGuard } from './core/guards/auth-guard.guard';

const routes: Routes = [
  // Landing page (home)
  {
    path: '',
    loadChildren: () => import('./core/components/home/home.module').then(m => m.HomeModule)
  },

  // Auth (login & register)
  {
    path: 'auth',
    loadChildren: () => import('./core/components/auth/auth.module').then(m => m.AuthModule)
  },

  // Dashboard (protected)
  // {
  //   path: 'dashboard',
  //   loadChildren: () => import('./core/components/dashboard/dashboard.module').then(m => m.DashboardModule),
  //   canActivate: [authGuardGuard],
  //   data: { 
  //     expectedRoles: ['Admin', 'Manager', 'Customer'] 
  //   }
  // },
  {
    path: 'admin',
    loadChildren: () => import('./core/components/dashboard/dashboard.module').then(m => m.DashboardModule),
    canActivate: [authGuardGuard],
    data: { expectedRoles: ['Admin'] }
  },
  {
    path: 'manager',
    loadChildren: () => import('./core/components/dashboard/dashboard.module').then(m => m.DashboardModule),
    canActivate: [authGuardGuard],
    data: { expectedRoles: ['Manager'] }
  },
  {
    path: 'customer',
    loadChildren: () => import('./core/components/dashboard/dashboard.module').then(m => m.DashboardModule),
    canActivate: [authGuardGuard],
    data: { expectedRoles: ['Customer'] }
  },

  // Wildcard → back to home
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

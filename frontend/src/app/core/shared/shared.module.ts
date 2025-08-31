import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoaderComponent } from './components/loader/loader.component';
import { ToastrModule } from 'ngx-toastr';
import { NavbarComponent } from './layout/navbar/navbar.component';
import { FooterComponent } from './layout/footer/footer.component';
import { AppRoutingModule } from "src/app/app-routing.module";
@NgModule({
  declarations: [
    LoaderComponent,
    NavbarComponent,
    FooterComponent
  ],
  imports: [
    CommonModule,
    ToastrModule.forRoot({
      timeOut: 1500,
      positionClass: 'toast-top-right',
      preventDuplicates: true,
      progressBar: true,
    }),
    AppRoutingModule
  ],
  exports: [
    LoaderComponent,
    NavbarComponent,
    FooterComponent,
    ToastrModule
  ]
})
export class SharedModule { }

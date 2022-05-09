import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatMenuModule } from '@angular/material/menu';
import { RouterModule } from '@angular/router';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { FooterComponent } from './footer/footer.component';
import { HttpClientModule } from '@angular/common/http';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { MatDialogModule } from '@angular/material/dialog'
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppShellRenderDirective } from '../directives/app-shell-render.directive';
import { AppShellNoRenderDirective } from '../directives/app-shell-no-render.directive';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { TranslateModule } from '@ngx-translate/core';
import { ImageComponent } from './image/image.component';
import { ImagekitioAngularModule } from 'imagekitio-angular';
import { environment } from 'src/environments/environment';

import { MatProgressBarModule } from '@angular/material/progress-bar';

const components = [
  AppShellRenderDirective,
  AppShellNoRenderDirective,
  FooterComponent,
  ImageComponent
];

const modules = [
  CommonModule,
  MatToolbarModule,
  MatSidenavModule,
  MatMenuModule,
  MatSnackBarModule,
  MatDialogModule,
  RouterModule,
  HttpClientModule,
  NgxSkeletonLoaderModule,
  FormsModule,
  ReactiveFormsModule,
  InfiniteScrollModule,
  TranslateModule,
  MatProgressBarModule
];

@NgModule({
  declarations: [...components],
  imports: [
    ...modules,
    ImagekitioAngularModule.forRoot({
      publicKey: 'public_TOa/IP2yX1o2eHip4nsS+rPLsjE=', // or environment.publicKey
      urlEndpoint: 'https://ik.imagekit.io/lfegvix1p', // or environment.urlEndpoint
      authenticationEndpoint: environment.ovhTokenUrl // or environment.authenticationEndpoint
    }),
  ],
  exports: [
    ...components,
    ...modules,
  ]
})
export class SharedModule { }

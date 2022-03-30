import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { isPlatformBrowser, isPlatformServer } from '@angular/common';
import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { map, Observable, shareReplay } from 'rxjs';
import { FileUploadService } from './services/file-upload.service';
import { MessageService } from './services/message.service';
import { AuthService } from './user/auth.service';

declare var Prism: any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  isHandset$: Observable<boolean> = this.breakpointObserver.observe([Breakpoints.Handset])
    .pipe(
      map(result => result.matches),
      shareReplay()
    );

  browserLanguage!: string;

  constructor(
    @Inject(PLATFORM_ID) private platformId: any,
    private translate: TranslateService,
    private breakpointObserver: BreakpointObserver,
    private messageService: MessageService,
    private router: Router,
    public authService: AuthService,
    private fileUploadService: FileUploadService
  ) {
    this.setBrowserTranslationConfigs();
  }

  public checkRouteUrl(): boolean {
    const componentsPrefix = [
      '/user/profile',
      '/user/profile/edit',
      '/user/dashboard'
    ]
    const currentUrl = this.router.url;
    return componentsPrefix.some((route: string) => currentUrl.includes(route));
  }

  public setBrowserTranslationConfigs() {
    if (isPlatformBrowser(this.platformId)) {
      this.browserLanguage = (window.navigator as any).language
    }

    this.translate.setDefaultLang('fr');
    this.translate.use('fr');
    console.log('LOCALE LANGUAGE: ', this.browserLanguage);
  }

  public logout() {
    this.authService.logout();
    this.router.navigateByUrl('/')
    // location.reload();
  }

  // Use to set the language on a btn click for example
  public useLanguage(language: string) {
    this.translate.use(language);
  }

  public alertCopy() {
    console.log('COPY DONE');
    this.messageService.openSnackBarWarning('Code Copied', '');
  }

  public fetchAllArticlesAsAdmin() {
    console.log('FECTH ALL AS ADMIN');
    // set isUserAdmin = authService.currentUser.isAdmin
    // if isUserAdmin ==> fetchAll(PUBLISHED)
    // On click on Mes articless ==> component mount ==> ng onit ==> set isUserAdmin = false
    // On page refresh set default to Mes articles ==> btn styles and initial feth ng onit
  }

  public fetchAllArticlesAsUser() {
    console.log('FECTH ALL AS USER');
    // set isUserAdmin = authService.currentUser.isAdmin
    // if isUserAdmin ==> fetchAll(PUBLISHED)
    // On click on Mes articless ==> component mount ==> ng onit ==> set isUserAdmin = false
    // On page refresh set default to Mes articles ==> btn styles and initial feth ng onit
  }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      Prism.plugins.toolbar.registerButton('select-code', function (_env: any) {
        const button = document.createElement('button');

        button.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
      <path stroke-linecap="round" stroke-linejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>`;

        return button;
      });
    }

    if (isPlatformServer(this.platformId)) {
      this.fileUploadService.xToken$.subscribe();
    }
  }
}
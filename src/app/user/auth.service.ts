import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, catchError, map, Observable, of, shareReplay, tap, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';
import { User } from './user.model';

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json',
    Authorization: 'my-auth-token'
  })
};

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly apiServerUrl = environment.apiBaseUrl;


  private subject = new BehaviorSubject<User>(null!);
  public user$ = this.subject.asObservable();

  public isLoggedIn$!: Observable<boolean>;
  public isLoggedOut$!: Observable<boolean>;

  public TOKEN_NAME: string = 'access_token';
  public REFRESH_TOKEN_NAME: string = 'refresh_token';

  private redirectURL: string;

  constructor(
    @Inject(PLATFORM_ID) private platformId: any,
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router
  ) {
    // this.isLoggedIn$ = this.user$.pipe(map(user => !!user));
    this.isLoggedIn$ = of(this.currentUsr).pipe(map(user => !!user));
    this.isLoggedOut$ = this.isLoggedIn$.pipe(map(loggedIn => !loggedIn));

    this.redirectURL = this.route.snapshot.queryParamMap.get('redirectURL')!;

    this.loadCurrentUser();
  }

  private loadCurrentUser() {
    this.user$ = this.http.get<User>(`${this.apiServerUrl}/user`)
      .pipe(
        catchError(error => {
          return throwError(() => error);
        }),
        tap(usr => {
          console.log('ME: ', usr);
          this.subject.next(usr);
        })
      )
  }

  get token(): any {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem(this.TOKEN_NAME);;
    }
  }

  get refreshToken(): any {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem(this.REFRESH_TOKEN_NAME);
    }
  }

  get userData(): any {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem('user_data');
    }
  }

  get currentUsr() {
    if (isPlatformBrowser(this.platformId)) {
      return JSON.parse(this.userData);
    }
  }


  /**
   * AUTH REFRESH TOKEN METHODS
   */
  public sendRefreshToken(): Observable<any> {
    throw new Error('Method not implemented.');
  }

  public refreshSocialsToken(usrOrigin: string): Observable<any> {
    if (usrOrigin === 'GITHUB') {
      return this.http.get<any>(`https://github.com/login/oauth/authorize?client_id=${environment.GITHUB_CLIENT_ID}&redirect_uri=${environment.gitHubRedirectURL}&scope=user:email`)
    } else
      return this.http.get<any>(`https://stackoverflow.com/oauth/dialog?client_id=${environment.STACK_OVERFLOW_CLIENT_ID}&redirect_uri=${environment.stackOverflowRedirectURL}&scope=no_expiry`)
  }
  /** */


  public login(credentials: FormData): Observable<any> {
    return this.http.post<any>(`${this.apiServerUrl}/auth`, credentials, {
      observe: 'response'
    }).pipe(
      tap((response: any) => {
        this.handleJWTauth(response, 'Bearer');
      }),
      shareReplay()
    );
  }

  public signup(credentials: FormData): Observable<User> {
    return this.http.post<User>(`${this.apiServerUrl}/user`, credentials, {
      observe: 'response'
    }).pipe(
      tap((response: any) => {
        this.handleJWTauth(response, 'Bearer');
      }),
      shareReplay()
    )
  }

  public logout() {
    this.subject.next(null!);
    localStorage.clear();
  }

  public requestPasswordReset(email: string): Observable<any> {
    return this.http.get<any>(`${this.apiServerUrl}/user/initPasswordReset?email=${email}`, {
      responseType: 'text' as 'json'
    })
  }

  public verifyTokenForPasswordReset(token: string): Observable<any> {
    return this.http.get<any>(`${this.apiServerUrl}/user/verifyTokenForPasswordReset?token=${token}`)
  }

  public savePasswordReset(values: FormData): Observable<any> {
    return this.http.post<any>(`${this.apiServerUrl}/user/savePasswordReset`, values, {
      responseType: 'text' as 'json'
    })
  }

  public registrationConfirm(token: string): Observable<any> {
    return this.http.get<any>(`${this.apiServerUrl}/user/registrationConfirm?token=${token}`, {
      responseType: 'text' as 'json'
    })
  }

  public resendUserConfirm(email: string): Observable<any> {
    return this.http.get<any>(`${this.apiServerUrl}/user/resendRegistrationConfirm?email=${email}`, {
      responseType: 'text' as 'json'
    })
  }

  public getGithubAccessTokenFromCode(code: string): Observable<any> {
    return this.http.post<any>(`${this.apiServerUrl}/user/github/accessToken?code=${code}`, {}, {
      observe: 'response'
    }).pipe(
      tap((response: any) => {
        this.handleJWTauth(response, 'token');
      }),
      shareReplay()
    )
  }

  public SOLogin(token: string) {
    this.getUser(token, 'stack')
      .subscribe({
        next: usr => {
          this.subject.next(usr);
          localStorage.setItem(this.TOKEN_NAME, token);
          localStorage.setItem('user_data', JSON.stringify(usr));

          if (this.redirectURL) {
            this.router.navigateByUrl(this.redirectURL,)
              .catch(() => this.router.navigate(['/']))
          } else {
            this.router.navigate(['/'])
          }
        }
      })
  }

  private handleJWTauth(response: any, tokenType: string) {
    const { refreshToken, accessToken } = response.body

    this.getUser(accessToken, tokenType)
      .subscribe({
        next: usr => {
          this.subject.next(usr);
          localStorage.setItem(this.TOKEN_NAME, accessToken);
          if (refreshToken) localStorage.setItem(this.REFRESH_TOKEN_NAME, refreshToken);
          localStorage.setItem('user_data', JSON.stringify(usr));

          if (this.redirectURL) {
            this.router.navigateByUrl(this.redirectURL,)
              .catch(() => this.router.navigate(['/']))
          } else {
            this.router.navigate(['/'])
          }
        }
      })
  }

  private getUser(accessToken: string, tokenType: string): Observable<User> {
    httpOptions.headers = httpOptions.headers.set('Authorization', `${tokenType} ${accessToken}`);

    return this.http.get<User>(`${this.apiServerUrl}/user`, httpOptions).pipe(
      shareReplay()
    )
  }

  private extractTokenFromHeaders(response: any) {
    return response.headers.get('authorization').split(' ')[1]
  }

  private getTokenName(tokenValue: string): string {
    let name = '';
    if (isPlatformBrowser(this.platformId)) {
      for (var i = 0, len = localStorage.length; i < len; i++) {
        const key = localStorage.key(i)!;
        const value = localStorage[key];
        if (value === tokenValue) name = key;
      }
    }
    return name
  }
}


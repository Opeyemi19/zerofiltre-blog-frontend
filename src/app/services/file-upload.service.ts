import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { BehaviorSubject, catchError, Observable, shareReplay, tap, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { makeStateKey, TransferState } from '@angular/platform-browser';
import { MessageService } from './message.service';


const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json',
    'X-Container-Meta-Access-Control-Allow-Origin': '*'
  }),
};

const STATE_KEY_X_TOKEN = makeStateKey('x-token-value');

@Injectable({
  providedIn: 'root'
})
export class FileUploadService {
  readonly apiServerUrl = environment.apiBaseUrl;
  readonly ovhServerUrl = environment.ovhServerUrl;
  readonly ovhTokenUrl = environment.ovhTokenUrl;
  private XTOKEN_NAME = 'x_token';

  private subject = new BehaviorSubject<any>(null!);
  public xToken$ = this.subject.asObservable();

  public xTokenServerValue!: any;

  constructor(
    private state: TransferState,
    private http: HttpClient,
    private messageService: MessageService,
    @Inject(PLATFORM_ID) private platformId: any
  ) {
    this.loadxToken();
  }

  private loadxToken() {

    const body = {
      "auth": {
        "identity": {
          "methods": [
            "password"
          ],
          "password": {
            "user": {
              "name": environment.ovhAuthName,
              "domain": {
                "id": "default"
              },
              "password": environment.ovhAuthPassword
            }
          }
        }
      }
    }

    this.xTokenServerValue = this.state.get(STATE_KEY_X_TOKEN, <any>null);

    if (this.xTokenServerValue && isPlatformBrowser(this.platformId)) {
      // console.log('XTOKEN VALUE IN THE CLIENT: ', this.xTokenServerValue);
      this.subject.next(this.xTokenServerValue);
      localStorage.setItem(this.XTOKEN_NAME, JSON.stringify(this.xTokenServerValue));
    }

    if (!this.xTokenServerValue) {
      this.xToken$ = this.http.post<any>(`${this.ovhTokenUrl}`, body, {
        ...httpOptions,
        observe: 'response'
      })
        .pipe(
          catchError(error => {
            return throwError(() => error);
          }),
          tap(response => {
            const xToken = this.extractTokenFromHeaders(response);
            const expireAt = response.body.token.expires_at;
            const tokenObj = {
              xToken,
              expireAt
            }
            // console.log('XTOKEN VALUE IN THE SERVER: ', tokenObj);
            this.state.set(STATE_KEY_X_TOKEN, <any>tokenObj);
            this.subject.next(tokenObj);
          }),
          shareReplay()
        )
    }
  }

  private extractTokenFromHeaders(response: any) {
    return response.headers.get('X-Subject-Token');
  }

  get xTokenData(): any {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem(this.XTOKEN_NAME);
    }
  }

  get xTokenObj(): any {
    if (isPlatformBrowser(this.platformId)) {
      return JSON.parse(this.xTokenData);
    }
  }

  public validateFile(file: File): boolean {
    let isValid = false;
    const maxSize = 5;

    const sizeUnit = 1024 * 1024;
    const fileSize = Math.round(file.size / sizeUnit);
    const fileType = file.type.split('/')[0]

    if (fileSize > maxSize) {
      isValid = false
      this.messageService.fileSizeWarning(maxSize);
    } else if (fileType !== 'image') {
      isValid = false
      this.messageService.fileTypeWarning();
    } else {
      isValid = true;
    }

    return isValid;
  }

  public uploadImage(fileName: string, file: File): Observable<any> {
    //TODO: validate file here instead of inside the component
    const xToken = this.xTokenObj?.xToken || 'my-x-token';

    httpOptions.headers = httpOptions.headers
      .set('Content-Type', 'image/png')
      .set('X-Auth-Token', xToken)

    return this.http.put<string>(`${this.ovhServerUrl}/${fileName}`, file, {
      ...httpOptions,
      reportProgress: true,
      observe: 'events'
    })
      .pipe(
        catchError((error: HttpErrorResponse) => {
          this.handleError(error);
          return throwError(() => error)
        })
      )
  }

  public removeImage(fileName: string): Observable<any> {
    const xToken = this.xTokenObj?.xToken || 'my-x-token';

    httpOptions.headers = httpOptions.headers
      .set('Content-Type', 'image/png')
      .set('X-Auth-Token', xToken)

    return this.http.delete<any>(`${this.ovhServerUrl}/${fileName}`, httpOptions)
      .pipe(
        catchError((error: HttpErrorResponse) => {
          this.handleError(error);
          return throwError(() => error)
        })
      )
  }

  public handleError(error: HttpErrorResponse) {
    if (error.status === 0) {
      this.messageService.fileUploadAuthError();
    }
  }
}

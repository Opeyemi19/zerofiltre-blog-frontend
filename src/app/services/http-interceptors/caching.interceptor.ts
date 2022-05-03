import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpResponse
} from '@angular/common/http';
import { Observable, of, tap } from 'rxjs';
import { RequestCacheService } from '../request-cache.service';

const TIME_T0_LIVE = 1000;

@Injectable()
export class CachingInterceptor implements HttpInterceptor {
  constructor(private cache: RequestCacheService) { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    console.log('REQ: ', req)
    if (req.method !== 'GET') {
      return next.handle(req);
    }

    if (req.headers.get('x-refresh')) {
      console.log('UPDATING CACHE...!');
      return this.sendRequest(req, next);
    }

    const cachedResponse = this.cache.get(req.url);
    console.log('CACHED: ', cachedResponse)
    return cachedResponse ? of(cachedResponse) : this.sendRequest(req, next);
  }

  sendRequest(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      tap((event) => {
        if (event instanceof HttpResponse) {
          this.cache.set(req.url, event, TIME_T0_LIVE);
        }
      })
    );
  }
}
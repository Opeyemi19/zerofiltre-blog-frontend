import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Component, OnInit } from '@angular/core';
import { map, Observable, shareReplay } from 'rxjs';
import { AuthService } from './user/auth.service';

// import * as Prism from 'prismjs';

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

  constructor(private breakpointObserver: BreakpointObserver, public authService: AuthService) { }

  public logout() {
    this.authService.logout();
    location.reload();
  }

  ngOnInit(): void {
    Prism.plugins.toolbar.registerButton('select-code', function (env: any) {
      const button = document.createElement('button');

      button.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
      <path stroke-linecap="round" stroke-linejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>`;

      button.addEventListener('click', function () {
        if ((document as any).body.createTextRange) { // ms
          const range = (document as any).body.createTextRange();
          range.moveToElementText(env.element);
          range.select();
        } else if (window.getSelection) { // moz, opera, webkit
          const selection = window.getSelection()!;
          const range = (document as any).createRange();
          range.selectNodeContents(env.element);
          selection.removeAllRanges();
          selection.addRange(range);
        }
      });

      return button;
    });
  }
}

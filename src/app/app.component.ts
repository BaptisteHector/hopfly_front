import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { AuthenticationService } from './services';
import { User } from './models';

import './content/app.less';

@Component({ selector: 'app-root', 
            styleUrls: ['./app.component.css'],
            templateUrl: 'app.component.html' })
export class AppComponent {
    currentUser: User;

    constructor(
        private router: Router,
        private authenticationService: AuthenticationService
    ) {
        this.authenticationService.currentUser.subscribe(x => this.currentUser = x);
    }

    logout() {
        this.authenticationService.logout();
        this.router.navigate(['/login']);
    }
}
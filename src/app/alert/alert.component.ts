import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';

import { AlertService } from '../services';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
    selector: 'alert',
    templateUrl: 'alert.component.html'
})

export class AlertComponent implements OnInit, OnDestroy {
    private subscription: Subscription;
    message: any;

    constructor(private alertService: AlertService,
        private _snackBar: MatSnackBar) { }

    ngOnInit() {
        this.subscription = this.alertService.getMessage().subscribe(message => {
            if (message) {
            this.message = message.text;
            this._snackBar.open(message.text, message.type, {duration: 1000});
            }
        });
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }
}
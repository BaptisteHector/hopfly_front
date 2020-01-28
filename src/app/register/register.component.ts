import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';

import { AlertService, UserService, AuthenticationService } from '../services';
import { User } from '../models';

@Component({ templateUrl: 'register.component.html' })
export class RegisterComponent implements OnInit {
    registerForm: FormGroup;
    loading = false;
    submitted = false;

    constructor(
        private formBuilder: FormBuilder,
        private router: Router,
        private authenticationService: AuthenticationService,
        private userService: UserService,
        private alertService: AlertService
    ) {
        // redirect to home if already logged in
        if (this.authenticationService.currentUserValue) {
            this.router.navigate(['/']);
        }
    }

    ngOnInit() {
        this.registerForm = this.formBuilder.group({
            firstName: ['', Validators.required],
            lastName: ['', Validators.required],
            username: ['', Validators.required],
            password: ['', Validators.required]
        });
    }

    // convenience getter for easy access to form fields
    get f() { return this.registerForm.controls; }

    onSubmit() {
        this.submitted = true;

        // reset alerts on submit
        this.alertService.clear();

        // stop here if form is invalid
        if (this.registerForm.invalid) {
            return;
        }

        this.loading = true;
        let user = new User()
        user = this.registerForm.value
        console.log(user)
        //user.firstName = this.registerForm.controls.firstname.value
        //user.lastName = this.registerForm.controls.lastname.value
        //user.password = this.registerForm.controls.password.value
        //user.username = this.registerForm.controls.username.value
        this.add(user)
    }

    add(name: User): void {
        if (!name) { return; }
        this.userService.addUser(this.registerForm.value)
        .subscribe(
        data => {
            this.alertService.success('Registration successful', true);
            this.router.navigate(['/login']);
        },
        error => {
            this.alertService.error(error);
            this.loading = false;
        });
      }
}
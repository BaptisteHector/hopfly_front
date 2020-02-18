import { Component, OnInit, Inject } from '@angular/core';
import { User, Contact } from '../models';
import { AuthenticationService, UserService, AlertService } from '../services';
import { FormGroup, FormBuilder } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  currentUser: User;

  constructor(
    private authenticationService: AuthenticationService,
    private userService: UserService
  ) {
    this.currentUser = this.authenticationService.currentUserValue;
  }

  ngOnInit() {
  }

}

@Component({
  templateUrl: 'contact-dialog.html',
  styleUrls: ['./profile.component.css'],
})
export class ContactDialog {
  currentUser: User
  contactForm: FormGroup;

  constructor(
      private authenticationService: AuthenticationService,
      private formBuilder: FormBuilder,
      private userService: UserService,
      private alertService: AlertService,
      public dialogRef: MatDialogRef<ContactDialog>,
      @Inject(MAT_DIALOG_DATA) public data: Contact)
      {
          this.currentUser = this.authenticationService.currentUserValue;
          
          this.contactForm = this.formBuilder.group({
              firstname: '',
              lastname: '',
              email: '',
              phone: '',
          });
      }

  
  onNoClick(): void {
    this.dialogRef.close();
  }

  ngOnInit() {
  }

  public onSubmit() {
      if (this.contactForm.invalid) {
          return;
      }
      let contact = new Contact()
      contact.firstname = this.contactForm.controls.firstname.value
      contact.lastname = this.contactForm.controls.lastname.value;
      contact.email = this.contactForm.controls.email.value;
      contact.phone = this.contactForm.controls.phone.value;
      if (!contact) { return; }      
      this.userService.addContact(contact)
      .subscribe(
      data => {
          this.alertService.success('Contact created', true);
          this.dialogRef.close();
      },
      error => {
          this.alertService.error(error);
      });
    }

}

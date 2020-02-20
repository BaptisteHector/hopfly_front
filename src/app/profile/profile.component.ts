import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { User, Contact } from '../models';
import { AuthenticationService, UserService, AlertService, ContactService } from '../services';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialog } from '@angular/material/dialog';
import { ReplaySubject, Subscription, Subject } from 'rxjs';
import { takeUntil, first, take } from 'rxjs/operators';
import { MatSelect } from '@angular/material/select';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  currentUser: User;
  friends: User[] = [];
  contacts: Contact[] = [];

  constructor(
    private authenticationService: AuthenticationService,
    private userService: UserService,
    public dialog: MatDialog,
  ) {
    this.currentUser = this.authenticationService.currentUserValue;
  }

  ngOnInit() {
    this.loadFriends();
    this.loadContacts()
  }

  loadFriends() {
    if (this.currentUser.friend_id === null)
            return;
        this.userService.getUserFriends(this.currentUser.friend_id)
            .pipe()
            .subscribe(friends => {
                this.friends = friends
            });
  }

  loadContacts() {
    if (this.currentUser.contact_id === null)
            return;
        this.userService.getUserContacts(this.currentUser.contact_id)
            .pipe()
            .subscribe(contacts => {
                this.contacts = contacts
            });    
  }

  onClickCreateFriend() {
    const dialogRef = this.dialog.open(FriendDialog, {
      width: '20%'
    });

    dialogRef.afterClosed().subscribe(result => {
      let ret: User[] = result;
      if (result)
      {
        ret.forEach(user => {
          this.friends.push(user);
        })
      }
    });
  }

  onClickCreateContact() {
    const dialogRef = this.dialog.open(ContactDialog, {
      width: '20%'
    });

    dialogRef.afterClosed().subscribe(result => {
      let ret: Contact = result;
      if (result)
      {
          this.contacts.push(ret);
      }
    });
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
      private contactService: ContactService,
      private alertService: AlertService,
      public dialogRef: MatDialogRef<ContactDialog>,
      @Inject(MAT_DIALOG_DATA) public data: Contact)
      {
          this.currentUser = this.authenticationService.currentUserValue;
          
          this.contactForm = this.formBuilder.group({
              firstname: ['', Validators.required],
              lastname: ['', Validators.required],
              email: ['', Validators.email],
              phone: '',
          });
      }

  
  onNoClick(): void {
    this.dialogRef.close();
  }

  ngOnInit() {
    console.log(this.currentUser.pic)
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
      this.contactService.addContact(contact)
      .subscribe(
      data => {
          this.alertService.success('Contact created', true);
          if (this.currentUser.contact_id == null)
            this.currentUser.contact_id = data.id + ','
          else
            this.currentUser.contact_id += data.id + ','
          this.userService.updateUser(this.currentUser, this.currentUser.id)
          .subscribe(
            data => {
                this.alertService.success('Contact created', true);
            },
            error => {
                this.alertService.error(error);
            });
            this.dialogRef.close(data);
          },
      error => {
          this.alertService.error(error);
      });
    }

}

@Component({
  templateUrl: 'friend-dialog.html',
  styleUrls: ['./profile.component.css'],
})
export class FriendDialog {
  currentUser: User
  friendForm: FormGroup;
  public filteredUsersMulti: ReplaySubject<User[]> = new ReplaySubject<User[]>(1);
  tmpUsers = new Array();
  protected _onDestroy = new Subject<void>();
  private inputWatcher: Subscription;

  @ViewChild('singleSelect', { static: true }) singleSelect: MatSelect;
  @ViewChild('multiSelect', { static: true }) multiSelect: MatSelect;
  constructor(
      private authenticationService: AuthenticationService,
      private formBuilder: FormBuilder,
      private userService: UserService,
      private alertService: AlertService,
      public dialogRef: MatDialogRef<FriendDialog>,
      @Inject(MAT_DIALOG_DATA) public data: User)
      {
          this.currentUser = this.authenticationService.currentUserValue;          
          this.friendForm = this.formBuilder.group({
            users: [],
            userMultiFilterCtrl: '',
          });
      }

  
  onNoClick(): void {
    this.dialogRef.close();
  }

  ngOnInit() {
    this.loadAllUsers()
  }

  ngOnDestroy() {
    if (this.inputWatcher) {
        this.inputWatcher.unsubscribe();
    }
    this._onDestroy.next();
    this._onDestroy.complete();
}

private loadAllUsers() {
  this.userService.getUsers()
      .pipe(first())
      .subscribe(users => {
          this.tmpUsers = users
          this.tmpUsers = users.filter(user => user.id != this.currentUser.id)
          console.log(this.tmpUsers);
          this.filteredUsersMulti.next(this.tmpUsers.slice());
      });
}

protected setInitialValue() {
  this.filteredUsersMulti
    .pipe(take(1), takeUntil(this._onDestroy))
    .subscribe(() => {
      this.multiSelect.compareWith = (a: User, b: User) => a && b && a.id === b.id;
    });
}

protected filterUsersMulti() {

  // get the search keyword
  let search = this.friendForm.controls.userMultiFilterCtrl.value;
  if (!search) {
    this.filteredUsersMulti.next(this.tmpUsers.slice());
    return;
  } else {
    search = search.toLowerCase();
  }
  // filter the banks
  this.filteredUsersMulti.next(
    this.tmpUsers.filter(user => user.username.toLowerCase().indexOf(search) > -1)
  );
}

  ngAfterViewInit() {
    this.friendForm.controls.userMultiFilterCtrl.valueChanges
        .pipe(takeUntil(this._onDestroy))
        .subscribe(() => {
            this.filterUsersMulti();
        });
  }

  public onSubmit() {
    let user_id: string = '';
        let users: User[] = this.friendForm.controls.users.value;
        if (users){
        users.forEach(element => {
            user_id += element.id.toString() + ',';
        });
        }
        this.currentUser.friend_id = user_id
        this.userService.updateUser(this.currentUser, this.currentUser.id)
        .subscribe (
          data => {
            this.alertService.success('Friend added', true);
            this.dialogRef.close(users);
          },
          error => {
            this.alertService.error(error);
        }
        )
    }

}

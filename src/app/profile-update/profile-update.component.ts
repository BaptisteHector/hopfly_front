import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { User } from '../models';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AuthenticationService, UserService, AlertService } from '../services';
import {Location} from '@angular/common';
import { Router } from '@angular/router';


@Component({
  selector: 'app-profile-update',
  templateUrl: './profile-update.component.html',
  styleUrls: ['./profile-update.component.css']
})
export class ProfileUpdateComponent implements OnInit {
  currentUser: User
  my_preview_img: '';
  profileForm: FormGroup;
  file: File;

  @ViewChild('fileInput') fileInput: ElementRef;
  constructor(
    private authenticationService: AuthenticationService,
    private formBuilder: FormBuilder,
    private userService: UserService,
    private alertService: AlertService,
    private _location: Location,
    private router: Router,
  ) {
    this.currentUser = this.authenticationService.currentUserValue;
            
            this.profileForm = this.formBuilder.group({
                username: [this.currentUser.username, Validators.required],
                password: '',
                email: [this.currentUser.email, Validators.required],
                selected_img: this.currentUser.pic,
            });
  }

  ngOnInit() {
  }

  onClickCancel() {
    this._location.back();
  }

  resetPicture() {
    console.log(this.my_preview_img)
    this.profileForm.controls.selected_img.setValue(null);
    this.my_preview_img = null;
    this.fileInput.nativeElement.value = '';
    this.fileInput.nativeElement.classList.remove('active');
}

selectFile(): void {
  this.fileInput.nativeElement.click();
}

handleFileInput(files: FileList) {
  console.log(files.item(0))
  this.profileForm.controls.pic.setValue(files.item(0));
}

onSelectFile(event) {
  console.log(event.target.result)
  if(event.target.files && event.target.files.length > 0) {
    this.file = event.target.files[0];
    this.profileForm.get('filename').setValue(this.file.name);
  }
}

  readURL(event: any) {
    this.my_preview_img = null;
    const file: File = event.target.files[0];
    const myReader: FileReader = new FileReader();
    myReader.onloadend = (loadEvent: any) => {
        console.log(loadEvent.target.result)
        this.my_preview_img = loadEvent.target.result;
    };

    myReader.readAsDataURL(file);
}

  public onSubmit() {
    if (this.my_preview_img)
      this.currentUser.pic = this.my_preview_img
    else
    this.currentUser.pic = this.currentUser.pic
    this.currentUser.id = this.currentUser.id
    this.currentUser.username = this.profileForm.controls.username.value;
    this.currentUser.email = this.profileForm.controls.email.value;
    this.currentUser.contact_id = this.currentUser.contact_id
    this.currentUser.trip_id = this.currentUser.trip_id
    this.currentUser.friend_id = this.currentUser.friend_id
    if (this.profileForm.controls.password.value != '')
    this.currentUser.password = this.profileForm.controls.password.value;
    else
    this.currentUser.password = this.currentUser.password    
    this.userService.updateUser(this.currentUser, this.currentUser.id)
    .subscribe(
    data => {
      this.authenticationService.update()
        this.alertService.success('User Updated', true);
        this._location.back();
    },
    error => {
        this.alertService.error(error);
    });
  }
}

import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { User, MBReply, MBFeature, Trip } from '../models';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ReplaySubject, Subject, Subscription } from 'rxjs';
import { MatSelect } from '@angular/material/select';
import { AuthenticationService, UserService, AlertService, TripService, MapBoxService } from '../services';
import { takeUntil, first, take } from 'rxjs/operators';
import {Location} from '@angular/common';
import { ActivatedRoute } from '@angular/router';


@Component({
  selector: 'app-update-trip',
  templateUrl: './update-trip.component.html',
  styleUrls: ['./update-trip.component.css']
})
export class UpdateTripComponent implements OnInit {

  currentUser: User
    searchText = '';
    my_preview_img: '';
    places = new MBReply<MBFeature>();
    tmpUsers = new Array();
    tripUpdateForm: FormGroup;
    currentPlace: MBFeature;
    file: File;
    trip: Trip;
    guest: User[] = [];
    public filteredUsersMulti: ReplaySubject<User[]> = new ReplaySubject<User[]>(1);
    protected _onDestroy = new Subject<void>();
    private searchPlaceSub: Subscription;
    private inputWatcher: Subscription;

    @ViewChild('placeInputSearch', { static: false }) placeInputSearch;
    @ViewChild('singleSelect', { static: true }) singleSelect: MatSelect;
    @ViewChild('multiSelect', { static: true }) multiSelect: MatSelect;
    @ViewChild('fileInput') fileInput: ElementRef;
    constructor(
        private authenticationService: AuthenticationService,
        private formBuilder: FormBuilder,
        private userService: UserService,
        private route: ActivatedRoute,
        private alertService: AlertService,
        private tripService: TripService,
        private _location: Location,
        private mapBoxService: MapBoxService)
        {
            this.currentUser = this.authenticationService.currentUserValue;            
            this.tripUpdateForm = this.formBuilder.group({
                name: ['', Validators.required],
                begin_date: ['', Validators.required],
                end_date: ['', Validators.required],
                description: ['', Validators.required],
                userMultiFilterCtrl: '',
                location: ['', Validators.required],
                filterlocation: '',
                selected_img: '',
                users: []
            });
        }
    
    placeClick(feature) {
        this.currentPlace = feature;
    }

    onClickCancel() {
      this._location.back();
    }

    resetPicture() {
        console.log(this.my_preview_img)
        this.tripUpdateForm.controls.selected_img.setValue(null);
        this.my_preview_img = null;
        this.fileInput.nativeElement.value = '';
        this.fileInput.nativeElement.classList.remove('active');
    }

    selectFile(): void {
        this.fileInput.nativeElement.click();
    }

    handleFileInput(files: FileList) {
        console.log(files.item(0))
        this.tripUpdateForm.controls.pic.setValue(files.item(0));
    }

    onSelectFile(event) {
        console.log(event.target.result)
        if(event.target.files && event.target.files.length > 0) {
          this.file = event.target.files[0];
          this.tripUpdateForm.get('filename').setValue(this.file.name);
        }
      }

    doSearch() {
        if (!!this.searchPlaceSub) {
            this.searchPlaceSub.unsubscribe();
        }
        this.searchPlaceSub = this.mapBoxService.geocoding(this.tripUpdateForm.controls.filterlocation.value).subscribe(
            (result) => {
                this.places = result;
            },
            () => {
            }
        );
    }    

    ngOnInit() {
        this.loadTrip();
        this.loadAllUsers();
    }

    public loadTrip() {
      const id = +this.route.snapshot.paramMap.get('id');
      this.tripService.getTrip(id)
      .subscribe(trip => {this.trip = trip
        this.loadUsers();
        this.tripUpdateForm.controls.name.setValue(trip.name)
        this.tripUpdateForm.controls.begin_date.setValue(trip.begin_date)
        this.tripUpdateForm.controls.description.setValue(trip.description)
        this.tripUpdateForm.controls.end_date.setValue(trip.end_date)
        this.tripUpdateForm.controls.selected_img.setValue(trip.pic)
      });
    }
  
    public loadUsers() {
      this.tripService.getTripUsers(this.trip.user_id)
      .pipe(first())
      .subscribe(users => {
          this.guest = users
      });
    }

    ngAfterViewInit() {
        console.log(this.tmpUsers);
        this.tripUpdateForm.controls.userMultiFilterCtrl.valueChanges
        .pipe(takeUntil(this._onDestroy))
        .subscribe(() => {
            this.filterUsersMulti();
        });
        this.tripUpdateForm.controls.filterlocation.valueChanges
        .pipe(takeUntil(this._onDestroy))
        .subscribe(() => {
            this.doSearch();
        });
        this.setInitialValue();
      }

    ngOnDestroy() {
        if (this.searchPlaceSub) {
            this.searchPlaceSub.unsubscribe();
        }
        if (this.inputWatcher) {
            this.inputWatcher.unsubscribe();
        }
        this._onDestroy.next();
        this._onDestroy.complete();
    }

    readURL(event: any) {
        const file: File = event.target.files[0];
        const myReader: FileReader = new FileReader();
        myReader.onloadend = (loadEvent: any) => {
            console.log(loadEvent.target.result)
            this.my_preview_img = loadEvent.target.result;
        };

        myReader.readAsDataURL(file);
    }

    public onSubmit() {
      console.log(this.my_preview_img)
        if (this.my_preview_img)
          this.trip.pic = this.my_preview_img
        else
          this.trip.pic = this.trip.pic
        this.trip.name = this.tripUpdateForm.controls.name.value;
        this.trip.begin_date = this.tripUpdateForm.controls.begin_date.value;
        this.trip.end_date = this.tripUpdateForm.controls.end_date.value;
        this.trip.description = this.tripUpdateForm.controls.description.value;
        this.trip.location = this.trip.location
        let user_id: string = this.currentUser.id.toString() + ',';
        let users: User[] = this.tripUpdateForm.controls.users.value;
        if (users){
        users.forEach(element => {
            user_id += element.id.toString() + ',';
        });
        }
        this.trip.user_id = user_id;
        
        this.tripService.updateTrip(this.trip)
        .subscribe(
        data => {
            this.alertService.success('Trip updated', true);
            this._location.back();
        },
        error => {
            this.alertService.error(error);
        });

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
        //console.log(this.tmpUsers);
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
        let search = this.tripUpdateForm.controls.userMultiFilterCtrl.value;
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
  

}

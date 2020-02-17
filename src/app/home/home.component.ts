import { Component, OnInit, Inject, ViewChild, ElementRef } from '@angular/core';
import { first, takeUntil, take } from 'rxjs/operators';

import { User, Trip } from '../models';
import { MapBoxService, UserService, AuthenticationService, TripService, AlertService } from '../services';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSelect } from '@angular/material/select';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ReplaySubject, Subject, Subscription } from 'rxjs';
import { MBFeature, MBReply } from '../models/mapbox';
import { fadeAnimation } from '../utils/animation';


@Component({ templateUrl: 'home.component.html',
            styleUrls: ['./home.component.css'],
            animations: [fadeAnimation] })
export class HomeComponent implements OnInit {
    currentUser: User;
    trips: Trip[];

    constructor(
        private authenticationService: AuthenticationService,
        private userService: UserService,
        public dialog: MatDialog
    ) {
        this.currentUser = this.authenticationService.currentUserValue;
    }

    openDialog(): void {
        const dialogRef = this.dialog.open(TripDialog, {
          width: '70%'
        });
    
        dialogRef.afterClosed().subscribe(result => {
          this.loadAllTrip()
        });
      }

    ngOnInit() {
        this.loadAllTrip();
    }

    public loadAllTrip() {
        console.log(this.currentUser.trip_id)
        if (this.currentUser.trip_id === null)
            return;
        this.userService.getUserTrips(this.currentUser.trip_id)
            .pipe()
            .subscribe(trips => {
                console.log(trips)
                this.trips = trips
            });
    }

}

@Component({
    templateUrl: 'trip-dialog.html',
    styleUrls: ['./home.component.css'],
  })
export class TripDialog {
    currentUser: User
    searchText = '';
    my_preview_img: '';
    places = new MBReply<MBFeature>();
    tmpUsers = new Array();
    tripForm: FormGroup;
    currentPlace: MBFeature;
    file: File;
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
        private alertService: AlertService,
        public dialogRef: MatDialogRef<TripDialog>,
        private tripService: TripService,
        private mapBoxService: MapBoxService,
        @Inject(MAT_DIALOG_DATA) public data: Trip)
        {
            this.currentUser = this.authenticationService.currentUserValue;
            
            this.tripForm = this.formBuilder.group({
                name: '',
                begin_date: '',
                end_date: '',
                description: '',
                userMultiFilterCtrl: '',
                location: '',
                filterlocation: '',
                selected_img: '',
                users: []
            });
        }
    
    placeClick(feature) {
        this.currentPlace = feature;
    }

    resetPicture() {
        console.log(this.my_preview_img)
        this.tripForm.controls.selected_img.setValue(null);
        this.my_preview_img = null;
        this.fileInput.nativeElement.value = '';
        this.fileInput.nativeElement.classList.remove('active');
    }

    selectFile(): void {
        this.fileInput.nativeElement.click();
    }

    handleFileInput(files: FileList) {
        console.log(files.item(0))
        this.tripForm.controls.pic.setValue(files.item(0));
    }

    onSelectFile(event) {
        console.log(event.target.result)
        if(event.target.files && event.target.files.length > 0) {
          this.file = event.target.files[0];
          this.tripForm.get('filename').setValue(this.file.name);
        }
      }

    doSearch() {
        if (!!this.searchPlaceSub) {
            this.searchPlaceSub.unsubscribe();
        }
        this.searchPlaceSub = this.mapBoxService.geocoding(this.tripForm.controls.filterlocation.value).subscribe(
            (result) => {
                this.places = result;
            },
            () => {
            }
        );
    }    
    
    onNoClick(): void {
      this.dialogRef.close();
    }

    ngOnInit() {
        this.loadAllUsers();
    }

    ngAfterViewInit() {
        console.log(this.tmpUsers);
        this.tripForm.controls.userMultiFilterCtrl.valueChanges
        .pipe(takeUntil(this._onDestroy))
        .subscribe(() => {
            this.filterUsersMulti();
        });
        this.tripForm.controls.filterlocation.valueChanges
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
        if (this.tripForm.invalid) {
            return;
        }
        let trip = new Trip()
        trip.pic = this.my_preview_img
        trip.name = this.tripForm.controls.name.value;
        trip.begin_date = this.tripForm.controls.begin_date.value;
        trip.end_date = this.tripForm.controls.end_date.value;
        trip.description = this.tripForm.controls.description.value;
        trip.location = this.currentPlace.center[0] + ',' + this.currentPlace.center[1];
        if (!trip) { return; }
        let user_id: string = this.currentUser.id.toString() + ',';
        let users: User[] = this.tripForm.controls.users.value;
        if (users){
        users.forEach(element => {
            user_id += element.id.toString() + ',';
        });
        }
        trip.user_id = user_id;
        console.log(trip.user_id);
        
        this.tripService.addTrip(trip)
        .subscribe(
        data => {
            this.alertService.success('Trip created', true);
            this.dialogRef.close();
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
        let search = this.tripForm.controls.userMultiFilterCtrl.value;
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
import { Component, OnInit, Input, ViewChild, Inject } from '@angular/core';
import { Trip, User, Activity, Plan, Logement, MBReply, MBFeature } from '../models';
import { FormGroup, FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TripService, PlanService, ActivityService, AuthenticationService, AlertService, MapBoxService, LogementService } from '../services';
import { MatDialog, MatSelect, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { ActivityDialog } from '../plan';
import { first, takeUntil } from 'rxjs/operators';
import { Subject, Subscription } from 'rxjs';

@Component({
  selector: 'app-logement',
  templateUrl: './logement.component.html',
  styleUrls: ['./logement.component.css']
})
export class LogementComponent implements OnInit {

  @Input() trip: Trip;
  currentUser: User;
  planActivities: Activity[] = [];
  activities: Activity[];
  logements: Logement[];


  constructor(private route: ActivatedRoute,
    private tripService: TripService,
    private authenticationService: AuthenticationService,
    public dialog: MatDialog,
    private router: Router
    ) {
      this.currentUser = this.authenticationService.currentUserValue;
  }

  ngOnInit() {
    this.loadTrip();
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(LogementDialog, {
      width: '250px'
    });

    dialogRef.afterClosed().subscribe(result => {
      let ret: Activity = result;
      if (result)
        this.planActivities.push(ret);
    });
  }

  // Service call

  public loadTrip() {
    const id = +this.route.snapshot.paramMap.get('id');
    this.tripService.getTrip(id)
    .subscribe(trip =>{ this.trip = trip
      this.loadLogements()}
      );
  }

  public loadLogements() {
    this.tripService.getTripLogements(this.trip.logement_id)
    .pipe(first())
    .subscribe(logements => {
        this.logements = logements
    });
  }
}

@Component({
  templateUrl: 'logement-dialog.html',
})
export class LogementDialog {
  currentUser: User
  searchText = '';
  places = new MBReply<MBFeature>();
  logementForm: FormGroup;
  locPlace: MBFeature;
  logement = new Logement();
  protected _onDestroy = new Subject<void>();
  private searchPlaceSub: Subscription;
  private inputWatcher: Subscription;    

  @ViewChild('placeInputSearch') placeInputSearch;
  @ViewChild('singleSelect', { static: true }) singleSelect: MatSelect;
  @ViewChild('multiSelect', { static: true }) multiSelect: MatSelect;
  constructor(
      private authenticationService: AuthenticationService,
      private formBuilder: FormBuilder,
      private alertService: AlertService,
      private logementService: LogementService,
      public dialogRef: MatDialogRef<ActivityDialog>,
      private mapBoxService: MapBoxService,
      @Inject(MAT_DIALOG_DATA) public data: Trip)
      {
          this.currentUser = this.authenticationService.currentUserValue;
          
          this.logementForm = this.formBuilder.group({
              location: '',
              adress: '',
              start_date: '',
              end_date: '',
              phone: '',
              name: '',
              filterlocation: ''
          });
      }
  
  placeClick(feature) {
      this.locPlace = feature;
  }

  doSearch() {
      if (!!this.searchPlaceSub) {
          this.searchPlaceSub.unsubscribe();
      }
      this.searchPlaceSub = this.mapBoxService.geocoding(this.logementForm.controls.filterlocation.value).subscribe(
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
  }

  ngAfterViewInit() {
      this.logementForm.controls.filterlocation.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
          this.doSearch();
      });
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

  public onSubmit() {
      if (this.logementForm.invalid) {
          return;
      }
      this.logement.start_date = this.logementForm.controls.dep_date.value;
      this.logement.end_date = this.logementForm.controls.arr_date.value;
      this.logement.adress = this.logementForm.controls.adress.value;
      this.logement.location = this.locPlace.center[0] + ',' + this.locPlace.center[1];
      this.logement.phone = this.logementForm.controls.phone.value;
      this.logement.name = this.logementForm.controls.name.value;
      if (!this.logement) { return; }
      this.logementService.addLogement(this.logement)
      .subscribe(
      data => {
          this.alertService.success('Logement created', true);
          this.logement = data;
          this.dialogRef.close(this.logement);
      },
      error => {
          this.alertService.error(error);
      });
    }
}

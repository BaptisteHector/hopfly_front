import { Component, OnInit, Input, ViewChild, Inject } from '@angular/core';
import { Trip, User, Activity, Plan, Logement, MBReply, MBFeature } from '../models';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TripService, PlanService, ActivityService, AuthenticationService, AlertService, MapBoxService, LogementService } from '../services';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSelect } from '@angular/material/select';
import { ActivityDialog } from '../plan';
import { first, takeUntil } from 'rxjs/operators';
import { Subject, Subscription } from 'rxjs';
import { fadeAnimation } from '../utils/animation';

@Component({
  selector: 'app-logement',
  templateUrl: './logement.component.html',
  styleUrls: ['./logement.component.css'],
  animations: [fadeAnimation]
})
export class LogementComponent implements OnInit {

  @Input() trip: Trip;
  currentUser: User;
  logements: Logement[] = [];


  constructor(private route: ActivatedRoute,
    private tripService: TripService,
    private authenticationService: AuthenticationService,
    private alertService: AlertService,
    public dialog: MatDialog,
    ) {
      this.currentUser = this.authenticationService.currentUserValue;
  }

  ngOnInit() {
    this.loadTrip();
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(LogementDialog, {
      width: '70%'
    });

    dialogRef.afterClosed().subscribe(result => {
      let ret: Logement = result;
      if (result) {
        if (this.trip.logement_id == null)
        this.trip.logement_id = ret.id + ','
      else
        this.trip.logement_id += ret.id + ','
      this.tripService.updateTrip(this.trip)
      .subscribe(
        data => {
            this.alertService.success('Contact created', true);
        },
        error => {
            this.alertService.error(error);
        });        this.logements.push(ret);
      }
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
    if (this.trip.logement_id === null)
      return
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
              location: new FormControl('', [
                Validators.required]),
              start_date: new FormControl('', [
                Validators.required]),
              end_date: new FormControl('', [
                Validators.required]),
              phone: new FormControl('', [
                Validators.required]),
              name: new FormControl('', [
                Validators.required]),
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
      this.logement.start_date = this.logementForm.controls.start_date.value;
      this.logement.end_date = this.logementForm.controls.end_date.value;
      this.logement.location = this.locPlace.place_name
      this.logement.phone = this.logementForm.controls.phone.value;
      this.logement.name = this.logementForm.controls.name.value;
      if (!this.logement) { return; }
      this.logementService.addLogement(this.logement)
      .subscribe(
      data => {
          this.alertService.success('Logement created', true);
          this.dialogRef.close(data);
      },
      error => {
          this.alertService.error(error);
      });
    }
}

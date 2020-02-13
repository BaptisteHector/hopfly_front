import { Component, OnInit, Input, Inject, ViewChild } from '@angular/core';
import { Trip, User, Activity, Plan, MBReply, MBFeature } from '../models';
import { ActivatedRoute, Router } from '@angular/router';
import {DragDropModule, moveItemInArray, CdkDragDrop, transferArrayItem} from '@angular/cdk/drag-drop';
import { TripService, AuthenticationService, PlanService, ActivityService, MapBoxService, UserService, AlertService } from '../services';
import { first, take, takeUntil } from 'rxjs/operators';
import { MAT_DIALOG_DATA, MatDialogRef, MatSelect, MatDialog } from '@angular/material';
import { FormGroup, FormBuilder } from '@angular/forms';
import { ReplaySubject, Subject, Subscription } from 'rxjs';

@Component({
  selector: 'app-plan',
  templateUrl: './plan.component.html',
  styleUrls: ['./plan.component.css']
})
export class PlanComponent implements OnInit {

  @Input() trip: Trip;
  currentUser: User;
  planActivities: Activity[] = [];
  activities: Activity[];
  planForm: FormGroup;
  plan: Plan = new Plan();


  constructor(private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private tripService: TripService,
    private planService: PlanService,
    private activityService: ActivityService,
    private authenticationService: AuthenticationService,
    private alertService: AlertService,
    public dialog: MatDialog,
    private router: Router
    ) {
      this.currentUser = this.authenticationService.currentUserValue;

      this.planForm = this.formBuilder.group({
        name: '',
        activities: []
    });
  }

  ngOnInit() {
    this.loadTrip();
    this.loadActivities();
  }

  public onSubmit()
  {
    let plan = new Plan()
    let ret = '';
    this.planActivities.forEach(element => {
      ret += (element.id + ',');
    });
    plan.activities = ret
    plan.location = this.trip.location
    if (this.trip.plan_id === 0)
    {
      console.log("PLAN NAME" + this.planForm.controls.name.value)
      plan.name = this.planForm.controls.name.value;
      this.planService.addPlan(plan, this.trip.id).subscribe(
        data => {
            this.alertService.success('Trip created', true);
        },
        error => {
            this.alertService.error(error);
        });
    }
    else {
      console.log(plan.activities)
      plan.id = this.plan.id;
      this.planService.updatePlan(plan).subscribe(
        data => {
            this.alertService.success('Plan updated', true);
        },
        error => {
            this.alertService.error(error);
        });
    }
  }

  drop(event: CdkDragDrop<string[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(event.previousContainer.data,
                        event.container.data,
                        event.previousIndex,
                        event.currentIndex);
    }
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(ActivityDialog, {
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
      this.loadPlan()}
      );
  }

  public loadPlan() {
    if (this.trip.plan_id === 0) {
      this.plan = new Plan();
      return ;
    }
    this.planService.getPlan(this.trip.plan_id)
    .subscribe(plan => { this.plan = plan;
      this.planForm.controls.name.setValue(plan.name);
      console.log(this.plan);
    this.loadPlanActivities()});
  }

  public loadPlanActivities() {
    this.planService.getPlanActivities(this.plan.activities)
    .pipe(first())
    .subscribe(activities => {
        this.planActivities = activities
    });
  }

  public loadActivities() {
    this.activityService.getActivities()
    .pipe(first())
    .subscribe(activities => {
        this.activities = activities
    });
  }

  // Button handler

  public onClickCreateActivity(): void {
    this.openDialog();
  }


}

@Component({
  templateUrl: 'activity-dialog.html',
})
export class ActivityDialog {
  currentUser: User
  searchText = '';
  places = new MBReply<MBFeature>();
  activityForm: FormGroup;
  currentPlace: MBFeature;
  activity = new Activity();
  protected _onDestroy = new Subject<void>();
  private searchPlaceSub: Subscription;
  private inputWatcher: Subscription;    

  @ViewChild('placeInputSearch', {static: false}) placeInputSearch;
  @ViewChild('singleSelect', { static: true }) singleSelect: MatSelect;
  @ViewChild('multiSelect', { static: true }) multiSelect: MatSelect;
  constructor(
      private authenticationService: AuthenticationService,
      private formBuilder: FormBuilder,
      private alertService: AlertService,
      public dialogRef: MatDialogRef<ActivityDialog>,
      private activityService: ActivityService,
      private mapBoxService: MapBoxService,
      @Inject(MAT_DIALOG_DATA) public data: Trip)
      {
          this.currentUser = this.authenticationService.currentUserValue;
          
          this.activityForm = this.formBuilder.group({
              name: '',
              description: '',
              price: 0,
              location: '',
              filterlocation: '',
          });
      }
  
  placeClick(feature) {
      this.currentPlace = feature;
  }

  doSearch() {
      if (!!this.searchPlaceSub) {
          this.searchPlaceSub.unsubscribe();
      }
      this.searchPlaceSub = this.mapBoxService.geocoding(this.activityForm.controls.filterlocation.value).subscribe(
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
      this.activityForm.controls.filterlocation.valueChanges
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
      if (this.activityForm.invalid) {
          return;
      }
      this.activity.name = this.activityForm.controls.name.value;
      this.activity.description = this.activityForm.controls.description.value;
      this.activity.location = this.currentPlace.center[0] + ',' + this.currentPlace.center[1];
      this.activity.price = this.activityForm.controls.price.value;
      if (!this.activity) { return; }
      this.activityService.addActivity(this.activity)
      .subscribe(
      data => {
          this.alertService.success('Activity created', true);
          this.activity = data;
          this.dialogRef.close(this.activity);
      },
      error => {
          this.alertService.error(error);
      });
    }
}

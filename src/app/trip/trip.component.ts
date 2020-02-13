import { Component, OnInit, Input } from '@angular/core';
import { Trip, User, Plan } from '../models';
import { TripService, AuthenticationService, PlanService } from '../services';
import { ActivatedRoute, Router } from '@angular/router';
import { Activity } from '../models/activity';
import { first } from 'rxjs/operators';

@Component({
  selector: 'app-trip',
  templateUrl: './trip.component.html',
  styleUrls: ['./trip.component.css']
})
export class TripComponent implements OnInit {
  @Input() trip: Trip;
  currentUser: User;
  activities: Activity[];
  plan: Plan;


  constructor(
    private route: ActivatedRoute,
    private tripService: TripService,
    private planService: PlanService,
    private router: Router,
    private authenticationService: AuthenticationService,
  ) { 
    this.currentUser = this.authenticationService.currentUserValue;
  }

  ngOnInit() {
    this.loadTrip();
  }

  // Service call

  public loadTrip() {
    const id = +this.route.snapshot.paramMap.get('id');
    this.tripService.getTrip(id)
    .subscribe(trip => {this.trip = trip
      this.loadPlan();
    });
  }

  public loadPlan() {
    if (this.trip.plan_id === 0) {
      return ;
    }
    this.planService.getPlan(this.trip.plan_id)
    .subscribe(plan => {this.plan = plan
      this.loadActivities()
    }
      );
  }

  public loadActivities() {
    if (this.trip.plan_id === 0) {
      return ;
    }
    this.planService.getPlanActivities(this.plan.activities)
    .pipe(first())
    .subscribe(activities => {
      console.log(activities)
        this.activities = activities
    });
  }

  // Button Management

  public onClickUpdateTrip() {
    let id = this.trip.id;
    this.router.navigate(['trip/update/' + id]);
  }

  public onClickManagePlan() {
    let id = this.trip.id;
    this.router.navigate(['/plan/' + id]);
  }

  public onClickCreateTicket() {
    let id = this.trip.id;
    this.router.navigate(['trip/ticket/' + id]);
  }

  public onClickCreateLogement() {
    let id = this.trip.id;
    this.router.navigate(['trip/logement/' + id]);
  }
}

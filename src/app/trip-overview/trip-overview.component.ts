import { Component, OnInit, Input } from '@angular/core';
import { Trip, User } from '../models';
import { TripService, AuthenticationService } from '../services';
import { first } from 'rxjs/operators';

@Component({
  selector: 'app-trip-overview',
  templateUrl: './trip-overview.component.html',
  styleUrls: ['./trip-overview.component.css']
})
export class TripOverviewComponent implements OnInit {

  @Input() trip: Trip;
  beg_date: ''
  end_date: ''
  currentUser: User
  guest: User[]
  constructor(
    private tripService: TripService,
    private authenticationService: AuthenticationService,
  ) {
    this.currentUser = this.authenticationService.currentUserValue;

  }

  ngOnInit(): void {
    this.loadParticipant()
  }
  
  loadParticipant() {
    this.tripService.getTripUsers(this.trip.user_id)
    .pipe(first())
    .subscribe(users => this.guest = users)
  }
}

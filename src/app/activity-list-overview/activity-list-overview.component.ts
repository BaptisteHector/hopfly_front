import { Component, OnInit, Input } from '@angular/core';
import { User, Activity } from '../models';
import { AuthenticationService } from '../services';

@Component({
  selector: 'app-activity-list-overview',
  templateUrl: './activity-list-overview.component.html',
  styleUrls: ['./activity-list-overview.component.css']
})
export class ActivityListOverviewComponent implements OnInit {

  @Input() activity: Activity;
  currentUser: User
  guest: User[]
  constructor(
    private authenticationService: AuthenticationService,
  ) {
    this.currentUser = this.authenticationService.currentUserValue;
  }

  ngOnInit(): void {
  }
  
}

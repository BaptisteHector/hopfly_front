import { Component, OnInit, Input } from '@angular/core';
import { User } from '../models';

@Component({
  selector: 'app-friend-overview',
  templateUrl: './friend-overview.component.html',
  styleUrls: ['./friend-overview.component.css']
})
export class FriendOverviewComponent implements OnInit {

  @Input() user: User;
  friends: number;
  trips: number;
  constructor() { }

  ngOnInit(): void {
    this.friends = this.user.friend_id.split(',').length
    this.trips = this.user.trip_id.split(',').length
  }

}

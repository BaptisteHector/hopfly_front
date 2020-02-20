import { Component, OnInit, Input } from '@angular/core';
import { Activity } from '../models';

@Component({
  selector: 'app-activity-overview',
  templateUrl: './activity-overview.component.html',
  styleUrls: ['./activity-overview.component.css']
})
export class ActivityOverviewComponent implements OnInit {

  @Input() activity: Activity
  constructor() { }

  ngOnInit(): void {
  }

}

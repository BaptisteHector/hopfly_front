import { Component, OnInit, Input } from '@angular/core';
import { Trip } from '../models';

@Component({
  selector: 'app-trip-overview',
  templateUrl: './trip-overview.component.html',
  styleUrls: ['./trip-overview.component.css']
})
export class TripOverviewComponent implements OnInit {

  @Input() trip: Trip;
  beg_date: ''
  end_date: ''
  constructor() { }

  ngOnInit(): void {
  }
}

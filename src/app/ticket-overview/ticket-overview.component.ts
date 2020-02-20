import { Component, OnInit, Input } from '@angular/core';
import { Ticket } from '../models';

@Component({
  selector: 'app-ticket-overview',
  templateUrl: './ticket-overview.component.html',
  styleUrls: ['./ticket-overview.component.css']
})
export class TicketOverviewComponent implements OnInit {

  @Input() ticket: Ticket;
  constructor(
  ) {
  }

  ngOnInit(): void {
  }

}

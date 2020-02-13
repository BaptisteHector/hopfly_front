import { Component, OnInit, Input, ViewChild, Inject } from '@angular/core';
import { Trip, User, Activity, Plan, Ticket, MBReply, MBFeature } from '../models';
import { FormGroup, FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TripService, PlanService, ActivityService, AuthenticationService, AlertService, MapBoxService, TicketService } from '../services';
import { MatDialog, MatSelect, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { ActivityDialog } from '../plan';
import { first, takeUntil } from 'rxjs/operators';
import { Subject, Subscription } from 'rxjs';

@Component({
  selector: 'app-ticket',
  templateUrl: './ticket.component.html',
  styleUrls: ['./ticket.component.css']
})
export class TicketComponent implements OnInit {

  @Input() trip: Trip;
  currentUser: User;
  planActivities: Activity[] = [];
  activities: Activity[];
  tickets: Ticket[];


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
    const dialogRef = this.dialog.open(TicketDialog, {
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
      this.loadTickets()}
      );
  }

  public loadTickets() {
    this.tripService.getTripTickets(this.trip.ticket_id)
    .pipe(first())
    .subscribe(tickets => {
        this.tickets = tickets
    });
  }
}

@Component({
  templateUrl: 'ticket-dialog.html',
})
export class TicketDialog {
  currentUser: User
  searchText = '';
  places = new MBReply<MBFeature>();
  ticketForm: FormGroup;
  depPlace: MBFeature;
  arrPlace: MBFeature;
  ticket = new Ticket();
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
      private ticketService: TicketService,
      public dialogRef: MatDialogRef<ActivityDialog>,
      private mapBoxService: MapBoxService,
      @Inject(MAT_DIALOG_DATA) public data: Trip)
      {
          this.currentUser = this.authenticationService.currentUserValue;
          
          this.ticketForm = this.formBuilder.group({
              departure: '',
              dep_date: '',
              arr_date: '',
              arrival: '',
              number: '',
              filterlocation: ''
          });
      }
  
  placeClickDep(feature) {
      this.depPlace = feature;
  }

  placeClickArr(feature) {
    this.arrPlace = feature;
  }

  doSearch() {
      if (!!this.searchPlaceSub) {
          this.searchPlaceSub.unsubscribe();
      }
      this.searchPlaceSub = this.mapBoxService.geocoding(this.ticketForm.controls.filterlocation.value).subscribe(
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
      this.ticketForm.controls.filterlocation.valueChanges
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
      if (this.ticketForm.invalid) {
          return;
      }
      this.ticket.dep_date = this.ticketForm.controls.dep_date.value;
      this.ticket.arr_date = this.ticketForm.controls.arr_date.value;
      this.ticket.departure = this.depPlace.center[0] + ',' + this.depPlace.center[1];
      this.ticket.arrival = this.arrPlace.center[0] + ',' + this.arrPlace.center[1];
      this.ticket.number = this.ticketForm.controls.number.value;
      if (!this.ticket) { return; }
      this.ticketService.addTicket(this.ticket)
      .subscribe(
      data => {
          this.alertService.success('Ticket created', true);
          this.ticket = data;
          this.dialogRef.close(this.ticket);
      },
      error => {
          this.alertService.error(error);
      });
    }
}

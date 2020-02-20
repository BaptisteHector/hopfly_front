import { Component, OnInit, Input, ViewChild, Inject } from '@angular/core';
import { Trip, User, Activity, Plan, Ticket, MBReply, MBFeature } from '../models';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TripService, PlanService, ActivityService, AuthenticationService, AlertService, MapBoxService, TicketService, UserService } from '../services';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSelect } from '@angular/material/select';
import { ActivityDialog } from '../plan';
import { first, takeUntil } from 'rxjs/operators';
import { Subject, Subscription } from 'rxjs';
import { fadeAnimation } from '../utils/animation';

@Component({
  selector: 'app-ticket',
  templateUrl: './ticket.component.html',
  styleUrls: ['./ticket.component.css'],
  animations: [fadeAnimation]

})
export class TicketComponent implements OnInit {

  @Input() trip: Trip;
  currentUser: User;
  tickets: Ticket[] = [];


  constructor(private route: ActivatedRoute,
    private tripService: TripService,
    private alertService: AlertService,
    private authenticationService: AuthenticationService,
    public dialog: MatDialog,
    ) {
      this.currentUser = this.authenticationService.currentUserValue;
  }

  ngOnInit() {
    this.loadTrip();
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(TicketDialog, {
      width: '70%'
    });

    dialogRef.afterClosed().subscribe(result => {
      let ret: Ticket = result;
      if (result) {
        if (this.trip.ticket_id == null)
        this.trip.ticket_id = ret.id + ','
      else
        this.trip.ticket_id += ret.id + ','
      this.tripService.updateTrip(this.trip)
      .subscribe(
        data => {
            this.alertService.success('Contact created', true);
        },
        error => {
            this.alertService.error(error);
        });        this.tickets.push(ret);
      }
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
    if (this.trip.ticket_id === null)
      return
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
  depplaces = new MBReply<MBFeature>();
  arrplaces = new MBReply<MBFeature>();
  ticketForm: FormGroup;
  depPlace: MBFeature;
  arrPlace: MBFeature;
  ticket = new Ticket();
  protected _onDestroy = new Subject<void>();
  private searchPlaceSub: Subscription;
  private inputWatcher: Subscription;    

  @ViewChild('placeInputSearch') placeInputSearch;
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
              departure: ['', Validators.required],
              dep_date: ['', Validators.required],
              arr_date: ['', Validators.required],
              arrival: ['', Validators.required],
              number: ['', Validators.required],
              filterdeparture: '',
              filterarrival: ''
          });
      }
  
  placeClickDep(feature) {
      this.depPlace = feature;
  }

  placeClickArr(feature) {
    this.arrPlace = feature;
  }

  doSearchDep() {
      if (!!this.searchPlaceSub) {
          this.searchPlaceSub.unsubscribe();
      }
      this.searchPlaceSub = this.mapBoxService.geocoding(this.ticketForm.controls.filterdeparture.value).subscribe(
          (result) => {
              this.depplaces = result;
          },
          () => {
          }
      );
  }    

  doSearchArr() {
    if (!!this.searchPlaceSub) {
        this.searchPlaceSub.unsubscribe();
    }
    this.searchPlaceSub = this.mapBoxService.geocoding(this.ticketForm.controls.filterarrival.value).subscribe(
        (result) => {
            this.arrplaces = result;
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
      this.ticketForm.controls.filterdeparture.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
          this.doSearchDep();
      });
      this.ticketForm.controls.filterarrival.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
          this.doSearchArr();
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
      this.ticket.departure = this.depPlace.place_name
      this.ticket.arrival = this.arrPlace.place_name;
      this.ticket.number = this.ticketForm.controls.number.value;
      if (!this.ticket) { return; }
      this.ticketService.addTicket(this.ticket)
      .subscribe(
      data => {
          this.alertService.success('Ticket created', true);
          this.dialogRef.close(data);
      },
      error => {
          this.alertService.error(error);
      });
    }
}

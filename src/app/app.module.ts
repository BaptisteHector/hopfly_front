import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatToolbarModule } from '@angular/material/toolbar';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import {DragDropModule} from '@angular/cdk/drag-drop';
import { AvatarModule } from 'ngx-avatar';
import {MatGridListModule} from '@angular/material/grid-list'

import { appRoutingModule } from './app.routing';
import { AppComponent } from './app.component';
import { HomeComponent, TripDialog } from './home';
import { LoginComponent } from './login';
import { RegisterComponent } from './register';
import { AlertComponent } from './alert';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TripComponent } from './trip';
import {MatStepperModule} from '@angular/material/stepper';
import { PlanComponent, ActivityDialog } from './plan';
import { ProfileComponent, ContactDialog, FriendDialog } from './profile/profile.component';
import { TicketComponent, TicketDialog } from './ticket/ticket.component';
import { LogementComponent, LogementDialog } from './logement/logement.component';
import { UpdateTripComponent } from './update-trip/update-trip.component';
import { ProfileUpdateComponent } from './profile-update/profile-update.component';
import { TripOverviewComponent } from './trip-overview/trip-overview.component';
import { ActivityOverviewComponent } from './activity-overview/activity-overview.component';
import { FriendOverviewComponent } from './friend-overview/friend-overview.component';
import { ContactOverviewComponent } from './contact-overview/contact-overview.component';
import { ActivityListOverviewComponent } from './activity-list-overview/activity-list-overview.component';
import { TicketOverviewComponent } from './ticket-overview/ticket-overview.component';
import { LogementOverviewComponent } from './logement-overview/logement-overview.component';
import { PlanOverviewComponent } from './plan-overview/plan-overview.component';
import { AlertService } from './services';
import {MatSnackBarModule} from '@angular/material/snack-bar';

@NgModule({
    imports: [
        BrowserModule,
        ReactiveFormsModule,
        HttpClientModule,
        appRoutingModule,
        MatButtonModule,
        MatInputModule,
        MatDialogModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatSelectModule,
        MatFormFieldModule,
        NgxMatSelectSearchModule,
        BrowserAnimationsModule,
        BrowserAnimationsModule,
        MatStepperModule,
        MatIconModule,
        MatCardModule,
        DragDropModule,
        MatToolbarModule,
        AvatarModule,
        MatSnackBarModule,
        MatGridListModule,
    ],
    declarations: [
        AppComponent,
        HomeComponent,
        LoginComponent,
        AlertComponent,
        TripDialog,
        ContactDialog,
        FriendDialog,
        TicketDialog,
        LogementDialog,
        ActivityDialog,
        RegisterComponent,
        TripComponent,
        PlanComponent,
        ProfileComponent,
        TicketComponent,
        LogementComponent,
        UpdateTripComponent,
        ProfileUpdateComponent,
        TripOverviewComponent,
        ActivityOverviewComponent,
        FriendOverviewComponent,
        ContactOverviewComponent,
        ActivityListOverviewComponent,
        TicketOverviewComponent,
        LogementOverviewComponent,
        PlanOverviewComponent,
    ],
    entryComponents: [
        ActivityDialog,
        TripDialog,
        ContactDialog,
        FriendDialog,
        TicketDialog,
        LogementDialog
    ],
    exports: [
        AlertComponent
    ],
    providers: [
        MatDatepickerModule,
        AlertService
    ],
    bootstrap: [AppComponent]
})
export class AppModule { };
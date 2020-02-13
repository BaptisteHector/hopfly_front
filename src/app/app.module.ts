import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { MatButtonModule, MatInputModule, MatDialogModule, MatDatepickerModule, MatFormFieldModule, MatSelectModule, MatNativeDateModule, MatIconModule } from '@angular/material'
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import {DragDropModule} from '@angular/cdk/drag-drop';



// used to create fake backend
import { appRoutingModule } from './app.routing';
import { JwtInterceptor, ErrorInterceptor } from './helpers';
import { AppComponent } from './app.component';
import { HomeComponent, TripDialog } from './home';
import { LoginComponent } from './login';
import { RegisterComponent } from './register';
import { AlertComponent } from './alert';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TripComponent } from './trip';
import {MatStepperModule} from '@angular/material/stepper';
import { PlanComponent, ActivityDialog } from './plan';
import { ProfileComponent } from './profile/profile.component';
import { TicketComponent } from './ticket/ticket.component';
import { LogementComponent } from './logement/logement.component';
import { UpdateTripComponent } from './update-trip/update-trip.component';
import { ProfileUpdateComponent } from './profile-update/profile-update.component';

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
        DragDropModule,
        MatIconModule
    ],
    declarations: [
        AppComponent,
        HomeComponent,
        LoginComponent,
        TripDialog,
        ActivityDialog,
        RegisterComponent,
        AlertComponent,
        TripComponent,
        PlanComponent,
        ProfileComponent,
        TicketComponent,
        LogementComponent,
        UpdateTripComponent,
        ProfileUpdateComponent
    ],
    entryComponents: [
        ActivityDialog,
        TripDialog
    ],
    providers: [
        MatDatepickerModule
    ],
    bootstrap: [AppComponent]
})
export class AppModule { };
import { Routes, RouterModule } from '@angular/router';

import { HomeComponent } from './home';
import { LoginComponent } from './login';
import { RegisterComponent } from './register';
import { AuthGuard } from './helpers';
import { TripComponent } from './trip';
import { PlanComponent } from './plan';
import { UpdateTripComponent } from './update-trip/update-trip.component';
import { TicketComponent } from './ticket/ticket.component';
import { LogementComponent } from './logement/logement.component';
import { ProfileComponent } from './profile/profile.component';
import { ProfileUpdateComponent } from './profile-update/profile-update.component';

const routes: Routes = [
    { path: '', component: HomeComponent, canActivate: [AuthGuard] },
    { path: 'login', component: LoginComponent },
    { path: 'register', component: RegisterComponent },
    { path: 'plan/:id', component: PlanComponent },
    { path: 'trip/update/:id', component: UpdateTripComponent },
    { path: 'trip/ticket/:id', component: TicketComponent },
    { path: 'trip/logement/:id', component: LogementComponent },
    { path: 'profile/:id', component: ProfileComponent },
    { path: 'profile/update/:id', component: ProfileUpdateComponent },
    { path: 'trip/:id', component: TripComponent },

    // otherwise redirect to home
    { path: '**', redirectTo: '' }
];

export const appRoutingModule = RouterModule.forRoot(routes);
import { Routes, RouterModule } from '@angular/router';

import { HomeComponent } from './home';
import { LoginComponent } from './login';
import { RegisterComponent } from './register';
import { AuthGuard } from './helpers';
import { TripComponent } from './trip';
import { PlanComponent } from './plan';

const routes: Routes = [
    { path: '', component: HomeComponent, canActivate: [AuthGuard] },
    { path: 'login', component: LoginComponent },
    { path: 'register', component: RegisterComponent },
    { path: 'trip/:id', component: TripComponent },
    { path: 'plan/:id', component: PlanComponent },
    { path: 'trip/update/:id', component: PlanComponent },
    { path: 'trip/tickets/:id', component: PlanComponent },
    { path: 'trip/logement/:id', component: PlanComponent },
    { path: 'profile/:id', component: PlanComponent },
    { path: 'profile/update/:id', component: PlanComponent },

    // otherwise redirect to home
    { path: '**', redirectTo: '' }
];

export const appRoutingModule = RouterModule.forRoot(routes);
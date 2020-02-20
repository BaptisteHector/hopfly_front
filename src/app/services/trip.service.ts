import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

import { Trip, Ticket, Logement, User } from '../models';
import { Activity } from '../models/activity';

@Injectable({
  providedIn: 'root'
})
export class TripService {

  private TripsUrl = 'https://localhost:5001/api/Hopfly/trip';  // URL to web api

  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  constructor(
    private http: HttpClient) { }

  /** GET Trips from the server */
  getTrips (): Observable<Trip[]> {
    return this.http.get<Trip[]>(this.TripsUrl + '/gettrips')
      .pipe(
        tap(_ => this.log('fetched Trips')),
        catchError(this.handleError<Trip[]>('getTrips', []))
      );
  }

  /** GET Trip by id. Return `undefined` when id not found */
  getTripNo404<Data>(id: string): Observable<Trip> {
    const url = `${this.TripsUrl}/?id=${id}`;
    return this.http.get<Trip[]>(url)
      .pipe(
        map(Trips => Trips[0]), // returns a {0|1} element array
        tap(h => {
          const outcome = h ? `fetched` : `did not find`;
          this.log(`${outcome} Trip id=${id}`);
        }),
        catchError(this.handleError<Trip>(`getTrip id=${id}`))
      );
  }

  /** GET Trip by id. Will 404 if id not found */
  getTrip(id: number): Observable<Trip> {
    const url = `${this.TripsUrl}/GetTrip/${id}`;
    return this.http.get<Trip>(url).pipe(
      tap(_ => this.log(`fetched Trip id=${id}`)),
      catchError(this.handleError<Trip>(`getTrip id=${id}`))
    );
  }

  /* GET Trips whose name contains search term */
  searchTrips(term: string): Observable<Trip[]> {
    if (!term.trim()) {
      // if not search term, return empty Trip array.
      return of([]);
    }
    return this.http.get<Trip[]>(`${this.TripsUrl}/?name=${term}`).pipe(
      tap(_ => this.log(`found Trips matching "${term}"`)),
      catchError(this.handleError<Trip[]>('searchTrips', []))
    );
  }

  getTripActivities(id: string): Observable<Activity[]> {
    return this.http.get<Activity[]>(this.TripsUrl + '/GetTripActivities/' + id)
      .pipe(
        tap(_ => this.log('fetched Trips')),
        catchError(this.handleError<Activity[]>('getTrips', []))
      );
  }

  getTripUsers(id: string): Observable<User[]> {
    return this.http.get<User[]>(this.TripsUrl + '/GetTripUsers/' + id)
      .pipe(
        tap(_ => this.log('fetched Trips')),
        catchError(this.handleError<User[]>('getTrips', []))
      );
  }

  getTripTickets(id: string): Observable<Ticket[]> {
    return this.http.get<Ticket[]>(this.TripsUrl + '/GetTripTickets/' + id)
      .pipe(
        tap(_ => this.log('fetched Trips')),
        catchError(this.handleError<Ticket[]>('getTrips', []))
      );
  }

  getTripLogements(id: string): Observable<Logement[]> {
    return this.http.get<Logement[]>(this.TripsUrl + '/GetTripLogements/' + id)
      .pipe(
        tap(_ => this.log('fetched Trips')),
        catchError(this.handleError<Logement[]>('getTrips', []))
      );
  }

  //////// Save methods //////////

  /** POST: add a new Trip to the server */
  addTrip (Trip: Trip): Observable<Trip> {
    console.log(Trip);
    return this.http.post<Trip>(this.TripsUrl + "/createTrip", Trip, this.httpOptions)
    .pipe(
      tap((newTrip: Trip) => this.log(`added Trip w/ id=${newTrip.id}`)),
      catchError(this.handleError<any>('registerTrip'))
    );
  }

  /** DELETE: delete the Trip from the server */
  deleteTrip (Trip: Trip | number): Observable<Trip> {
    const id = typeof Trip === 'number' ? Trip : Trip.id;
    const url = `${this.TripsUrl}/${id}`;

    return this.http.delete<Trip>(url, this.httpOptions).pipe(
      tap(_ => this.log(`deleted Trip id=${id}`)),
      catchError(this.handleError<Trip>('deleteTrip'))
    );
  }

  /** PUT: update the Trip on the server */
  updateTrip (Trip: Trip): Observable<any> {
    return this.http.put(this.TripsUrl + "/update/" + Trip.id.toString(), Trip, this.httpOptions).pipe(
      tap(_ => this.log(`updated Trip id=${Trip.id}`)),
      catchError(this.handleError<any>('updateTrip'))
    );
  }

  /**
   * Handle Http operation that failed.
   * Let the app continue.
   * @param operation - name of the operation that failed
   * @param result - optional value to return as the observable result
   */
  private handleError<T> (operation = 'operation', result?: T) {
    return (error): Observable<T> => {

      // TODO: send the error to remote logging infrastructure
      console.error(error.error.message); // log to console instead

      // TODO: better job of transforming error for trip consumption
      this.log(`${operation} failed: ${error.error.message}`);

      // Let the app keep running by returning an empty result.
      return of(result as T);
    };
  }

  /** Log a TripService message with the MessageService */
  private log(message: string) {
    console.log(`TripService:` + message);
  }
}

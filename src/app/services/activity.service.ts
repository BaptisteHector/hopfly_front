import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

import { Trip, Activity } from '../models';
@Injectable({
  providedIn: 'root'
})
export class ActivityService {

  private ActivitiesUrl = 'https://localhost:5001/api/Hopfly/activity';  // URL to web api

  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  constructor(
    private http: HttpClient) { }

  /** GET Activities from the server */
  getActivities (): Observable<Activity[]> {
    return this.http.get<Activity[]>(this.ActivitiesUrl + '/getactivities')
      .pipe(
        tap(_ => this.log('fetched Activities')),
        catchError(this.handleError<Activity[]>('getActivities', []))
      );
  }

  /** GET Activity by id. Return `undefined` when id not found */
  getActivityNo404<Data>(id: string): Observable<Activity> {
    const url = `${this.ActivitiesUrl}/?id=${id}`;
    return this.http.get<Activity[]>(url)
      .pipe(
        map(Activities => Activities[0]), // returns a {0|1} element array
        tap(h => {
          const outcome = h ? `fetched` : `did not find`;
          this.log(`${outcome} Activity id=${id}`);
        }),
        catchError(this.handleError<Activity>(`getActivity id=${id}`))
      );
  }

  /** GET Activity by id. Will 404 if id not found */
  getActivity(id: number): Observable<Activity> {
    const url = `${this.ActivitiesUrl}/GetActivity/${id}`;
    return this.http.get<Activity>(url).pipe(
      tap(_ => this.log(`fetched Activity id=${id}`)),
      catchError(this.handleError<Activity>(`getActivity id=${id}`))
    );
  }

  /* GET Activities whose name contains search term */
  searchActivities(term: string): Observable<Activity[]> {
    if (!term.trim()) {
      // if not search term, return empty Activity array.
      return of([]);
    }
    return this.http.get<Activity[]>(`${this.ActivitiesUrl}/?name=${term}`).pipe(
      tap(_ => this.log(`found Activities matching "${term}"`)),
      catchError(this.handleError<Activity[]>('searchActivities', []))
    );
  }

  getLocationActivities(location: string): Observable<Activity[]> {
    return this.http.get<Activity[]>(this.ActivitiesUrl + '/GetLocationActivities/' + location)
      .pipe(
        tap(_ => this.log('fetched Activities')),
        catchError(this.handleError<Activity[]>('getActivities', []))
      );
  }

  //////// Save methods //////////

  /** POST: add a new Activity to the server */
  addActivity (Activity: Activity): Observable<Activity> {
    console.log(Activity);
    return this.http.post<Activity>(this.ActivitiesUrl + "/createActivity", Activity, this.httpOptions)
    .pipe(
      tap((newActivity: Activity) => this.log(`added Activity w/ id=${newActivity.id}`)),
      catchError(this.handleError<any>('registerActivity'))
    );
  }

  /** DELETE: delete the Activity from the server */
  deleteActivity (Activity: Activity | number): Observable<Activity> {
    const id = typeof Activity === 'number' ? Activity : Activity.id;
    const url = `${this.ActivitiesUrl}/${id}`;

    return this.http.delete<Activity>(url, this.httpOptions).pipe(
      tap(_ => this.log(`deleted Activity id=${id}`)),
      catchError(this.handleError<Activity>('deleteActivity'))
    );
  }

  /** PUT: update the Activity on the server */
  updateActivity (Activity: Activity): Observable<any> {
    return this.http.put(this.ActivitiesUrl + "/update/" + Activity.id.toString(), Activity, this.httpOptions).pipe(
      tap(_ => this.log(`updated Activity id=${Activity.id}`)),
      catchError(this.handleError<any>('updateActivity'))
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

      // TODO: better job of transforming error for activity consumption
      this.log(`${operation} failed: ${error.error.message}`);

      // Let the app keep running by returning an empty result.
      return of(result as T);
    };
  }

  /** Log a ActivityService message with the MessageService */
  private log(message: string) {
    console.log(`ActivityService:` + message);
  }}

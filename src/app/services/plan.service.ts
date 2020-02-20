import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

import { Trip, Plan, Activity } from '../models';
@Injectable({
  providedIn: 'root'
})
export class PlanService {

  private PlansUrl = 'https://localhost:5001/api/Hopfly/plan';  // URL to web api

  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  constructor(
    private http: HttpClient) { }

  /** GET Plans from the server */
  getPlans (): Observable<Plan[]> {
    console.log("get")
    return this.http.get<Plan[]>(this.PlansUrl + '/getplans')
      .pipe(
        tap(_ => this.log('fetched Plans')),
        catchError(this.handleError<Plan[]>('getPlans', []))
      );
  }

  /** GET Plan by id. Return `undefined` when id not found */
  getPlanNo404<Data>(id: string): Observable<Plan> {
    const url = `${this.PlansUrl}/?id=${id}`;
    return this.http.get<Plan[]>(url)
      .pipe(
        map(Plans => Plans[0]), // returns a {0|1} element array
        tap(h => {
          const outcome = h ? `fetched` : `did not find`;
          this.log(`${outcome} Plan id=${id}`);
        }),
        catchError(this.handleError<Plan>(`getPlan id=${id}`))
      );
  }

  /** GET Plan by id. Will 404 if id not found */
  getPlan(id: number): Observable<Plan> {
    const url = `${this.PlansUrl}/GetPlan/${id}`;
    return this.http.get<Plan>(url).pipe(
      tap(_ => this.log(`fetched Plan id=${id}`)),
      catchError(this.handleError<Plan>(`getPlan id=${id}`))
    );
  }

  /* GET Plans whose name contains search term */
  searchPlans(term: string): Observable<Plan[]> {
    if (!term.trim()) {
      // if not search term, return empty Plan array.
      return of([]);
    }
    return this.http.get<Plan[]>(`${this.PlansUrl}/?name=${term}`).pipe(
      tap(_ => this.log(`found Plans matching "${term}"`)),
      catchError(this.handleError<Plan[]>('searchPlans', []))
    );
  }

  getPlanActivities(id: string): Observable<Activity[]> {
    return this.http.get<Activity[]>(this.PlansUrl + '/GetPlanActivities/' + id)
      .pipe(
        tap(_ => this.log('fetched Plans')),
        catchError(this.handleError<Activity[]>('getPlans', []))
      );
  }

  //////// Save methods //////////

  /** POST: add a new Plan to the server */
  addPlan(Plan: Plan, tripId: number): Observable<Plan> {
    console.log(Plan);
    return this.http.post<Plan>(this.PlansUrl + '/createPlan/' + tripId, Plan, this.httpOptions)
    .pipe(
      tap((newPlan: Plan) => this.log(`added Plan w/ id=${newPlan.id}`)),
      catchError(this.handleError<any>('registerTrip'))
    );
  }

  /** DELETE: delete the Plan from the server */
  deletePlan (Plan: Plan | number): Observable<Plan> {
    const id = typeof Plan === 'number' ? Plan : Plan.id;
    const url = `${this.PlansUrl}/${id}`;

    return this.http.delete<Plan>(url, this.httpOptions).pipe(
      tap(_ => this.log(`deleted Plan id=${id}`)),
      catchError(this.handleError<Plan>('deletePlan'))
    );
  }

  /** PUT: update the Plan on the server */
  updatePlan (Plan: Plan): Observable<any> {
    return this.http.put(this.PlansUrl + '/update/' + Plan.id.toString(), Plan, this.httpOptions).pipe(
      tap(_ => this.log(`updated Plan id=${Plan.id}`)),
      catchError(this.handleError<any>('updatePlan'))
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

      // TODO: better job of transforming error for plan consumption
      this.log(`${operation} failed: ${error.error.message}`);

      // Let the app keep running by returning an empty result.
      return of(result as T);
    };
  }

  /** Log a PlanService message with the MessageService */
  private log(message: string) {
    console.log(`PlanService:` + message);
  }}

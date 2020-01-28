import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

import { Trip, Logement } from '../models';
@Injectable({
  providedIn: 'root'
})
export class LogementService {

  private LogementsUrl = 'https://localhost:5001/api/Hopfly/logement';  // URL to web api

  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  constructor(
    private http: HttpClient) { }

  /** GET Logements from the server */
  getLogements (): Observable<Logement[]> {
    return this.http.get<Logement[]>(this.LogementsUrl + '/getlogements')
      .pipe(
        tap(_ => this.log('fetched Logements')),
        catchError(this.handleError<Logement[]>('getLogements', []))
      );
  }

  /** GET Logement by id. Return `undefined` when id not found */
  getLogementNo404<Data>(id: string): Observable<Logement> {
    const url = `${this.LogementsUrl}/?id=${id}`;
    return this.http.get<Logement[]>(url)
      .pipe(
        map(Logements => Logements[0]), // returns a {0|1} element array
        tap(h => {
          const outcome = h ? `fetched` : `did not find`;
          this.log(`${outcome} Logement id=${id}`);
        }),
        catchError(this.handleError<Logement>(`getLogement id=${id}`))
      );
  }

  /** GET Logement by id. Will 404 if id not found */
  getLogement(id: number): Observable<Logement> {
    const url = `${this.LogementsUrl}/GetLogement/${id}`;
    return this.http.get<Logement>(url).pipe(
      tap(_ => this.log(`fetched Logement id=${id}`)),
      catchError(this.handleError<Logement>(`getLogement id=${id}`))
    );
  }

  /* GET Logements whose name contains search term */
  searchLogements(term: string): Observable<Logement[]> {
    if (!term.trim()) {
      // if not search term, return empty Logement array.
      return of([]);
    }
    return this.http.get<Logement[]>(`${this.LogementsUrl}/?name=${term}`).pipe(
      tap(_ => this.log(`found Logements matching "${term}"`)),
      catchError(this.handleError<Logement[]>('searchLogements', []))
    );
  }

  //////// Save methods //////////

  /** POST: add a new Logement to the server */
  addLogement (Logement: Logement): Observable<Logement> {
    console.log(Logement);
    return this.http.post<Logement>(this.LogementsUrl + "/createLogement", Logement, this.httpOptions)
    .pipe(
      tap((newLogement: Logement) => this.log(`added Logement w/ id=${newLogement.id}`)),
      catchError(this.handleError<any>('registerLogement'))
    );
  }

  /** DELETE: delete the Logement from the server */
  deleteLogement (Logement: Logement | number): Observable<Logement> {
    const id = typeof Logement === 'number' ? Logement : Logement.id;
    const url = `${this.LogementsUrl}/${id}`;

    return this.http.delete<Logement>(url, this.httpOptions).pipe(
      tap(_ => this.log(`deleted Logement id=${id}`)),
      catchError(this.handleError<Logement>('deleteLogement'))
    );
  }

  /** PUT: update the Logement on the server */
  updateLogement (Logement: Logement): Observable<any> {
    return this.http.put(this.LogementsUrl, Logement, this.httpOptions).pipe(
      tap(_ => this.log(`updated Logement id=${Logement.id}`)),
      catchError(this.handleError<any>('updateLogement'))
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

      // TODO: better job of transforming error for logement consumption
      this.log(`${operation} failed: ${error.error.message}`);

      // Let the app keep running by returning an empty result.
      return of(result as T);
    };
  }

  /** Log a LogementService message with the MessageService */
  private log(message: string) {
    console.log(`LogementService:` + message);
  }}

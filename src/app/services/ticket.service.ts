import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

import { Trip, Ticket } from '../models';
@Injectable({
  providedIn: 'root'
})
export class TicketService {

  private TicketsUrl = 'https://localhost:5001/api/Hopfly/ticket';  // URL to web api

  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  constructor(
    private http: HttpClient) { }

  /** GET Tickets from the server */
  getTickets (): Observable<Ticket[]> {
    return this.http.get<Ticket[]>(this.TicketsUrl + '/gettickets')
      .pipe(
        tap(_ => this.log('fetched Tickets')),
        catchError(this.handleError<Ticket[]>('getTickets', []))
      );
  }

  /** GET Ticket by id. Return `undefined` when id not found */
  getTicketNo404<Data>(id: string): Observable<Ticket> {
    const url = `${this.TicketsUrl}/?id=${id}`;
    return this.http.get<Ticket[]>(url)
      .pipe(
        map(Tickets => Tickets[0]), // returns a {0|1} element array
        tap(h => {
          const outcome = h ? `fetched` : `did not find`;
          this.log(`${outcome} Ticket id=${id}`);
        }),
        catchError(this.handleError<Ticket>(`getTicket id=${id}`))
      );
  }

  /** GET Ticket by id. Will 404 if id not found */
  getTicket(id: number): Observable<Ticket> {
    const url = `${this.TicketsUrl}/GetTicket/${id}`;
    return this.http.get<Ticket>(url).pipe(
      tap(_ => this.log(`fetched Ticket id=${id}`)),
      catchError(this.handleError<Ticket>(`getTicket id=${id}`))
    );
  }

  /* GET Tickets whose name contains search term */
  searchTickets(term: string): Observable<Ticket[]> {
    if (!term.trim()) {
      // if not search term, return empty Ticket array.
      return of([]);
    }
    return this.http.get<Ticket[]>(`${this.TicketsUrl}/?name=${term}`).pipe(
      tap(_ => this.log(`found Tickets matching "${term}"`)),
      catchError(this.handleError<Ticket[]>('searchTickets', []))
    );
  }

  //////// Save methods //////////

  /** POST: add a new Ticket to the server */
  addTicket (Ticket: Ticket): Observable<Ticket> {
    console.log(Ticket);
    return this.http.post<Ticket>(this.TicketsUrl + "/createTicket", Ticket, this.httpOptions)
    .pipe(
      tap((newTicket: Ticket) => this.log(`added Ticket w/ id=${newTicket.id}`)),
      catchError(this.handleError<any>('registerTicket'))
    );
  }

  /** DELETE: delete the Ticket from the server */
  deleteTicket (Ticket: Ticket | number): Observable<Ticket> {
    const id = typeof Ticket === 'number' ? Ticket : Ticket.id;
    const url = `${this.TicketsUrl}/${id}`;

    return this.http.delete<Ticket>(url, this.httpOptions).pipe(
      tap(_ => this.log(`deleted Ticket id=${id}`)),
      catchError(this.handleError<Ticket>('deleteTicket'))
    );
  }

  /** PUT: update the Ticket on the server */
  updateTicket (Ticket: Ticket): Observable<any> {
    return this.http.put(this.TicketsUrl, Ticket, this.httpOptions).pipe(
      tap(_ => this.log(`updated Ticket id=${Ticket.id}`)),
      catchError(this.handleError<any>('updateTicket'))
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

      // TODO: better job of transforming error for ticket consumption
      this.log(`${operation} failed: ${error.error.message}`);

      // Let the app keep running by returning an empty result.
      return of(result as T);
    };
  }

  /** Log a TicketService message with the MessageService */
  private log(message: string) {
    console.log(`TicketService:` + message);
  }
}

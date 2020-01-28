import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

import { Trip, Contact } from '../models';
@Injectable({
  providedIn: 'root'
})
export class ContactService {

  private ContactsUrl = 'https://localhost:5001/api/Hopfly/contact';  // URL to web api

  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  constructor(
    private http: HttpClient) { }

  /** GET Contacts from the server */
  getContacts (): Observable<Contact[]> {
    return this.http.get<Contact[]>(this.ContactsUrl + '/getcontacts')
      .pipe(
        tap(_ => this.log('fetched Contacts')),
        catchError(this.handleError<Contact[]>('getContacts', []))
      );
  }

  /** GET Contact by id. Return `undefined` when id not found */
  getContactNo404<Data>(id: string): Observable<Contact> {
    const url = `${this.ContactsUrl}/?id=${id}`;
    return this.http.get<Contact[]>(url)
      .pipe(
        map(Contacts => Contacts[0]), // returns a {0|1} element array
        tap(h => {
          const outcome = h ? `fetched` : `did not find`;
          this.log(`${outcome} Contact id=${id}`);
        }),
        catchError(this.handleError<Contact>(`getContact id=${id}`))
      );
  }

  /** GET Contact by id. Will 404 if id not found */
  getContact(id: number): Observable<Contact> {
    const url = `${this.ContactsUrl}/GetContact/${id}`;
    return this.http.get<Contact>(url).pipe(
      tap(_ => this.log(`fetched Contact id=${id}`)),
      catchError(this.handleError<Contact>(`getContact id=${id}`))
    );
  }

  /* GET Contacts whose name contains search term */
  searchContacts(term: string): Observable<Contact[]> {
    if (!term.trim()) {
      // if not search term, return empty Contact array.
      return of([]);
    }
    return this.http.get<Contact[]>(`${this.ContactsUrl}/?name=${term}`).pipe(
      tap(_ => this.log(`found Contacts matching "${term}"`)),
      catchError(this.handleError<Contact[]>('searchContacts', []))
    );
  }

  //////// Save methods //////////

  /** POST: add a new Contact to the server */
  addContact (Contact: Contact): Observable<Contact> {
    console.log(Contact);
    return this.http.post<Contact>(this.ContactsUrl + "/createContact", Contact, this.httpOptions)
    .pipe(
      tap((newContact: Contact) => this.log(`added Contact w/ id=${newContact.id}`)),
      catchError(this.handleError<any>('registerContact'))
    );
  }

  /** DELETE: delete the Contact from the server */
  deleteContact (Contact: Contact | number): Observable<Contact> {
    const id = typeof Contact === 'number' ? Contact : Contact.id;
    const url = `${this.ContactsUrl}/${id}`;

    return this.http.delete<Contact>(url, this.httpOptions).pipe(
      tap(_ => this.log(`deleted Contact id=${id}`)),
      catchError(this.handleError<Contact>('deleteContact'))
    );
  }

  /** PUT: update the Contact on the server */
  updateContact (Contact: Contact): Observable<any> {
    return this.http.put(this.ContactsUrl, Contact, this.httpOptions).pipe(
      tap(_ => this.log(`updated Contact id=${Contact.id}`)),
      catchError(this.handleError<any>('updateContact'))
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

      // TODO: better job of transforming error for contact consumption
      this.log(`${operation} failed: ${error.error.message}`);

      // Let the app keep running by returning an empty result.
      return of(result as T);
    };
  }

  /** Log a ContactService message with the MessageService */
  private log(message: string) {
    console.log(`ContactService:` + message);
  }}

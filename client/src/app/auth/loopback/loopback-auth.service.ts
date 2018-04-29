import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

import { HttpClient, HttpRequest, HttpHeaders, HttpParams, HttpErrorResponse } from '@angular/common/http';

import { Observable } from 'rxjs/Observable';
import { ErrorObservable } from 'rxjs/observable/ErrorObservable';
import { catchError, retry, tap } from 'rxjs/operators';

import 'rxjs/add/observable/of';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/throw';

@Injectable()
export class LoopbackAuthService {

  // private instance variable to hold base url
  private loginUrl = '/api/ApiUsers/login';
  private logoutUrl = '/api/ApiUsers/logout';
  private findByIdUrl = '/api/ApiUsers';
  // key used for saving the token in session storage
  private TOKEN_KEY = 'api-user-token';
  private USER_ID_KEY = 'api-user-id';

  // Resolve HTTP using the constructor
  constructor(private http: HttpClient, private router: Router) { }

  // Function that will indicate if a user is logged in or not.
  public isAuthenticated(): Observable<boolean> {
    let stored = this.get();
    if (stored && stored.token && stored.id) {
      let url = this.findByIdUrl + '/' + stored.id + '/accessTokens/' + stored.token + '?access_token=' + stored.token;
      return this.http.get(url)
        .map((res: any) => {
          // If we get a successful response here, we know the user is logged in.
          return true;
        })
        .catch((error: HttpErrorResponse) => {
          this.destroyToken();
          this.router.navigate(['/login'])
          return Observable.of(false);
        });
    } else {
      this.router.navigate(['/login'])
      return Observable.of(false);
    }
  }

  // Returns an Observable that will make the login request to the server and return the json containing the token
  public login(credentials: any): Observable<any> {
    return this.http.post(this.loginUrl, credentials) // ...using post request
      .map((res) => {
        this.save(res);
        this.router.navigate(['/']);
        return res;
      })
      .catch((error: HttpErrorResponse) => {
        return Observable.throw(error || 'Server error');
      })
  }

  // Returns an Observable that will make the logout request to the server with the token in session storage
  public logout(): Observable<string> {
    let stored = this.get();
    if (stored && stored.token) {
      let url = this.logoutUrl + '?access_token=' + stored.token;
      return this.http.post(url, {})
        .map((res) => {
          this.destroyToken();
          this.router.navigate(['login']);
          return true;
        })
        .catch((error: HttpErrorResponse) => Observable.throw(error));
    }
  }

  // Remove the token from session storage.
  public destroyToken(): boolean {
    let stored = this.get();
    if (stored) {
      sessionStorage.removeItem(this.TOKEN_KEY);
      sessionStorage.removeItem(this.USER_ID_KEY);
      return true;
    }
    return false;
  }

  // Function that will make an authenticated GET request to the server.  
  // If an Unauthenicated is returned by the server, then it will route to the login page.
  // You need a URL and an array of objects that contains a name and value for example [ { name: 'id', value: 1 }]
  public makeAuthenticatedHttpGet(url, queryParams?): Observable<any> {

    let params = new HttpParams().set('access_token', this.get().token)

    if (queryParams && queryParams.length > 0) {
      for (let qp of queryParams) {
        params = params.append(qp.name, qp.value.toString())
      }
    }
    
    return this.http.get(url, { params: params }).pipe(catchError((error, caught) => {
      return this.handleError(error)
    }))
  }

  // Function that will make an authenticated POST request to the server.  
  // If an Unauthenicated is returned by the server, then it will route to the login page.
  public makeAuthenticatedHttpFormDataPost(url, formData, responseType?): Observable<any> {
    
    let params = new HttpParams().set('access_token', this.get().token)

    return this.http.post(url, formData, {
      params: params,
      responseType: responseType || 'json'
    }).pipe(catchError((error, caught) => {
      return this.handleError(error)
    }))
  }

  public makeAuthenticatedHttpUrlEncodedPost(url, encodedString, responseType?, reportProgress?): Observable<any> {
    
    let params = new HttpParams().set('access_token', this.get().token)
    let headers = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded')

    return this.http.post(url, encodedString, {
      params: params,
      headers: headers,
      responseType: responseType || 'json'
    }).pipe(catchError((error, caught) => {
      return this.handleError(error)
    }))
      
  }

  public makeAuthenticatedHttpJsonPost(url, data): Observable<any> {
    let params = new HttpParams().set('access_token', this.get().token);
    let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post(url, data, { params: params }).pipe(catchError((error, caught) => {
      return this.handleError(error)
    }))
  }

  public makeAuthenticatedHttpDelete(url, queryParams?): Observable<any> {

    let params = new HttpParams().set('access_token', this.get().token);

    if (queryParams && queryParams.length > 0) {
      for (let qp of queryParams) {
        params = params.append(qp.name, qp.value.toString())
      }
    }

    return this.http.delete(url, { params: params }).pipe(catchError((error, caught) => {
      return this.handleError(error)
    }))

  }

  // Retrieve the api token from the session storage and null if not found
  get() {
    return {
      token: sessionStorage.getItem(this.TOKEN_KEY),
      id: sessionStorage.getItem(this.USER_ID_KEY)
    }
  }

  // Save the token returned from the login response in session storage
  save(credentials: any) {
    if (credentials && credentials.id) {
      sessionStorage.setItem(this.TOKEN_KEY, credentials.id);
      sessionStorage.setItem(this.USER_ID_KEY, credentials.userId);
    }
  }

  handleError(error: HttpErrorResponse) {
    if (error.status === 401) {
      return this.router.navigate(['login'])
    }
    if (error.error instanceof ErrorEvent) {
      // A client-side or network error occurred. Handle it accordingly.
      console.error('An error occurred:', error.error.message);
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong,
      console.error(
        `Backend returned code ${error.status}, ` +
        `body was: ${this.findErrorMessage(error)}`);
    }
    // return an ErrorObservable with a user-facing error message
    return new ErrorObservable(
      this.findErrorMessage(error));
  }

  findErrorMessage(error) {
    if (error.error) {
      return this.findErrorMessage(error.error)
    }
    if (error.message) {
      return error.message
    }
    return error
  }
}

import { Injectable } from "@angular/core";
import {
  HttpClient,
  HttpHeaders,
  HttpParams,
  HttpErrorResponse
} from "@angular/common/http";
import { tap, catchError } from "rxjs/operators";
import { Observable, from, throwError } from "rxjs";
import * as jwtdecode from "jwt-decode";

@Injectable({
  providedIn: "root"
})
export class UserHttpService {
  constructor(private http: HttpClient) {
    console.log("User service instantiated");
  }

  public token = "";
  public url = "http://localhost:8080";

  login(mail: string, password: string, remember: boolean): Observable<any> {
    console.log("Login: " + mail + " " + password);
    const options = {
      headers: new HttpHeaders({
        authorization: "Basic " + btoa(mail + ":" + password),
        "cache-control": "no-cache",
        "Content-Type": "application/x-www-form-urlencoded"
      })
    };

    return this.http.get(this.url + "/login", options).pipe(
      tap(data => {
        console.log(JSON.stringify(data));
        this.token = data.token;
        if (remember) {
          localStorage.setItem("parking-system_token", this.token);
        }
      })
    );
  }

  renew(): Observable<any> {
    const tk = localStorage.getItem("parking-system_token");
    if (!tk || tk.length < 1) {
      return throwError("No token found in local storage");
    }

    const options = {
      headers: new HttpHeaders({
        Authorization: "Bearer " + tk,
        "cache-control": "no-cache",
        "Content-Type": "application/json"
      })
    };

    console.log("Renewing token");
    return this.http.get(this.url + "/renew", options).pipe(
      tap(data => {
        console.log(JSON.stringify(data));
        this.token = data.token;
        localStorage.setItem("parking-system_token", this.token);
      })
    );
  }

  logout() {
    console.log("Logging out");
    this.token = "";
    localStorage.setItem("parking-system_token", this.token);
  }

  register(user): Observable<any> {
    const options = {
      headers: new HttpHeaders({
        authorization: "Bearer " + this.get_token(),
        "cache-control": "no-cache",
        "Content-Type": "application/json"
      })
    };

    return this.http.post(this.url + "/users", user, options).pipe(
      tap(data => {
        console.log(JSON.stringify(data));
      })
    );
  }

  get_token() {
    // setTimeout(() => {
    //   console.log(jwtdecode(this.token));
    // }, 1000);
    return this.token;
  }

  get_username() {
    return jwtdecode(this.token).username;
  }

  get_mail() {
    return jwtdecode(this.token).mail;
  }

  get_id() {
    return jwtdecode(this.token).id;
  }

  is_admin(): boolean {
    const roles = jwtdecode(this.token).roles;
    for (let idx = 0; idx < roles.length; ++idx) {
      if (roles[idx] === "ADMIN") {
        return true;
      }
    }
    return false;
  }

  is_moderator(): boolean {
    const roles = jwtdecode(this.token).roles;
    for (let idx = 0; idx < roles.length; ++idx) {
      if (roles[idx] === "MODERATOR") {
        return true;
      }
    }
    return false;
  }

  create_options(params = {}) {
    return {
      headers: new HttpHeaders({
        authorization: "Bearer " + this.get_token(),
        "cache-control": "no-cache",
        "Content-Type": "application/json"
      }),
      params: new HttpParams({ fromObject: params })
    };
  }
  //{ limit: "10", skip: "0" }

  get_users(): Observable<any> {
    return this.http
      .get<any[]>(this.url + "/users", this.create_options())
      .pipe(tap(data => console.log(JSON.stringify(data))));
  }

  delete_user(username: string): Observable<any> {
    return this.http
      .delete<any>(this.url + "/users/" + username, this.create_options())
      .pipe(tap(data => console.log(JSON.stringify(data))));
  }
}

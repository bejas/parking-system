import { Injectable } from "@angular/core";
import {
  HttpClient,
  HttpHeaders,
  HttpParams,
  HttpErrorResponse
} from "@angular/common/http";
import { tap, catchError } from "rxjs/operators";
import { Observable } from "rxjs";
import { Car } from "./Car";
import { UserService } from "./user.service";

@Injectable({
  providedIn: "root"
})
export class CarHttpService {
  constructor(private http: HttpClient, private us: UserService) {
    console.log("Car service instatiated");
  }

  public url = "http://localhost:8080";
  //public url = "http://192.168.1.50:8080";

  getCarInfo(plate: string): Observable<Car> {
    console.log("Get car info for plate: " + plate);

    const options = {
      headers: new HttpHeaders({
        "cache-control": "no-cache",
        "Content-Type": "application/x-www-form-urlencoded"
      })
    };

    return this.http.get<Car>(this.url + "/payment/" + plate, options).pipe(
      tap(data => {
        console.log(JSON.stringify(data));
      })
    );
  }

  makePayment(plate: string): Observable<Car> {
    console.log("Making payment for: " + plate);

    const options = {
      headers: new HttpHeaders({
        "cache-control": "no-cache",
        "Content-Type": "application/x-www-form-urlencoded"
      })
    };

    return this.http.post<Car>(this.url + "/payment/" + plate, options).pipe(
      tap(data => {
        console.log(JSON.stringify(data));
      })
    );
  }

  private create_options(params = {}) {
    return {
      headers: new HttpHeaders({
        authorization: "Bearer " + this.us.get_token(),
        "cache-control": "no-cache",
        "Content-Type": "application/json"
      }),
      params: new HttpParams({ fromObject: params })
    };
  }
  //{ limit: "10", skip: "0" }

  get_cars(params = {}): Observable<Car[]> {
    return this.http
      .get<Car[]>(this.us.url + "/cars", this.create_options(params))
      .pipe(
        tap(data => {
          console.log(JSON.stringify(data));
        })
      );
  }
}

import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { tap } from "rxjs/operators";
import { Observable } from "rxjs";
import { Car } from "./Car";

@Injectable({
  providedIn: "root"
})
export class CarHttpService {
  constructor(private http: HttpClient) {
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
}

import { Component, OnInit } from "@angular/core";
import { SocketioService } from "../socketio.service";
import { UserService } from "../user.service";
import { CarHttpService } from "../car-http.service";
import { Car } from "../Car";
import { Router, ActivatedRoute } from "@angular/router";
// import { CarService } from "../car.service";

@Component({
  selector: "app-cars",
  templateUrl: "./cars.component.html",
  styleUrls: ["./cars.component.css"]
})
export class CarsComponent implements OnInit {
  private cars: Car[] = [];
  public queryParams;

  pageOfItems: Array<Car>;

  constructor(
    private sio: SocketioService,
    private cs: CarHttpService,
    private us: UserService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  onChangePage(pageOfItems: Array<Car>) {
    // update current page of items
    this.pageOfItems = pageOfItems;
  }

  ngOnInit() {
    //console.log(this.us.get_mail());
    // setTimeout(function() {
    //   console.log(this.us);
    // }, 3000);

    // get query params
    this.queryParams = this.route.snapshot.queryParams;

    this.get_cars();
    this.sio.connect().subscribe(m => {
      console.log(m); //
      this.get_cars();
    });
  }

  //{ limit: "10", skip: "0" }

  public get_cars() {
    this.cs.get_cars(this.queryParams).subscribe(
      cars => {
        this.cars = cars;
      },
      err => {
        // Try to renew the token
        this.us.renew().subscribe(
          () => {
            // Succeeded
            this.get_cars();
          },
          err2 => {
            // Error again, we really need to logout
            this.logout();
          }
        );
      }
    );
  }

  logout() {
    this.us.logout();
    this.router.navigate(["/"]);
  }
}

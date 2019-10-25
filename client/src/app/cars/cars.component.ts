import { Component, OnInit, EventEmitter, Output } from "@angular/core";
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
  private events: string[] = [];
  public queryParams;
  private pageOfItems: Array<Car> = [];

  constructor(
    private sio: SocketioService,
    private cs: CarHttpService,
    private us: UserService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.router.routeReuseStrategy.shouldReuseRoute = function() {
      return false;
    };
  }

  // @Output() posted = new EventEmitter();

  // emit_event() {
  //   console.log("Button clicked.");
  //   this.sio.socket.emit("getCar", "hello get car");
  // }

  onChangePage(pageOfItems: Array<Car>) {
    // update current page of items
    this.pageOfItems = pageOfItems;
  }

  ngOnInit() {
    // get query params
    this.queryParams = this.route.snapshot.queryParams;

    this.get_cars();
    // setInterval(() => {
    //   this.get_cars();
    // }, 1000);

    this.sio.connect().subscribe(m => {
      //console.log(m); //
      this.events.push(m);
      if (this.events.length > 19) {
        this.events.shift();
      }
      this.get_cars();
    });
  }

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

  search(plate) {
    if (this.route.snapshot.queryParams.inside == "true") {
      this.router.navigate(["/cars"], {
        queryParams: { plate: plate, inside: true }
      });
    } else {
      this.router.navigate(["/cars"], { queryParams: { plate: plate } });
    }
  }

  logout() {
    this.us.logout();
    this.router.navigate(["/"]);
  }
}

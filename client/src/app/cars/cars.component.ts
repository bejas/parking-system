import { Component, OnInit } from "@angular/core";
import { SocketioService } from "../socketio.service";
import { UserService } from "../user.service";
import { CarHttpService } from "../car-http.service";
import { Car } from "../Car";
import { Router, ActivatedRoute } from "@angular/router";

@Component({
  selector: "app-cars",
  templateUrl: "./cars.component.html",
  styleUrls: ["./cars.component.css"]
})
export class CarsComponent implements OnInit {
  private cars: Car[] = [];

  constructor(
    private sio: SocketioService,
    private cs: CarHttpService,
    private us: UserService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      console.log(params);
    });
    this.get_cars();
    this.sio.connect().subscribe(m => {
      this.get_cars();
    });
  }

  //{ limit: "10", skip: "0" }

  public get_cars() {
    this.cs.get_cars().subscribe(
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

import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { CarHttpService } from "../car-http.service";

@Component({
  selector: "app-payment-info",
  templateUrl: "./payment-info.component.html",
  styleUrls: ["./payment-info.component.css"]
})
export class PaymentInfoComponent implements OnInit {
  private plate: string;
  private car;

  constructor(
    private route: ActivatedRoute,
    private cs: CarHttpService,
    private router: Router
  ) {
    this.route.params.subscribe(params => {
      this.plate = params.plate;
      this.cs.getCarInfo(this.plate).subscribe(data => (this.car = data));
    });
  }

  ngOnInit() {}

  makePayment() {
    console.log("p");
    this.cs.makePayment(this.car.plate).subscribe(data => {
      console.log(JSON.stringify(data));
      setTimeout(() => {
        location.reload();
      }, 1000);
    });
  }
}

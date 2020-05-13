import { Component, OnInit } from "@angular/core";
import { LoggerService } from "../logger.service";
import { UserService } from "../user.service";
import { Router } from "@angular/router";

@Component({
  selector: "app-user-login",
  templateUrl: "./user-login.component.html",
  styleUrls: ["./user-login.component.css"],
})
export class UserLoginComponent implements OnInit {
  errmessage = undefined;
  constructor(
    private logger: LoggerService,
    private us: UserService,
    private router: Router
  ) {}

  ngOnInit() {
    this.logger.log("user-login component started");

    this.us.renew().subscribe(
      (d) => {
        console.log("Renew succeded: " + JSON.stringify(d));
        this.router.navigate(["/cars"]);
      },
      (err) => {
        console.log("Renew error: " + JSON.stringify(err.error));
      }
    );
  }

  login(mail: string, password: string, remember: boolean) {
    this.us.login(mail, password, remember).subscribe(
      (d) => {
        console.log("Login granted: " + JSON.stringify(d));
        console.log("User service token: " + this.us.get_token());
        this.errmessage = undefined;
        this.router.navigate(["/cars"]);
      },
      (err) => {
        console.log("Login error: " + JSON.stringify(err.error.errorMessage));
        this.errmessage = err.error.errorMessage;
      }
    );
  }
}

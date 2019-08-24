import { Component, OnInit } from "@angular/core";
import { SocketioService } from "../socketio.service";
import { UserService } from "../user.service";
import { Router, ActivatedRoute } from "@angular/router";

@Component({
  selector: "app-users",
  templateUrl: "./users.component.html",
  styleUrls: ["./users.component.css"]
})
export class UsersComponent implements OnInit {
  private users = [];

  constructor(
    private sio: SocketioService,
    private us: UserService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.get_users();
    this.sio.connect().subscribe(m => {
      console.log(m); //
      this.get_users();
    });
  }

  public get_users() {
    this.us.get_users().subscribe(
      users => {
        this.users = users;
      },
      err => {
        // Try to renew the token
        this.us.renew().subscribe(
          () => {
            // Succeeded
            this.get_users();
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

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
  private modalIndex = 0;

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

  public setModalIndex(username) {
    for (var i = 0; i < this.users.length; i++) {
      if (this.users[i].username == username) {
        this.modalIndex = i;
      }
    }
  }

  public get_users() {
    // setInterval(() => {
    //   console.log(this.modalEditIndex);
    // }, 1000);
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

  public delete_user(username) {
    this.us.delete_user(username).subscribe(data => {
      console.log(data);
      setTimeout(() => {
        location.reload();
      }, 500);
    });
  }

  logout() {
    this.us.logout();
    this.router.navigate(["/"]);
  }
}

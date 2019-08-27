import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { HttpClientModule } from "@angular/common/http";

import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { UserLoginComponent } from "./user-login/user-login.component";
import { PaymentComponent } from "./payment/payment.component";
import { RouterModule } from "@angular/router";

// Services
import { LoggerService } from "./logger.service";
import { AdminPanelComponent } from "./admin-panel/admin-panel.component";
import { CarsComponent } from "./cars/cars.component";
import { UserService } from "./user.service";
import { UserHttpService } from "./user-http.service";
import { SocketioService } from "./socketio.service";
import { PaymentInfoComponent } from "./payment-info/payment-info.component";
import { CarHttpService } from "./car-http.service";
import { JwAngularPaginationComponent } from "./jw-angular-pagination/jw-angular-pagination.component";
import { UsersComponent } from "./users/users.component";

@NgModule({
  declarations: [
    AppComponent,
    UserLoginComponent,
    PaymentComponent,
    AdminPanelComponent,
    CarsComponent,
    PaymentInfoComponent,
    JwAngularPaginationComponent,
    UsersComponent
  ],
  imports: [BrowserModule, FormsModule, HttpClientModule, AppRoutingModule],
  providers: [
    { provide: LoggerService, useClass: LoggerService },
    { provide: UserService, useClass: UserHttpService },
    { provide: SocketioService, useClass: SocketioService },
    { provide: CarHttpService, useClass: CarHttpService }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}

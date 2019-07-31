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

@NgModule({
  declarations: [
    AppComponent,
    UserLoginComponent,
    PaymentComponent,
    AdminPanelComponent,
    CarsComponent
  ],
  imports: [BrowserModule, FormsModule, HttpClientModule, AppRoutingModule],
  providers: [
    { provide: LoggerService, useClass: LoggerService },
    { provide: UserService, useClass: UserHttpService },
    { provide: SocketioService, useClass: SocketioService }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}

import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { UserLoginComponent } from "./user-login/user-login.component";
import { PaymentComponent } from "./payment/payment.component";
import { CarsComponent } from "./cars/cars.component";
import { PaymentInfoComponent } from "./payment-info/payment-info.component";
import { UsersComponent } from "./users/users.component";

const routes: Routes = [
  { path: "", redirectTo: "/payment", pathMatch: "full" },
  { path: "payment", component: PaymentComponent },
  { path: "payment/:plate", component: PaymentInfoComponent },
  { path: "login", component: UserLoginComponent },
  { path: "cars", component: CarsComponent },
  { path: "users", component: UsersComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}

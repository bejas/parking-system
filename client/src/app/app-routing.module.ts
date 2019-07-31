import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { UserLoginComponent } from "./user-login/user-login.component";
import { PaymentComponent } from "./payment/payment.component";
import { CarsComponent } from "./cars/cars.component";

const routes: Routes = [
  { path: "", redirectTo: "/payment", pathMatch: "full" },
  { path: "payment", component: PaymentComponent },
  { path: "login", component: UserLoginComponent },
  { path: "cars", component: CarsComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}

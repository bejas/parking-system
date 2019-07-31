import { Component } from "@angular/core";
import { LoggerService } from "./logger.service";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"]
})
export class AppComponent {
  title = "client";

  constructor(private logger: LoggerService) {}
}

import { Injectable } from "@angular/core";

@Injectable({
  providedIn: "root"
})
export class LoggerService {
  constructor() {}

  public log(message: string) {
    console.log(new Date().toLocaleTimeString() + ": " + message);
  }
}

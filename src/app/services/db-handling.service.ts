import { Injectable } from "@angular/core";
import { ICCDBHandler } from "src/dbHandlers/dbHandler";
import { LocalForageHandler } from "src/dbHandlers/localForageHandler";

@Injectable({
  providedIn: "root"
})
export class DbHandlingService {
  db: ICCDBHandler = new LocalForageHandler();
}

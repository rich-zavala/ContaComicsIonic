import { Injectable } from "@angular/core";
import { ICCDBHandler } from "src/dbHandlers/dbHandler";
import { IndexedDB } from "src/dbHandlers/indexedDB";

@Injectable({
  providedIn: "root"
})
export class DbHandlingService {
  db: ICCDBHandler = new IndexedDB();
}

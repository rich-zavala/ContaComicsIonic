import { Injectable } from "@angular/core";
import { ICCDBHandler } from "src/dbHandlers/dbHandler";
import { AngularFirestore } from "angularfire2/firestore";
import { FireBaseHandler } from "src/dbHandlers/firebaseHandler";

@Injectable({
  providedIn: "root"
})
export class DbHandlingService {
  db: ICCDBHandler;
  constructor(ngFirestone: AngularFirestore) {
    this.db = new FireBaseHandler(ngFirestone);
  }
}

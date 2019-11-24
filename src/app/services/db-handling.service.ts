import { Injectable } from "@angular/core";
import { ICCDBHandler } from "src/dbHandlers/dbHandler";
import { AngularFirestore } from "@angular/fire/firestore";
import { FireBaseHandler } from "src/dbHandlers/firestoreHandler";

@Injectable({
  providedIn: "root"
})
export class DbHandlingService {
  db: ICCDBHandler;
  constructor(ngFirestone: AngularFirestore) {
    this.db = new FireBaseHandler(ngFirestone);
  }
}

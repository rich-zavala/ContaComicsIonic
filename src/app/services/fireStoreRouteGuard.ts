import { Injectable } from "@angular/core";
import { AngularFirestore } from "@angular/fire/firestore";
import * as Rx from "rxjs";
import { map } from "rxjs/operators";

/**
 * This guard ensures that the offline mode for Firestone
 * is available prior to access the DB library
 */
@Injectable({
    providedIn: "root"
})
export class FireStoreRouteGuard {
    private isInit = false;

    constructor(private db: AngularFirestore) { }

    private init(): Rx.Observable<boolean> {
        return Rx.from(this.db.firestore.enablePersistence())
            .pipe(map(() => {
                this.isInit = true;
                return this.isInit;
            }));
    }

    canActivate(): Rx.Observable<boolean> {
        return this.isInit ? Rx.of(true) : this.init();
    }
}

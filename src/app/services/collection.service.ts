import { Injectable } from "@angular/core";
import { AlertController } from "@ionic/angular";
import { Dialogs } from "@ionic-native/dialogs/ngx";

import * as Rx from "rxjs";
import { map } from "rxjs/operators";

import { DbHandlingService } from "./db-handling.service";

import { ICCYear, CCRecord, ICCSerie } from "src/models";
import { IDeleteRecordResponse, IInsertRecordResponse } from "src/dbHandlers/dbHandler";
@Injectable({
    providedIn: "root"
})
export class CollectionService {
    years$: Rx.Subject<ICCYear[]> = new Rx.Subject();
    series$: Rx.Subject<ICCSerie[]> = new Rx.Subject();
    insertedRecord$: Rx.Subject<CCRecord> = new Rx.Subject();
    updatedRecord$: Rx.Subject<CCRecord> = new Rx.Subject();
    deletedRecord$: Rx.Subject<IDeleteRecordResponse> = new Rx.Subject();

    constructor(
        private db: DbHandlingService,
        private alertController: AlertController,
        private dialogs: Dialogs
    ) { }

    updateYears() {
        this.db.db.getYears().subscribe(d => this.years$.next(d));
    }

    getDayRecords(day: string) {
        return this.db.db.getRecordsByDay(day);
    }

    getYearDates(year: number) {
        return this.db.db.getYearDays(year);
    }

    updateSeries() {
        this.getSeries().subscribe(d => this.series$.next(d));
    }

    getSeries() {
        return this.db.db.getSeries();
    }

    getRecord(id: string) {
        return this.db.db.getRecord(id);
    }

    insert(cc: CCRecord): Rx.Observable<IInsertRecordResponse> {
        return this.db.db.insert(cc).pipe(
            map(insertResult => {
                if (!insertResult.duplicate) {
                    this.updateYears();
                    this.updateSeries();
                    this.insertedRecord$.next(insertResult.record);
                }
                return insertResult;
            })
        );
    }

    uncheck(cc: CCRecord, emmit: boolean): Rx.Observable<boolean> {
        const header = "Are you sure?";
        const subHeader = "Please confirm this action";
        const buttons = ["Keep it", "Uncheck it"];

        return new Rx.Observable(observer => {
            const resolve = (value: boolean) => {
                observer.next(value);
                observer.complete();
            };
            const uncheck = () => {
                cc.uncheck();
                this.updateRecord(cc, emmit);
                resolve(true);
            };
            const revert = () => resolve(false);
            const alternativeDialog = async () => {
                const alert = await this.alertController.create({
                    header,
                    buttons: [
                        {
                            text: buttons[1],
                            cssClass: "secondary",
                            handler: () => {
                                cc.uncheck();
                                this.updateRecord(cc, emmit);
                                resolve(true);
                            }
                        },
                        {
                            text: buttons[0],
                            role: "cancel",
                            handler: () => revert()
                        }]
                });

                await alert.present();
            };

            try {
                Rx.from(this.dialogs.confirm(subHeader, header, buttons))
                    .subscribe(
                        option => {
                            if (option === 1) {
                                revert();
                            } else {
                                uncheck();
                            }
                        },
                        e => {
                            console.log("Error displaying dialog", e);
                            alternativeDialog();
                        }
                    );
            } catch (e) {
                alternativeDialog();
            }
        });
    }

    updateRecord(cc: CCRecord, emmit: boolean) {
        return this.db.db.update(cc)
            .subscribe(
                () => {
                    if (emmit) {
                        this.updatedRecord$.next(cc);
                    }
                }
            );
    }

    deleteRecord(cc: CCRecord) {
        return this.db.db.delete(cc)
            .subscribe(
                data => {
                    if (data.yearDeleted) {
                        this.updateYears();
                    }
                    this.deletedRecord$.next(data);
                }
            );
    }

    clear(): Rx.Observable<boolean> {
        return this.db.db.clear();
    }
}

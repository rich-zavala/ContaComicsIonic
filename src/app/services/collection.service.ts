import { Injectable } from "@angular/core";
import { AlertController } from "@ionic/angular";
import * as Rx from "rxjs";

import { DbHandlingService } from "./db-handling.service";

import { ICCYear, CCRecord, ICCRecord, ICCSerie } from "src/models";
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
        private alertController: AlertController
    ) { }

    updateYears() {
        this.getYears().subscribe(d => this.years$.next(d));
    }

    getYearDates(year: number) {
        return this.db.db.getYearDays(year);
    }

    private getYears() {
        return this.db.db.getYears();
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

    insert(cc: ICCRecord): Rx.Observable<IInsertRecordResponse> {
        return new Rx.Observable(observer => {
            this.db.db.insert(cc).subscribe(
                insertResult => {
                    if (!insertResult.duplicate) {
                        this.updateYears();
                        this.updateSeries();
                        this.insertedRecord$.next(new CCRecord(insertResult.record));
                    }
                    observer.next(insertResult);
                    observer.complete();
                }
            );
        });
    }

    uncheck(cc: CCRecord, emmit: boolean): Rx.Observable<boolean> {
        return new Rx.Observable(observer => {
            const resolve = (value: boolean) => {
                observer.next(value);
                observer.complete();
            };

            (async () => {
                const alert = await this.alertController.create({
                    header: "Are you sure?",
                    buttons: [
                        {
                            text: "Uncheck it",
                            cssClass: "secondary",
                            handler: () => {
                                cc.uncheck();
                                this.updateRecord(cc, emmit);
                                resolve(true);
                            }
                        },
                        {
                            text: "Keep it",
                            role: "cancel",
                            handler: () => resolve(false)
                        }]
                });

                await alert.present();
            })();
        });
    }

    updateRecord(cc: CCRecord, emmit: boolean) {
        return this.db.db.update(cc.insertable())
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
                    } else {
                        this.deletedRecord$.next(data);
                    }
                }
            );
    }
}

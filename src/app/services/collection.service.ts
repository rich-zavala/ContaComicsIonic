import { Injectable } from "@angular/core";
import { AlertController } from '@ionic/angular';
import * as Rx from "rxjs";

import { DbHandlingService } from "./db-handling.service";

import { ICCYear } from "src/models/year";
import { ICCDay } from "src/models/day";
import { CCRecord, ICCRecord } from "src/models/record";
import { IDeleteRecordResponse, IInsertRecordResponse } from 'src/dbHandlers/dbHandler';

@Injectable({
    providedIn: "root"
})
export class CollectionService {
    years: Rx.Subject<ICCYear[]> = new Rx.Subject();
    // dates: Subject<ICCDay[]> = new Subject();
    updatedRecord: Rx.Subject<CCRecord> = new Rx.Subject();
    deletedRecord: Rx.Subject<IDeleteRecordResponse> = new Rx.Subject();

    constructor(
        private db: DbHandlingService,
        private alertController: AlertController
    ) { }

    updateYears() {
        this.getYears().subscribe(d => this.years.next(d));
    }

    private getYears() {
        return this.db.db.getYears();
    }

    getYearDates(year: number) {
        return this.db.db.getDays(year);
    }

    getRecord(id: string) {
        return this.db.db.getRecord(id);
    }

    getSeries() {
        return this.db.db.getSeries();
    }

    insert(cc: ICCRecord): Rx.Observable<IInsertRecordResponse> {
        return new Rx.Observable(observer => {
            this.db.db.insert(cc).subscribe(
                insertResult => {
                    if (!insertResult.duplicate) {
                        // this.updatedRecord.next(insertResult.record);
                        this.updateYears();
                    }
                    observer.next(insertResult);
                    observer.complete();
                }
            );
        });
    }

    async uncheck(cc: CCRecord) {
        const alert = await this.alertController.create({
            header: "Are you sure?",
            buttons: [
                {
                    text: "Uncheck it",
                    cssClass: "secondary",
                    handler: () => {
                        cc.uncheck();
                        this.updateRecord(cc);
                    }
                },
                {
                    text: "Keep it",
                    role: "cancel"
                }]
        });

        await alert.present();
    }

    updateRecord(cc: CCRecord) {
        return this.db.db.update(cc.insertable())
            .subscribe(
                () => this.updatedRecord.next(cc)
            );
    }

    deleteRecord(cc: CCRecord) {
        return this.db.db.delete(cc)
            .subscribe(
                data => {
                    if (data.yearDeleted) {
                        this.updateYears();
                    } else {
                        this.deletedRecord.next(data);
                    }
                }
            );
    }
}

import { AngularFirestore, AngularFirestoreCollection } from "@angular/fire/firestore";

import { ICCDBHandler, IInsertRecordResponse, IDeleteRecordResponse } from "./dbHandler";
import { ICCRecord, CCRecord, ICCDay, ICCYear, ICCSerie } from "src/models";

import * as Rx from "rxjs";
import { toArray, catchError, map, flatMap, delay } from "rxjs/operators";
import * as lodash from "lodash";
import * as moment from "moment";

export class FireBaseHandler implements ICCDBHandler {
    private dbSeries: AngularFirestoreCollection<ICCSerie>;
    private dbYears: AngularFirestoreCollection<ICCYear>;
    private dbDays: AngularFirestoreCollection<ICCDay>;
    private dbRecords: AngularFirestoreCollection<ICCRecord>;

    constructor(db: AngularFirestore) {
        this.dbSeries = db.collection<ICCSerie>("series");
        this.dbYears = db.collection<ICCYear>("years");
        this.dbDays = db.collection<ICCDay>("days");
        this.dbRecords = db.collection<ICCRecord>("records");
    }

    insert(cc: CCRecord): Rx.Observable<IInsertRecordResponse> {
        const resp: IInsertRecordResponse = { duplicate: false, record: null };
        return this.insertRecord(cc)
            .pipe(
                catchError((dbData => {
                    resp.duplicate = true;
                    resp.record = new CCRecord(dbData);
                    return Rx.of(null);
                })),
                map(() => {
                    resp.record = cc;
                    return null;
                }),
                map(() => resp)
            );
    }

    private insertRecord(cc: CCRecord): Rx.Observable<CCRecord> {
        return this.getRecord(cc.id)
            .pipe(
                flatMap(record => {
                    if (record) {
                        return Rx.throwError(record);
                    } else {
                        return Rx.merge(
                            Rx.from(this.dbRecords.doc(cc.id).set(cc.insertable())),
                            this.insertYear(cc),
                            this.insertDay(cc),
                            this.insertSerie(cc)
                        );
                    }
                }),
                toArray(),
                map(() => cc)
            );
    }

    private insertYear(cc: CCRecord): Rx.Observable<ICCYear> {
        const year = cc.getPublishYear();
        const day = cc.publishDate;
        return Rx.from(this.getYear(year)).pipe(
            flatMap(yearData => {
                if (yearData) {
                    yearData.days.push(day);
                    yearData.days = lodash.uniq(yearData.days);
                    yearData.total += cc.price;
                } else {
                    yearData = {
                        year,
                        days: [day],
                        total: cc.price
                    };
                }
                return Rx.from(this.dbYears.doc(year.toString()).set(yearData))
                    .pipe(map(() => yearData));
            })
        );
    }

    private getYear(year: number): Rx.Observable<ICCYear> {
        return Rx.from(this.dbYears.doc(year.toString()).get()).pipe(
            map(yearData => yearData.exists ? yearData.data() as ICCYear : undefined)
        );
    }

    private insertDay(cc: CCRecord): Rx.Observable<ICCDay> {
        const date = cc.publishDate;
        return Rx.from(this.getDay(date)).pipe(
            flatMap(dayData => {
                if (dayData) {
                    dayData.records.push(cc.id);
                    dayData.records = lodash.uniq(dayData.records);
                    dayData.total += cc.price;
                } else {
                    dayData = {
                        date,
                        year: moment(date).year(),
                        records: [cc.id],
                        total: cc.price
                    };
                }
                return Rx.from(this.dbDays.doc(date).set(dayData))
                    .pipe(map(() => dayData));
            })
        );
    }

    private insertSerie(cc: CCRecord): Rx.Observable<ICCSerie> {
        return Rx.from(this.dbSeries.doc(cc.title).get()).pipe(
            map(record => record.exists ? record.data() as ICCSerie : undefined),
            flatMap(serieData => {
                if (serieData) {
                    serieData.records.push(cc.id);
                    serieData.records = lodash.uniq(serieData.records);
                    serieData.total += cc.price;
                } else {
                    serieData = {
                        name: cc.title,
                        records: [cc.id],
                        total: cc.price
                    };
                }
                return Rx.from(this.dbSeries.doc(cc.title).set(serieData))
                    .pipe(map(() => serieData));
            })
        );
    }

    update(data: CCRecord): Rx.Observable<CCRecord> {
        const recordData = data.insertable();
        return Rx.from(this.dbRecords.doc(recordData.id).set(recordData)).pipe(
            map(() => data)
        );
    }

    delete(cc: CCRecord): Rx.Observable<IDeleteRecordResponse> {
        const resp: IDeleteRecordResponse = {
            record: cc.insertable(),
            recordDeleted: false,
            dayDeleted: false,
            yearDeleted: false,
            serieDeleted: false,
            dayTotal: 0,
            yearTotal: 0,
            serieTotal: 0,
            recordYear: cc.getPublishYear(),
            recordDate: cc.publishDate
        };

        const dayStr = cc.publishDate;
        const sequentialUpdates: Rx.Observable<any>[] = [];
        return Rx.from(Rx.from(this.dbRecords.doc(cc.id).delete())).pipe(
            flatMap(() => {
                resp.recordDeleted = true;
                return Rx.from(this.dbSeries.doc(cc.title).get()).pipe(map(data => data.data() as ICCSerie));
            }),
            flatMap(serieData => {
                serieData.records.splice(serieData.records.indexOf(cc.id), 1);
                if (serieData.records.length > 0) {
                    serieData.total -= cc.price;
                    resp.serieTotal = serieData.total;
                    sequentialUpdates.push(Rx.from(this.dbSeries.doc(serieData.name).set(serieData)));
                } else {
                    resp.serieDeleted = true;
                    sequentialUpdates.push(Rx.from(this.dbSeries.doc(serieData.name).delete()));
                }
                return Rx.from(this.dbDays.doc(dayStr).get()).pipe(map(data => data.data() as ICCDay));
            }),
            flatMap(dayData => {
                dayData.records.splice(dayData.records.findIndex(rId => rId === cc.id), 1);
                if (dayData.records.length > 0) {
                    dayData.total -= cc.price;
                    resp.dayTotal = dayData.total;
                    sequentialUpdates.push(Rx.from(this.dbDays.doc(dayData.date).set(dayData)));
                    return Rx.of(null);
                } else {
                    resp.dayDeleted = true;
                    sequentialUpdates.push(Rx.from(this.dbDays.doc(dayStr).delete()));
                    const year: string = cc.getPublishYear().toString(); // DB stores as number but argument is expected as string
                    return Rx.from(this.dbYears.doc(year).get()).pipe(map(data => data.data() as ICCYear)).pipe(
                        flatMap(yearData => {
                            yearData.days.splice(yearData.days.indexOf(dayStr), 1);
                            if (yearData.days.length > 0) {
                                yearData.total -= cc.price;
                                resp.yearTotal = yearData.total;
                                sequentialUpdates.push(Rx.from(this.dbYears.doc(year).set(yearData)));
                            } else {
                                resp.yearDeleted = true;
                                sequentialUpdates.push(Rx.from(this.dbYears.doc(year).delete()));
                            }
                            return Rx.of(null);
                        })
                    );
                }
            }),
            flatMap(() => Rx.merge(...sequentialUpdates)),
            toArray(),
            map(() => resp)
        );
    }

    getYears(): Rx.Observable<ICCYear[]> {
        return Rx.from(this.dbYears.get()).pipe(
            map(collection => collection.docs.map(yRecord => yRecord.data() as ICCYear).reverse())
        );
    }

    getYearDays(year: number): Rx.Observable<ICCDay[]> {
        return Rx.from(this.dbDays.ref.where("year", "==", year).get()).pipe(
            map(collection => collection.docs.map(dRecord => dRecord.data() as ICCDay)),
            map(days => lodash.sortBy(days, "date").reverse())
        );
    }

    getDay(day: string): Rx.Observable<ICCDay> {
        return Rx.from(this.dbDays.doc(day).get()).pipe(
            map(record => record.exists ? record.data() as ICCDay : undefined)
        );
    }

    getSeries(): Rx.Observable<ICCSerie[]> {
        return Rx.from(this.dbSeries.get()).pipe(
            map(collection => collection.docs.map(sRecord => sRecord.data() as ICCSerie))
        );
    }

    getRecord(id: string): Rx.Observable<CCRecord> {
        return Rx.from(this.dbRecords.doc(id).get()).pipe(map(record => {
            if (record.exists) {
                return new CCRecord(record.data() as ICCRecord);
            } else {
                return undefined;
            }
        }));
    }

    getRecordsByDay(publishDate: string): Rx.Observable<CCRecord[]> {
        return Rx.from(this.dbRecords.ref.where("publishDate", "==", publishDate).get()).pipe(
            map(collection => collection.docs.map(ccRecord => new CCRecord(ccRecord.data() as ICCRecord))),
            map(records => lodash.sortBy(records, r => r.recordDate).reverse())
        );
    }

    clear(): Rx.Observable<boolean> {
        return Rx.from(this.dbSeries.get()).pipe(
            map(serieData => serieData.docs.map(s => s.data() as ICCSerie)),
            flatMap(serieData => {
                const delObs: Rx.Observable<IDeleteRecordResponse>[] = [];
                serieData.forEach(serie => delObs.push(...serie.records.map(recordId =>
                    this.getRecord(recordId).pipe(
                        map(record => {
                            console.log("Deleting", record.id);
                            return record;
                        }),
                        flatMap(record => this.delete(record))
                    )
                )));
                return Rx.concat(...delObs);
            }),
            toArray(),
            map(() => {
                console.log("Clear has finished");
                return true;
            })
        );
    }
}

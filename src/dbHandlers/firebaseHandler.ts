import { AngularFirestore, AngularFirestoreCollection } from "angularfire2/firestore";

import { ICCDBHandler, IInsertRecordResponse, IDeleteRecordResponse } from "./dbHandler";
import { ICCRecord, CCRecord, ICCDay, ICCYear, ICCSerie } from "src/models";

import * as Rx from "rxjs";
import { toArray, catchError, map, flatMap } from "rxjs/operators";
import * as lodash from "lodash";
import * as moment from "moment";

export class FireBaseHandler implements ICCDBHandler {
    dbSeries: AngularFirestoreCollection<ICCSerie>;
    dbYears: AngularFirestoreCollection<ICCYear>;
    dbDays: AngularFirestoreCollection<ICCDay>;
    dbRecords: AngularFirestoreCollection<ICCRecord>;

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
        return Rx.of(data);
    }

    delete(data: ICCRecord): Rx.Observable<IDeleteRecordResponse> {
        return Rx.of(null);
    }

    getYears(): Rx.Observable<ICCYear[]> {
        return Rx.from(this.dbYears.get()).pipe(
            map(collection => collection.docs.map(yRecord => yRecord.data() as ICCYear))
        );
    }

    getYearDays(year: number): Rx.Observable<ICCDay[]> {
        return Rx.from(this.dbDays.ref.where("year", "==", year).get()).pipe(
            map(collection => collection.docs.map(dRecord => dRecord.data() as ICCDay))
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
        return Rx.of(true);
    }
}

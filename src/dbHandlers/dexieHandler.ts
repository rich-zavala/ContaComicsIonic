import { ICCDBHandler, IInsertRecordResponse, IDeleteRecordResponse } from "./dbHandler";
import { ICCRecord, CCRecord, ICCDay, ICCYear, ICCSerie } from "src/models";

import * as Rx from "rxjs";
import { toArray, catchError, map, flatMap } from "rxjs/operators";
import * as lodash from "lodash";
import * as moment from "moment";
import Dexie from "dexie";

export class DexieHandler implements ICCDBHandler {
    private dexie: Dexie;
    dbYears: Dexie.Table<ICCYear, string>;
    dbDays: Dexie.Table<ICCDay, string>;
    dbRecords: Dexie.Table<ICCRecord, string>;
    dbSeries: Dexie.Table<ICCSerie, string>;

    constructor() {
        this.dexie = new Dexie("ContaComics");
        this.dexie.version(1).stores({
            records: "id,title,publishDate",
            series: "name",
            days: "date, year",
            years: "year"
        });

        this.dbRecords = (this.dexie as any).records;
        this.dbSeries = (this.dexie as any).series;
        this.dbDays = (this.dexie as any).days;
        this.dbYears = (this.dexie as any).years;
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
        return Rx.from(this.dbRecords.get(cc.id))
            .pipe(
                flatMap(record => {
                    if (record) {
                        return Rx.throwError(new CCRecord(record));
                    } else {
                        return Rx.merge(
                            Rx.from(this.dbRecords.put(cc.insertable())),
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

    private insertSerie(cc: CCRecord): Rx.Observable<ICCSerie> {
        return Rx.from(this.dbSeries.get(cc.title)).pipe(
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
                return Rx.from(this.dbSeries.put(serieData))
                    .pipe(map(() => serieData));
            })
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
                return Rx.from(this.dbDays.put(dayData))
                    .pipe(map(() => dayData));
            })
        );
    }

    getDay(day: string): Rx.Observable<ICCDay> {
        return Rx.from(this.dbDays.get(day));
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
                return Rx.from(this.dbYears.put(yearData))
                    .pipe(map(() => yearData));
            })
        );
    }

    private getYear(year: number): Rx.Observable<ICCYear> {
        return Rx.from(this.dbYears.get(year as any)).pipe(
            map(yearData => yearData)
        );
    }

    update(data: CCRecord): Rx.Observable<CCRecord> {
        const recordData = data.insertable();
        return Rx.from(this.dbRecords.update(recordData.id, recordData)).pipe(
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
        return Rx.from(this.dbRecords.delete(cc.id)).pipe(
            flatMap(() => {
                resp.recordDeleted = true;
                return Rx.from(this.dbSeries.get(cc.title));
            }),
            flatMap(serieData => {
                serieData.records.splice(serieData.records.indexOf(cc.id), 1);
                if (serieData.records.length > 0) {
                    serieData.total -= cc.price;
                    resp.serieTotal = serieData.total;
                    sequentialUpdates.push(Rx.from(this.dbSeries.put(serieData)));
                } else {
                    resp.serieDeleted = true;
                    sequentialUpdates.push(Rx.from(this.dbSeries.delete(serieData.name)));
                }
                return Rx.from(this.dbDays.get(dayStr));
            }),
            flatMap(dayData => {
                dayData.records.splice(dayData.records.findIndex(rId => rId === cc.id), 1);
                if (dayData.records.length > 0) {
                    dayData.total -= cc.price;
                    resp.dayTotal = dayData.total;
                    sequentialUpdates.push(Rx.from(this.dbDays.put(dayData)));
                    return Rx.of(null);
                } else {
                    resp.dayDeleted = true;
                    sequentialUpdates.push(Rx.from(this.dbDays.delete(dayStr)));
                    const year: any = cc.getPublishYear(); // DB stores as numberm but argument is expected as number
                    return Rx.from(this.dbYears.get(year)).pipe(
                        flatMap(yearData => {
                            yearData.days.splice(yearData.days.indexOf(dayStr), 1);
                            if (yearData.days.length > 0) {
                                yearData.total -= cc.price;
                                resp.yearTotal = yearData.total;
                                sequentialUpdates.push(Rx.from(this.dbYears.put(yearData)));
                            } else {
                                resp.yearDeleted = true;
                                sequentialUpdates.push(Rx.from(this.dbYears.delete(year)));
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
        return Rx.from(this.dbYears.toCollection().reverse().toArray());
    }

    getYearDays(year: number): Rx.Observable<ICCDay[]> {
        return Rx.from(this.dbDays.where({ year }).reverse().toArray());
    }

    getSeries(): Rx.Observable<ICCSerie[]> {
        return Rx.from(this.dbSeries.toArray());
    }

    getRecord(id: string): Rx.Observable<CCRecord> {
        return Rx.from(this.dbRecords.get(id)).pipe(
            map(recordData => new CCRecord(recordData))
        );
    }

    getRecordsByDay(publishDate: string): Rx.Observable<CCRecord[]> {
        return Rx.from(this.dbRecords.where({ publishDate }).toArray()).pipe(
            map(records => lodash.sortBy(records.map(r => new CCRecord(r)), r => r.recordDate).reverse())
        );
    }

    clear(): Rx.Observable<boolean> {
        return Rx.merge(
            this.dbDays.clear(),
            this.dbRecords.clear(),
            this.dbYears.clear(),
            this.dbSeries.clear()
        ).pipe(
            toArray(),
            map(() => true)
        );
    }
}

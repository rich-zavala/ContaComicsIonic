// tslint:disable: forin
import { ICCDBHandler, IInsertRecordResponse, IDeleteRecordResponse } from "./dbHandler";
import { ICCRecord, CCRecord, ICCDay, ICCYear, ICCSerie } from "src/models";

import * as Rx from "rxjs";
import { finalize, toArray } from "rxjs/operators";
import * as lodash from "lodash";
import * as db from "localforage";

export class LocalForageHandler implements ICCDBHandler {
    dbYears: LocalForage;
    dbDays: LocalForage;
    dbRecords: LocalForage;
    dbSeries: LocalForage;

    constructor() {
        this.dbYears = db.createInstance({ name: "dbYears" });
        this.dbDays = db.createInstance({ name: "dbDays" });
        this.dbRecords = db.createInstance({ name: "dbRecords" });
        this.dbSeries = db.createInstance({ name: "dbSeries" });
    }

    insert(cc: ICCRecord): Rx.Observable<IInsertRecordResponse> {
        const resp: IInsertRecordResponse = { duplicate: false, record: null };
        const ccInst = new CCRecord(cc);
        return new Rx.Observable(observer => {
            this.insertRecord(ccInst)
                .pipe(
                    finalize(() => {
                        observer.next(resp);
                        observer.complete();
                    })
                )
                .subscribe(
                    () => resp.record = ccInst,
                    dbData => {
                        resp.duplicate = true;
                        resp.record = new CCRecord(dbData);
                    }
                );
        });
    }

    private insertRecord(cc: CCRecord): Rx.Observable<CCRecord> {
        return new Rx.Observable(observer => {
            this.dbRecords.getItem(cc.id, (recErr, record) => {
                if (recErr || record) {
                    observer.error(record);
                    observer.complete();
                } else {
                    this.dbRecords.setItem(cc.id, cc.insertable(), (err, recordItem) => {
                        if (err) {
                            observer.error(err);
                        } else {
                            const dataHandlers = [
                                this.insertYear(cc),
                                this.insertDay(cc),
                                this.insertSerie(cc)
                            ];
                            Rx.merge(...dataHandlers)
                                .pipe(
                                    finalize(() => {
                                        observer.next(cc);
                                        observer.complete();
                                    })
                                )
                                .subscribe();
                        }
                    });
                }
            });
        });
    }

    private insertYear(cc: CCRecord): Rx.Observable<ICCYear> {
        const year = cc.getPublishYear();
        const day = cc.getPublishDate();
        return new Rx.Observable(observer => {
            this.getYear(year).subscribe(
                yearData => {
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
                    this.dbYears.setItem(year.toString(), yearData, (err, val) => {
                        if (err) {
                            observer.error(err);
                        } else {
                            observer.next(val);
                        }
                        observer.complete();
                    });
                }
            );
        });
    }

    private insertDay(cc: CCRecord): Rx.Observable<ICCDay> {
        return new Rx.Observable(observer => {
            const day = cc.getPublishDate();
            this.getDay(cc.getPublishDate()).subscribe(
                dayData => {
                    if (dayData) {
                        dayData.records.push(cc);
                        dayData.records = lodash.uniq(dayData.records);
                        dayData.total += cc.price;
                    } else {
                        dayData = {
                            date: day,
                            records: [cc],
                            total: cc.price
                        };
                    }

                    dayData.records = lodash.orderBy(dayData.records.map(r => r.insertable()), ["recordDate"]).reverse();
                    this.dbDays.setItem(day, dayData, (err, val) => {
                        if (err) {
                            observer.error(err);
                        } else {
                            observer.next(val);
                        }
                        observer.complete();
                    });
                }
            );
        });
    }

    private insertSerie(cc: CCRecord): Rx.Observable<ICCSerie> {
        return new Rx.Observable(observer => {
            this.getSerie(cc.title).subscribe(
                serieData => {
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
                    this.dbSeries.setItem(serieData.name, serieData, (err, val) => {
                        if (err) {
                            observer.error(err);
                        } else {
                            observer.next(val);
                        }
                        observer.complete();
                    });
                }
            );
        });
    }

    getYears(): Rx.Observable<ICCYear[]> {
        return new Rx.Observable(observer => {
            this.dbYears.keys((err, yearKeys) => {
                Rx.merge(...yearKeys.map(yearKey => Rx.from(this.dbYears.getItem(yearKey))))
                    .pipe(toArray())
                    .subscribe(
                        (years: ICCYear[]) => {
                            years = lodash.orderBy(
                                years.map(y => {
                                    y.days = y.days.sort().reverse();
                                    return y;
                                }), ["year"]).reverse();
                            observer.next(years);
                            observer.complete();
                        }
                    );
            });
        });
    }

    getYearDays(year: number): Rx.Observable<ICCDay[]> {
        return new Rx.Observable(observer => {
            this.getYear(year)
                .subscribe(
                    (yearData: ICCYear) => {
                        Rx.merge(...yearData.days.map(day => this.getDay(day)))
                            .pipe(toArray())
                            .subscribe(
                                (daysData: ICCDay[]) => {
                                    observer.next(lodash.orderBy(daysData, ["date"]).reverse());
                                    observer.complete();
                                }
                            );
                    }
                );
        });
    }

    getSeries(): Rx.Observable<ICCSerie[]> {
        return new Rx.Observable(observer => {
            this.dbSeries.keys((err, seriesKeys) => {
                Rx.merge(...seriesKeys.map(serieTitle => Rx.from(this.dbSeries.getItem(serieTitle))))
                    .pipe(toArray())
                    .subscribe(
                        (serie: ICCSerie[]) => {
                            observer.next(lodash.orderBy(serie, ["title"]));
                            observer.complete();
                        });
            });
        });
    }

    update(data: ICCRecord): Rx.Observable<ICCRecord> {
        return new Rx.Observable(observer => {
            this.dbRecords.setItem(data.id, data, () => {
                observer.next(data);
                observer.complete();
            });
        });
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
            recordDate: cc.getPublishDate()
        };

        const sequentialUpdates: Rx.Observable<any>[] = [];
        return new Rx.Observable(observer => {
            this.dbRecords.removeItem(cc.id, err => {
                if (!err) {
                    resp.recordDeleted = true;

                    const subjSerie = new Rx.Observable(obsSerie => {
                        this.dbSeries.getItem(cc.title, (serieErr, serieData: ICCSerie) => {
                            serieData.records.splice(serieData.records.indexOf(cc.id), 1);
                            if (serieData.records.length > 0) {
                                serieData.total -= cc.price;
                                resp.serieTotal = serieData.total;
                                sequentialUpdates.push(Rx.from(this.dbSeries.setItem(serieData.name, serieData)));
                            } else {
                                resp.serieDeleted = true;
                                sequentialUpdates.push(Rx.from(this.dbSeries.removeItem(serieData.name)));
                            }
                            obsSerie.next(null);
                            obsSerie.complete();
                        });
                    });

                    const subjDates = new Rx.Observable(obsDates => {
                        const dayStr = cc.getPublishDate();
                        this.dbDays.getItem(dayStr, (dayErr, dayData: ICCDay) => {
                            dayData.records.splice(dayData.records.findIndex(r => r.id === cc.id), 1);
                            if (dayData.records.length > 0) {
                                dayData.total -= cc.price;
                                resp.dayTotal = dayData.total;
                                sequentialUpdates.push(Rx.from(this.dbDays.setItem(dayStr, dayData)));
                            } else {
                                resp.dayDeleted = true;
                                sequentialUpdates.push(Rx.from(this.dbDays.removeItem(dayStr)));

                                const yearStr = cc.getPublishYear().toString();
                                this.dbYears.getItem(yearStr, (yearErr, yearData: ICCYear) => {
                                    yearData.days.splice(yearData.days.indexOf(dayStr), 1);
                                    if (yearData.days.length > 0) {
                                        yearData.total -= cc.price;
                                        resp.yearTotal = yearData.total;
                                        sequentialUpdates.push(Rx.from(this.dbYears.setItem(yearStr, yearData)));
                                    } else {
                                        resp.yearDeleted = true;
                                        sequentialUpdates.push(Rx.from(this.dbYears.removeItem(yearStr)));
                                    }
                                });
                            }
                        });
                        obsDates.next(null);
                        obsDates.complete();
                    });

                    Rx.merge(subjSerie, subjDates)
                        .pipe(
                            toArray(),
                            finalize(() => {
                                Rx.merge(...sequentialUpdates)
                                    .subscribe(
                                        () => {
                                            observer.next(resp);
                                            observer.complete();
                                        }
                                    );
                            }))
                        .subscribe();
                }
            });
        });
    }

    getRecord(id: string): Rx.Observable<CCRecord> {
        return new Rx.Observable(observer => {
            this.dbRecords.getItem(id, (err, recordData: ICCRecord) => {
                if (recordData) {
                    observer.next(new CCRecord(recordData));
                } else {
                    observer.error();
                }
                observer.complete();
            });
        });
    }

    private getYear(year: number): Rx.Observable<ICCYear> {
        return new Rx.Observable(observer => {
            const yStr = year.toString();
            this.dbYears.getItem(yStr, (err, yearData: ICCYear) => {
                if (err) {
                    observer.error(err);
                } else {
                    observer.next(yearData);
                }
                observer.complete();
            });
        });
    }

    getDay(day: string): Rx.Observable<ICCDay> {
        return new Rx.Observable(observer => {
            this.dbDays.getItem(day, (err, dayData: ICCDay) => {
                if (err) {
                    observer.error(err);
                } else {
                    if (dayData) {
                        dayData.records = dayData.records.map(record => new CCRecord(record));
                    }
                    observer.next(dayData);
                }
                observer.complete();
            });
        });
    }

    private getSerie(serie: string): Rx.Observable<ICCSerie> {
        return new Rx.Observable(observer => {
            this.dbSeries.getItem(serie, (err, serieData: ICCSerie) => {
                if (err) {
                    observer.error(err);
                } else {
                    observer.next(serieData);
                }
                observer.complete();
            });
        });
    }

    clear(): Rx.Observable<boolean> {
        return new Rx.Observable(observer => {
            Rx.merge(
                this.dbDays.clear(),
                this.dbRecords.clear(),
                this.dbYears.clear(),
                this.dbSeries.clear()
            )
                .pipe(toArray())
                .subscribe(
                    () => observer.next(true),
                    () => observer.error()
                );
        });
    }
}

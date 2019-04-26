import { Observable } from "rxjs";
import { ICCRecord, CCRecord } from "../models/record";
import { ICCDay } from "../models/day";
import { ICCYear } from "src/models/year";

export interface IInsertRecordResponse {
    duplicate: boolean;
    record: CCRecord;
}

export interface IDeleteRecordResponse {
    recordDeleted: boolean;
    dayDeleted: boolean;
    yearDeleted: boolean;
    serieDeleted: boolean;
    dayTotal: number;
    yearTotal: number;
    serieTotal: number;
    recordYear: number;
    recordDate: string;
}
export interface ICCDBHandler {
    insert(data: ICCRecord): Observable<IInsertRecordResponse>;
    check(data: ICCRecord): Observable<ICCRecord>;
    uncheck(data: ICCRecord): Observable<ICCRecord>;
    delete(data: ICCRecord): Observable<IDeleteRecordResponse>;
    getYears(): Observable<ICCYear[]>;
    getDays(year: number): Observable<ICCDay[]>;
    getSeries(): Observable<string[]>;
    getRecordsByDay(date: string): Observable<ICCRecord[]>;
    getRecord(id: string): Observable<ICCRecord>;
}

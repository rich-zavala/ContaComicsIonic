import { Observable } from "rxjs";
import { ICCRecord, CCRecord, ICCDay, ICCYear, ICCSerie } from "../models";

export interface IInsertRecordResponse {
    duplicate: boolean;
    record: CCRecord;
}

export interface IDeleteRecordResponse {
    record: ICCRecord;
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
    update(data: ICCRecord): Observable<ICCRecord>;
    delete(data: ICCRecord): Observable<IDeleteRecordResponse>;
    getYears(): Observable<ICCYear[]>;
    getDays(year: number): Observable<ICCDay[]>;
    getSeries(): Observable<ICCSerie[]>;
    getRecordsByDay(date: string): Observable<ICCRecord[]>;
    getRecord(id: string): Observable<CCRecord>;
}

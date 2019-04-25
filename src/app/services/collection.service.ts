import { Injectable } from "@angular/core";
import { Subject } from "rxjs";

import { DbHandlingService } from "./db-handling.service";

import { ICCYear } from "src/models/year";
import { ICCDay } from "src/models/day";

@Injectable({
    providedIn: "root"
})
export class CollectionService {
    years: Subject<ICCYear[]> = new Subject();
    dates: Subject<ICCDay[]> = new Subject();

    constructor(private db: DbHandlingService) {
        this.updateYears();
    }

    updateYears() {
        this.getYears().subscribe(d => this.years.next(d));
    }

    private getYears() {
        return this.db.db.getYears();
    }

    updateDates(year: number) {
        return this.db.db.getDays(year).subscribe(d => this.dates.next(d));
    }

    getRecordsByDate(date: string) {
        return this.db.db.getRecordsByDay(date);
    }
}

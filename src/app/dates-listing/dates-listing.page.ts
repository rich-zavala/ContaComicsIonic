import { Component, OnInit, ViewChild, ViewChildren, QueryList } from "@angular/core";
import { IonInfiniteScroll } from "@ionic/angular";

import { ICCYear, ICCDay } from "src/models";

import * as Rx from "rxjs";
import { toArray } from "rxjs/operators";
import * as lodash from "lodash";

import { CollectionService } from "../services/collection.service";
import { DateRecordsComponent } from "./date-records/date-records.component";

@Component({
  selector: "app-dates-listing",
  templateUrl: "./dates-listing.page.html",
  styleUrls: ["./dates-listing.page.scss"],
})
export class DatesListingPage implements OnInit {
  @ViewChildren(DateRecordsComponent) dateChildren: QueryList<DateRecordsComponent>;
  @ViewChild(IonInfiniteScroll) infiniteScroll: IonInfiniteScroll;

  years: ICCYear[] = [];
  selectedYear: ICCYear;
  selectedYearDates: ICCDay[] = [];
  records = {};
  daysCount = 0;

  constructor(private db: CollectionService) {
    db.updateYears();
  }

  ngOnInit() {
    this.db.years.subscribe(d => {
      if (!this.years || this.years.length === 0 || JSON.stringify(this.years) !== JSON.stringify(d)) {
        this.years = d;
        if (!lodash.isEmpty(d) && (!this.selectedYear || !this.years.map(y => y.year).includes(this.selectedYear.year))) {
          this.selectYear(lodash.first(this.years));
        }
      }
    });

    this.db.deletedRecord.subscribe(
      deleteInfo => {
        if (this.selectedYear.year === deleteInfo.recordYear) {
          this.selectedYear.total = deleteInfo.yearTotal;
          if (deleteInfo.yearDeleted) {
            this.ngOnInit();
          } else if (deleteInfo.dayDeleted) {
            this.selectedYearDates.splice(this.selectedYearDates.findIndex(d => d.date === deleteInfo.recordDate), 1);
          } else {
            const dateChild = this.dateChildren.find(dc => dc.date.date === deleteInfo.recordDate);
            if (dateChild) {
              const date = this.selectedYearDates.find(d => d.date === deleteInfo.recordDate);
              date.total = deleteInfo.dayTotal;
              date.records.splice(date.records.findIndex(record => record === deleteInfo.record.id), 1);
              this.records[date.date].splice(this.records[date.date].findIndex(record => record.id === deleteInfo.record.id), 1);
              dateChild.ngOnInit();
            }
          }
        }
      }
    );
  }

  private selectYear(yearData: ICCYear) {
    this.records = {};
    this.selectedYearDates = [];
    this.selectedYear = yearData;
    this.infiniteScroll.disabled = false;
    this.updateYearSelected().subscribe();
  }

  private updateYearSelected(): Rx.Observable<boolean> {
    return new Rx.Observable(observer => {
      this.db.getYearDates(this.selectedYear.year)
        .subscribe(days => {
          this.daysCount = days.length;
          const next = this.selectedYearDates.length;
          const nextSize = next + 15;
          const nextDays = days.slice(next, nextSize);
          this.selectedYearDates.push(...nextDays);
          nextDays.forEach(
            day => {
              Rx.merge(...day.records.map(cc => Rx.from(this.db.getRecord(cc))))
                .pipe(toArray())
                .subscribe(r => {
                  this.records[day.date] = r;
                  const recordsSize = lodash.size(this.records);
                  if (recordsSize === nextSize || this.daysCount === recordsSize) {
                    observer.next(this.daysCount === recordsSize);
                    observer.complete();
                  }
                });
            });
        });
    });
  }

  private isSelected(year: number) {
    return this.selectedYear && this.selectedYear.year === year;
  }

  private loadData($event) {
    this.updateYearSelected().subscribe(
      finished => {
        $event.target.complete();
        $event.target.disabled = finished;
      }
    );
  }
}

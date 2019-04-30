import { Component, OnInit, ViewChildren, QueryList } from "@angular/core";
import { ICCYear, ICCDay } from "src/models";
import { CollectionService } from "../services/collection.service";

import * as Rx from "rxjs";
import { toArray, delay } from "rxjs/operators";
import * as lodash from "lodash";

import { DateRecordsComponent } from "./date-records/date-records.component";

@Component({
  selector: "app-dates-listing",
  templateUrl: "./dates-listing.page.html",
  styleUrls: ["./dates-listing.page.scss"],
})
export class DatesListingPage implements OnInit {
  @ViewChildren(DateRecordsComponent) dateChildren: QueryList<DateRecordsComponent>;

  loadingProgress = 0;
  years: ICCYear[] = [];
  selectedYear: ICCYear;
  selectedYearDates: ICCDay[] = [];
  records = {};
  working = false;

  constructor(private db: CollectionService) {
    db.updateYears();
  }

  ngOnInit() {
    this.db.years.subscribe(d => {
      if (!this.years || this.years.length === 0 || JSON.stringify(this.years) !== JSON.stringify(d)) {
        this.years = d;
        if (!lodash.isEmpty(d) && (!this.selectedYear || !this.years.map(y => y.year).includes(this.selectedYear.year))) {
          this.updateYearSelected(lodash.first(this.years));
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

  private updateYearSelected($event: ICCYear) {
    if (this.working || this.isSelected($event.year)) {
      return;
    }

    this.working = true;
    this.loadingProgress = 0;
    this.records = {};
    this.selectedYear = $event;
    this.db.getYearDates($event.year)
      .subscribe(days => {
        this.selectedYearDates = days;
        days.forEach(
          day => {
            Rx.concat(...day.records.map(cc => Rx.from(this.db.getRecord(cc)).pipe(delay(1))))
              .pipe(toArray())
              .subscribe(r => {
                this.records[day.date] = r;
                this.loadingProgress = lodash.size(this.records) / days.length;

                if (this.loadingProgress === 1) {
                  this.working = false;
                }
              });
          });
      });
  }

  private isSelected(year: number) {
    return this.selectedYear && this.selectedYear.year === year;
  }
}

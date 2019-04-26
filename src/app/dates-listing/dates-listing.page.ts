import { Component, OnInit } from "@angular/core";
import { ICCYear } from "src/models/year";
import { CollectionService } from "../services/collection.service";
import { toArray, delay } from "rxjs/operators";

import * as Rx from "rxjs";
import * as lodash from "lodash";

import { ICCDay } from 'src/models/day';
import { ICCRecord } from 'src/models/record';

@Component({
  selector: "app-dates-listing",
  templateUrl: "./dates-listing.page.html",
  styleUrls: ["./dates-listing.page.scss"],
})
export class DatesListingPage implements OnInit {
  loadingProgress = 0;
  years: ICCYear[] = [];
  selectedYear: ICCYear;
  selectedYearDates: ICCDay[] = [];
  records = {};
  working = false;

  constructor(private db: CollectionService) {
  }

  ngOnInit() {
    this.db.years.subscribe(d => {
      this.years = d;
      if (!lodash.isEmpty(d) && (!this.selectedYear || !this.years.map(y => y.year).includes(this.selectedYear.year))) {
        this.updateYearSelected(lodash.first(this.years));
      }
    });
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

import { Component, OnInit, ViewChild, ViewChildren, QueryList } from "@angular/core";
import { IonInfiniteScroll, ModalController } from "@ionic/angular";

import { ICCYear, ICCDay, CCRecord } from "src/models";

import * as Rx from "rxjs";
import { toArray } from "rxjs/operators";
import * as lodash from "lodash";

import { CollectionService } from "../services/collection.service";
import { DateRecordsComponent } from "./date-records/date-records.component";
import { AddFormComponent } from "../add-form/add-form.component";

interface TDatesCollection {
  [key: string]: CCRecord[];
}

@Component({
  selector: "app-dates-listing",
  templateUrl: "./dates-listing.page.html",
  styleUrls: ["./dates-listing.page.scss"],
})
export class DatesListingPage implements OnInit {
  @ViewChildren(DateRecordsComponent) dateChildren: QueryList<DateRecordsComponent>;
  @ViewChild(IonInfiniteScroll) infiniteScroll: IonInfiniteScroll;

  working = false;
  years: ICCYear[] = [];
  selectedYear: ICCYear;
  selectedYearDates: ICCDay[] = [];
  records: TDatesCollection = {};
  daysCount = 0;

  constructor(
    private db: CollectionService,
    private modalCtrl: ModalController
  ) {
    db.updateYears();
  }

  ngOnInit() {
    this.db.years$.subscribe(d => {
      if (!this.years || this.years.length === 0 || JSON.stringify(this.years) !== JSON.stringify(d)) {
        this.years = d;
        if (!lodash.isEmpty(d) && (!this.selectedYear || !this.years.map(y => y.year).includes(this.selectedYear.year))) {
          this.selectYear(lodash.first(this.years));
        }
      }
    });

    this.db.insertedRecord$.subscribe(
      record => {
        const rPublYear = record.getPublishYear();
        const rPublDate = record.getPublishDate();

        if (rPublYear === this.selectedYear.year && this.records[rPublDate]) {
          this.records[rPublDate] = lodash.sortBy([...this.records[rPublDate], record], r => r.recordDate).reverse();
        } else if (rPublYear === this.selectedYear.year) {
          /**
           * If the new record's date is not listed in the current view,
           * then the full list must be reseted. This is something that
           * could behave in a better way.
           */
          this.reset();
          this.updateYearSelected().subscribe();
        }
      }
    );

    this.db.deletedRecord$.subscribe(deleteInfo => {
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
    });
  }

  private reset() {
    this.records = {};
    this.selectedYearDates = [];
    this.infiniteScroll.disabled = false;
  }

  private selectYear(yearData: ICCYear) {
    this.reset();
    this.selectedYear = yearData;
    this.updateYearSelected().subscribe();
  }

  private updateYearSelected(): Rx.Observable<boolean> {
    this.working = true;
    return new Rx.Observable(observer => {
      this.db.getYearDates(this.selectedYear.year)
        .subscribe(days => {
          this.daysCount = days.length;
          const next = this.selectedYearDates.length;
          const nextSize = next + 15;
          const nextDays = days.slice(next, nextSize);
          this.selectedYearDates.push(...nextDays);
          const records: TDatesCollection = {};

          const recordsObservables = [];
          nextDays.forEach(
            day => day.records.forEach(
              cc => recordsObservables.push(Rx.from(this.db.getRecord(cc)))
            )
          );

          Rx.merge(...recordsObservables)
            .pipe(toArray())
            .subscribe((daysRecords: CCRecord[]) => {
              daysRecords.forEach(r => {
                const recordDate = r.getPublishDate();
                if (!records[recordDate]) {
                  records[recordDate] = [r];
                } else {
                  records[recordDate].push(r);
                }
              });

              lodash.merge(this.records, records);
              observer.next(lodash.size(this.records) === this.daysCount);
              observer.complete();
              this.working = false;
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

  get loadedPercent() {
    return this.daysCount > 0 ? lodash.size(this.records) / this.daysCount : 0;
  }

  async openAddForm() {
    const modal = await this.modalCtrl.create({
      component: AddFormComponent
    });
    return await modal.present();
  }
}

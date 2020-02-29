// tslint:disable: max-line-length
import { Component, OnInit, ViewChild, ViewChildren, QueryList } from "@angular/core";
import { ModalController, PopoverController, IonSelect } from "@ionic/angular";

import { ICCYear, ICCDay, CCRecord } from "src/models";

import * as Rx from "rxjs";
import { takeUntil, flatMap } from "rxjs/operators";
import * as lodash from "lodash";
import * as moment from "moment";

import { CollectionService } from "../services/collection.service";
import { DateRecordsComponent } from "./date-records/date-records.component";
import { AddFormComponent } from "../add-form/add-form.component";

interface TDatesCollection {
  [key: string]: CCRecord[];
}

@Component({
  selector: "app-dates-listing",
  templateUrl: "./dates-listing.page.html",
  styleUrls: ["./dates-listing.page.scss"]
})
export class DatesListingPage implements OnInit {
  @ViewChildren(DateRecordsComponent) dateChildren: QueryList<DateRecordsComponent>;
  @ViewChild("filter") filterChild: IonSelect;

  years: ICCYear[] = [];
  selectedYear: ICCYear;
  selectedYearDates: ICCDay[] = [];
  records: TDatesCollection = {};

  dataSubscription: Rx.Subscription[] = [];
  stopDatesQuery$ = new Rx.Subject();
  loadingProgress = 0;
  working = false;
  showEmpty = false;

  filterValue = 0;
  showFilteredEmpty = false;

  private showingAddForm = false;

  constructor(
    private db: CollectionService,
    private modalCtrl: ModalController,
    public popoverController: PopoverController
  ) {
    db.years$.subscribe(d => {
      if (!this.years || this.years.length === 0 || JSON.stringify(this.years) !== JSON.stringify(d)) {
        this.years = d;
        if (!lodash.isEmpty(d) && (!this.selectedYear || !this.years.map(y => y.year).includes(this.selectedYear.year))) {
          this.selectYear(lodash.first(this.years));
        }
      }

      this.showEmpty = this.years.length === 0;
    });

    db.insertedRecord$.subscribe(record => {
      if (!this.selectedYear || this.years.length === 0) {
        this.reset();
        return;
      }

      const rPublYear = record.getPublishYear();
      const rPublDate = record.publishDate;

      if (rPublYear === this.selectedYear.year && this.records[rPublDate]) {
        this.records[rPublDate] = lodash.sortBy([...this.records[rPublDate], record], r => r.recordDate).reverse();
      } else if (rPublYear === this.selectedYear.year) {
        const newDate: ICCDay = {
          date: rPublDate,
          records: [record.id],
          year: moment(rPublDate).year(),
          total: record.price
        };
        this.records[rPublDate] = [record];
        this.selectedYearDates = lodash.orderBy([...this.selectedYearDates, newDate], ["date"]).reverse();
      }

      this.showFilteredMessage();
    });

    db.deletedRecord$.subscribe(deleteInfo => {
      if (this.selectedYear.year === deleteInfo.recordYear) {
        this.selectedYear.total = deleteInfo.yearTotal;

        // Update record day data
        const date = this.selectedYearDates.find(d => d.date === deleteInfo.recordDate);
        date.total = deleteInfo.dayTotal;
        lodash.remove(date.records, record => record === deleteInfo.record.id);
        lodash.remove(this.records[date.date], record => record.id === deleteInfo.record.id);
        if (this.records[date.date].length === 0) {
          delete this.records[date.date];
        }

        if (deleteInfo.yearDeleted) {
          lodash.remove(this.years, y => y.year === deleteInfo.recordYear);
          if (this.years.length > 0) {
            this.selectYear(lodash.first(this.years));
          } else {
            this.selectedYear = undefined;
            this.reset();
          }
          this.showEmpty = this.years.length === 0;
        } else if (deleteInfo.dayDeleted) {
          lodash.remove(this.selectedYearDates, d => d.date === deleteInfo.recordDate);
        } else {
          const dateChild = this.dateChildren.find(dc => dc.date.date === deleteInfo.recordDate);
          if (dateChild) {
            dateChild.ngOnInit();
          }
        }

        this.showFilteredMessage();
      }
    });
  }

  ngOnInit() {
    this.db.updateYears();
  }

  private reset() {
    this.working = false;
    this.selectedYearDates = [];
    this.loadingProgress = 0;
    this.dataSubscription.forEach(s => s.unsubscribe());
  }

  private selectYear(yearData: ICCYear) {
    if (!this.isSelected(yearData.year)) {
      this.stopDatesQuery$.next();
      this.reset();
      this.selectedYear = yearData;
      this.updateYearSelected();
    }
  }

  private updateYearSelected() {
    if (this.working) {
      return;
    }

    this.working = true;
    this.showFilteredEmpty = false;
    this.loadingProgress = 0;
    this.records = {};

    this.dataSubscription.push(
      this.db.getYearDates(this.selectedYear.year).pipe(
        flatMap(days => {
          this.selectedYearDates = days;
          return Rx.concat(...days.map(day =>
            new Rx.Observable(observer => {
              this.dataSubscription.push(
                this.db.getDayRecords(day.date)
                  .subscribe(
                    r => {
                      this.records[day.date] = r;
                      this.loadingProgress = lodash.size(this.records) / days.length;
                      if (this.loadingProgress === 1) {
                        this.working = false;
                        this.showFilteredMessage();
                      }

                      observer.complete();
                    },
                    err => observer.error(err)
                  )
              );
            })
          ));
        }),
        takeUntil(this.stopDatesQuery$) // This is how to cancel the current year's dates requests
      ).subscribe(
        () => { },
        err => console.error("Error", err)
      )
    );
  }

  private isSelected(year: number) {
    return this.selectedYear && this.selectedYear.year === year;
  }

  async openAddForm() {
    if (this.showingAddForm) {
      return;
    }

    this.showingAddForm = true;
    const modal = await this.modalCtrl.create({
      component: AddFormComponent,
      componentProps: {
        editRecord: null
      }
    });

    await modal.present();
    this.showingAddForm = false;
  }

  showFilter() {
    this.filterChild.open();
    this.filterChild.value = this.filterValue.toString();
  }

  filterRecords($event: CustomEvent) {
    this.filterValue = parseInt($event.detail.value, 10);
    this.showFilteredMessage();
  }

  showFilteredMessage() {
    this.showFilteredEmpty = false;
    setTimeout(
      () => this.showFilteredEmpty = !this.showEmpty && this.dateChildren.filter(dateRow => dateRow.displayDate).length === 0,
      100
    );
  }
}

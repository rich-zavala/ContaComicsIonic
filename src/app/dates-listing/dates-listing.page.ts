import { Component, OnInit, ViewChild, ViewChildren, QueryList } from "@angular/core";
import { IonInfiniteScroll, ModalController, PopoverController, IonSelect } from "@ionic/angular";

import { ICCYear, ICCDay, CCRecord } from "src/models";

import * as Rx from "rxjs";
import { toArray, delay } from "rxjs/operators";
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
  styleUrls: ["./dates-listing.page.scss"]
})
export class DatesListingPage implements OnInit {
  @ViewChildren(DateRecordsComponent) dateChildren: QueryList<DateRecordsComponent>;
  // @ViewChild(IonInfiniteScroll) infiniteScroll: IonInfiniteScroll;
  @ViewChild("filter") filterChild: IonSelect;

  years: ICCYear[] = [];
  selectedYear: ICCYear;
  selectedYearDates: ICCDay[] = [];
  records: TDatesCollection = {};
  // daysCount = 0;

  loadingProgress = 0;
  working = false;

  filterValue = 0;

  constructor(
    private db: CollectionService,
    private modalCtrl: ModalController,
    public popoverController: PopoverController
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
          this.updateYearSelected();
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
    this.loadingProgress = 0;
  }

  private selectYear(yearData: ICCYear) {
    if (!this.isSelected(yearData.year)) {
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
    this.loadingProgress = 0;
    this.records = {};
    this.db.getYearDates(this.selectedYear.year)
      .subscribe(days => {
        this.selectedYearDates = days;
        days.forEach(
          day => {
            Rx.concat(...day.records.map(cc => Rx.from(this.db.getRecord(cc))))
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

  async openAddForm() {
    const modal = await this.modalCtrl.create({
      component: AddFormComponent
    });
    return await modal.present();
  }

  showFilter() {
    this.filterChild.open();
    this.filterChild.value = this.filterValue.toString();
  }

  filterRecords($event: CustomEvent) {
    this.filterValue = parseInt($event.detail.value, 10);
  }
}

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
  @ViewChild("filter") filterChild: IonSelect;

  years: ICCYear[] = [];
  selectedYear: ICCYear;
  selectedYearDates: ICCDay[] = [];
  records: TDatesCollection = {};

  loadingProgress = 0;
  working = false;
  showEmpty = false;

  filterValue = 0;
  showFilteredEmpty = false;

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

      this.showEmpty = this.years.length === 0;
    });

    this.db.insertedRecord$.subscribe(
      record => {
        if (!this.selectedYear || this.years.length === 0) {
          this.reset();
          return;
        }

        const rPublYear = record.getPublishYear();
        const rPublDate = record.getPublishDate();

        if (rPublYear === this.selectedYear.year && this.records[rPublDate]) {
          this.records[rPublDate] = lodash.sortBy([...this.records[rPublDate], record], r => r.recordDate).reverse();
          this.showFilteredMessage();
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
            const date = this.selectedYearDates.find(d => d.date === deleteInfo.recordDate);
            date.total = deleteInfo.dayTotal;
            lodash.remove(date.records, record => record === deleteInfo.record.id);
            lodash.remove(this.records[date.date], record => record.id === deleteInfo.record.id);
            dateChild.ngOnInit();
          }
        }

        this.showFilteredMessage();
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
    this.showFilteredEmpty = false;
    this.loadingProgress = 0;
    this.records = {};
    this.db.getYearDates(this.selectedYear.year)
      .subscribe(days => {
        this.selectedYearDates = days;
        const dateRecordsDbQueries: Rx.Observable<null>[] = [];
        days.forEach(
          day => dateRecordsDbQueries.push(
            new Rx.Observable(observer => {
              Rx.concat(...day.records.map(cc => Rx.from(this.db.getRecord(cc))))
                .pipe(toArray())
                .subscribe(r => {
                  this.records[day.date] = r;
                  this.loadingProgress = lodash.size(this.records) / days.length;

                  if (this.loadingProgress === 1) {
                    this.working = false;
                    this.showFilteredMessage();
                  }

                  observer.complete();
                });
            })
          )
        );
        Rx.concat(...dateRecordsDbQueries).subscribe();
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

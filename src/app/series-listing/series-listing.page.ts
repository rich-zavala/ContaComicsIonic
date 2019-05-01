import { Component, OnInit } from "@angular/core";
import * as Rx from "rxjs";
import { toArray } from "rxjs/operators";

import { CollectionService } from "../services/collection.service";

import { ICCSerie, CCRecord } from "src/models";

import * as lodash from "lodash";
import { dynCurrency } from "../tools/utils";

interface ListState {
  expanded: boolean;
  records: CCRecord[];
}

@Component({
  selector: "app-series-listing",
  templateUrl: "./series-listing.page.html",
  styleUrls: ["./series-listing.page.scss"],
})
export class SeriesListingPage implements OnInit {
  series: ICCSerie[] = [];
  states: { [key: string]: ListState } = {};

  constructor(
    private db: CollectionService,
    // private modalCtrl: ModalController
  ) {
    db.updateSeries();
  }

  ngOnInit() {
    this.db.series.subscribe(d => {
      this.series = d;
      this.series.forEach(serie => this.states[serie.name] = { expanded: false, records: [] });
      // if (!this.years || this.years.length === 0 || JSON.stringify(this.years) !== JSON.stringify(d)) {
      //   this.years = d;
      //   if (!lodash.isEmpty(d) && (!this.selectedYear || !this.years.map(y => y.year).includes(this.selectedYear.year))) {
      //     this.selectYear(lodash.first(this.years));
      //   }
      // }
    });

    this.db.deletedRecord.subscribe(
      deleteInfo => {
        // if (this.selectedYear.year === deleteInfo.recordYear) {
        //   this.selectedYear.total = deleteInfo.yearTotal;
        //   if (deleteInfo.yearDeleted) {
        //     this.ngOnInit();
        //   } else if (deleteInfo.dayDeleted) {
        //     this.selectedYearDates.splice(this.selectedYearDates.findIndex(d => d.date === deleteInfo.recordDate), 1);
        //   } else {
        //     const dateChild = this.dateChildren.find(dc => dc.date.date === deleteInfo.recordDate);
        //     if (dateChild) {
        //       const date = this.selectedYearDates.find(d => d.date === deleteInfo.recordDate);
        //       date.total = deleteInfo.dayTotal;
        //       date.records.splice(date.records.findIndex(record => record === deleteInfo.record.id), 1);
        //       this.records[date.date].splice(this.records[date.date].findIndex(record => record.id === deleteInfo.record.id), 1);
        //       dateChild.ngOnInit();
        //     }
        //   }
        // }
      }
    );
  }

  private expandToggle(serie: ICCSerie) {
    if (this.states[serie.name].expanded) {
      this.states[serie.name].expanded = false;
    } else {
      if (this.states[serie.name].records.length === 0) {
        this.loadRecords(serie);
      }

      this.states[serie.name].expanded = true;
    }
  }

  private loadRecords(serie: ICCSerie) {
    Rx.merge(...serie.records.map(recordTitle => Rx.from(this.db.getRecord(recordTitle))))
      .pipe(toArray())
      .subscribe(
        d => this.states[serie.name].records = lodash.orderBy(d, ["volumen"])
      );
  }

  private dynCurrency(total: number) {
    return dynCurrency(total);
  }
  // updateSeries
}

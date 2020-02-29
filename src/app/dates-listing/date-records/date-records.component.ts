import { Component, OnInit, Input, OnChanges } from "@angular/core";

import { ICCDay, ICCRecord } from "src/models";
import { dynCurrency } from "src/app/tools/utils";

import * as moment from "moment";
import * as lodash from "lodash";

@Component({
  selector: "app-date-records",
  templateUrl: "./date-records.component.html",
  styleUrls: ["./date-records.component.scss"]
})
export class DateRecordsComponent implements OnInit, OnChanges {
  @Input() date: ICCDay;
  @Input() records: ICCRecord[];
  @Input() filterValue: number;

  recordsCount = 0;
  displayDate = true;
  monthStr: string;
  dayStr: string;
  totalStr: string;

  constructor() {
  }

  ngOnInit() {
    this.monthStr = moment(this.date.date).format("MMM");
    this.dayStr = moment(this.date.date).format("DD");
  }

  ngOnChanges() {
    this.filterRecords();
  }

  private filterRecords() {
    let displayRecords = [];
    switch (this.filterValue) {
      case 0: // All
        displayRecords = this.records;
        break;

      case 1: // Owned
        displayRecords = this.records.filter(r => r.checked);
        break;

      case 2: // Not owned
        displayRecords = this.records.filter(r => !r.checked);
        break;

      case 3: // Not read
        displayRecords = this.records.filter(r => r.checked && !r.read);
        break;
    }

    this.recordsCount = displayRecords.length;
    this.totalStr = dynCurrency(lodash.sum(displayRecords.map(r => r.price)));
    this.displayDate = displayRecords.length > 0;
  }

  hidden(cc: ICCRecord): boolean {
    switch (this.filterValue) {
      case 1:
        return !cc.checked;
      case 2:
        return cc.checked;
      case 3:
        return cc.read;
      default:
        return false;
    }
  }
}

import { Component, OnInit, Input, OnChanges, SimpleChanges } from "@angular/core";

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

  displayRecords: ICCRecord[] = [];

  monthStr: string;
  dayStr: string;
  totalStr: string;

  constructor() {
  }

  ngOnInit() {
    this.monthStr = moment(this.date.date).format("MMM");
    this.dayStr = moment(this.date.date).format("DD");

    this.displayRecords = this.records;
    this.filterRecords();
  }

  ngOnChanges(changes: SimpleChanges) {
    this.filterRecords();
  }

  private filterRecords() {
    switch (this.filterValue) {
      case 0:
        this.displayRecords = this.records;
        break;

      case 1:
        this.displayRecords = this.records.filter(r => r.checked);
        break;

      case 2:
        this.displayRecords = this.records.filter(r => !r.checked);
        break;
    }

    this.totalStr = dynCurrency(lodash.sum(this.displayRecords.map(r => r.price)));
  }

  get displayDate() {
    return this.displayRecords.length > 0;
  }
}

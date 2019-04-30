import { Component, OnInit, Input } from "@angular/core";

import { ICCDay, ICCRecord } from "src/models";
import { dynCurrency } from "src/app/tools/utils";

import * as moment from "moment";

@Component({
  selector: "app-date-records",
  templateUrl: "./date-records.component.html",
  styleUrls: ["./date-records.component.scss"]
})
export class DateRecordsComponent implements OnInit {
  @Input() date: ICCDay;
  @Input() records: ICCRecord[];

  private monthStr: string;
  private dayStr: string;
  private totalStr: string;

  constructor() {
  }

  ngOnInit() {
    this.monthStr = moment(this.date.date).format("MMM");
    this.dayStr = moment(this.date.date).format("DD");
    this.totalStr = dynCurrency(this.date.total);
  }
}

import { Component, OnInit, Input, Output, EventEmitter } from "@angular/core";
import { CollectionService } from "src/app/services/collection.service";
import { ICCDay } from "src/models/day";
import * as moment from "moment";
import { ICCRecord } from "src/models/record";

@Component({
  selector: "app-date-records",
  templateUrl: "./date-records.component.html",
  styleUrls: ["./date-records.component.scss"],
})
export class DateRecordsComponent implements OnInit {
  @Input() date: ICCDay;
  @Output() recordDeleted: EventEmitter<ICCRecord>;
  dateString: string;

  private records: ICCRecord[] = [];

  constructor(private db: CollectionService) { }

  ngOnInit() {
    this.dateString = moment(this.date.date).format("DD MMM, YYYY");
    this.db.getRecordsByDate(this.date.date)
      .subscribe(d => this.records = d);
  }
}

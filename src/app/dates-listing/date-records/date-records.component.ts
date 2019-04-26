import { Component, OnInit, Input, Output, EventEmitter } from "@angular/core";
import { CollectionService } from "src/app/services/collection.service";
import { ICCDay } from "src/models/day";
import { ICCRecord } from "src/models/record";
import * as moment from "moment";

@Component({
  selector: "app-date-records",
  templateUrl: "./date-records.component.html",
  styleUrls: ["./date-records.component.scss"],
})
export class DateRecordsComponent implements OnInit {
  @Input() date: ICCDay;
  @Input() records: ICCRecord[];
  @Output() recordDeleted: EventEmitter<ICCRecord>;
  dateString: string;

  constructor(private db: CollectionService) { }

  ngOnInit() {
    this.dateString = moment(this.date.date).format("DD MMM, YYYY");
  }
}

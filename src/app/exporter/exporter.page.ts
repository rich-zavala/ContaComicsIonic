import { Component, OnInit } from "@angular/core";
import { CollectionService } from "../services/collection.service";

import * as Rx from "rxjs";
import { toArray } from "rxjs/operators";
import { CCRecord } from "src/models";

import * as moment from "moment";
import { DATE_FORMAT } from 'src/constants/formats';

@Component({
  selector: "app-exporter",
  templateUrl: "./exporter.page.html",
  styleUrls: ["./exporter.page.scss"],
})
export class ExporterPage implements OnInit {
  working = false;

  constructor(private db: CollectionService) { }

  ngOnInit() {
  }

  private export() {
    this.working = true;

    this.db.getSeries().subscribe(
      series => {
        const recObs = [];
        series.forEach(serie =>
          serie.records.forEach(
            record => recObs.push(Rx.from(this.db.getRecord(record)))
          )
        );

        Rx.merge(...recObs)
          .pipe(toArray())
          .subscribe(
            (records: CCRecord[]) => {
              const data = JSON.stringify(records.map(record => record.insertable()), null, 2);
              const blob = new Blob([data], { type: "text/json" });
              const filename = `ContaComics-${moment().format(DATE_FORMAT)}.json`;

              if (window.navigator.msSaveOrOpenBlob) {
                window.navigator.msSaveBlob(blob, filename);
              } else {
                const elem = window.document.createElement("a");
                elem.href = window.URL.createObjectURL(blob);
                elem.download = filename;
                document.body.appendChild(elem);
                elem.click();
                document.body.removeChild(elem);
              }

              this.working = false;
            }
          );
      }
    );
  }
}

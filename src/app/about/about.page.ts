import { Component } from "@angular/core";

import * as Rx from "rxjs";
import * as moment from "moment";
import * as lodash from "lodash";
import { CC_DATA } from "../../cc";
import { CCRecord } from "../../models";
import { RECORD_FORMAT_TYPE } from "../../models/record";
import { DATE_FORMAT } from "../../constants/formats";
import { DbHandlingService } from "../services/db-handling.service";

@Component({
  selector: "app-about",
  templateUrl: "./about.page.html",
  styleUrls: ["./about.page.scss"]
})
export class AboutPage {
  expanded = false;

  constructor(private db: DbHandlingService) { }

  expandTerms() {
    this.expanded = !this.expanded;
  }

  // Switch this method name to load the test DB
  load() { }

  _load() {
    let count = 0;
    const sample = lodash.sampleSize(CC_DATA, 500);
    Rx.concat(...sample.map(r => {
      const d = {
        title: r.titulo,
        volumen: r.volumen,
        variant: r.variante,
        format: RECORD_FORMAT_TYPE.Staples,
        lang: "esp",
        read: true,
        readDate: undefined,
        provider: "",
        comments: "",
        price: r.precio,
        checked: r.adquirido === 1,
        publishDate: moment(r.fecha).format(DATE_FORMAT),
        checkedDate: moment(r.fecha_adquisicion).valueOf(),
        recordDate: moment(r.fecha_registro).valueOf()
      };
      return this.db.db.insert(new CCRecord(d));
    }))
      .subscribe(res => {
        count++;
        console.log(`Inserted: ${count}/${lodash.size(sample)}`);
      });
  }
}

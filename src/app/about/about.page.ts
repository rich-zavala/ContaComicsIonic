import { Component } from "@angular/core";

import * as Rx from "rxjs";
import * as moment from "moment";
import * as lodash from "lodash";
import { CC_DATA } from "src/cc";
import { DbHandlingService } from "../services/db-handling.service";
import { DATE_FORMAT } from "src/constants/formats";

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

  load() {
    let count = 0;
    const sample = lodash.sampleSize(CC_DATA, 100);
    Rx.concat(...sample.map(r => {
      const d = {
        title: r.titulo,
        volumen: r.volumen,
        price: r.precio,
        checked: r.adquirido === 1,
        publishDate: moment(r.fecha).format(DATE_FORMAT),
        checkedDate: moment(r.fecha_adquisicion).valueOf(),
        recordDate: moment(r.fecha_registro).valueOf()
      };
      return this.db.db.insert(d as any);
    }))
      .subscribe(res => {
        count++;
        console.log(`Inserted: ${count}/${lodash.size(sample)}`);
      });
  }
}

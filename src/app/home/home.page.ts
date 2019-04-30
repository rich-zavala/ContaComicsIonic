import { Component } from "@angular/core";

import * as Rx from "rxjs";
import { toArray } from "rxjs/operators";
import * as moment from "moment";

import { CCRecord, ICCRecord } from "src/models";
import { CC_DATA } from "src/cc";

import { DbHandlingService } from "../services/db-handling.service";

const x = {
  id: "28DIASDESPUES12",
  titulo: "28 DIAS DESPUES",
  variante: "",
  volumen: 12,
  precio: 30,
  adquirido: 1,
  agno: 2014,
  mes: 4,
  dia: 9,
  fecha: "Wed Apr 09 2014 19:00:00 GMT-0500 (CDT)",
  fecha_adquisicion: "Thu Jan 08 2015 09:32:45 GMT-0600 (CST)",
  fecha_registro: "Thu Jan 08 2015 09:32:45 GMT-0600 (CST)"
};

@Component({
  selector: "app-home",
  templateUrl: "home.page.html",
  styleUrls: ["home.page.scss"],
})
export class HomePage {
  constructor(private db: DbHandlingService) { }

  importData() {
    let records: CCRecord[];
    Rx.concat(...CC_DATA.map(r => {
      const d: ICCRecord = {
        title: r.titulo,
        volume: r.volumen,
        price: r.precio,
        checked: r.adquirido === 1,
        publishDate: moment(r.fecha).valueOf(),
        checkedDate: moment(r.fecha_adquisicion).valueOf(),
        recordDate: moment(r.fecha_registro).valueOf()
      };
      return this.db.db.insert(d);
    }))
      .pipe(toArray())
      .subscribe(res => {
        console.log("Insert result:", res);
        records = res.map(r => r.record);
        alert("Done!");
      });
  }
}

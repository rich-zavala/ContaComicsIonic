import { Component, OnInit } from "@angular/core";
import { ModalController } from "@ionic/angular";
import { toArray } from "rxjs/operators";

import { ICCSerie, CCRecord } from "src/models";
import { CollectionService } from "../services/collection.service";
import { AddFormComponent } from "../add-form/add-form.component";

import * as Rx from "rxjs";
import * as lodash from "lodash";
import { dynCurrency } from "../tools/utils";

interface ListState {
  expanded: boolean;
  records: CCRecord[];
}

@Component({
  selector: "app-series-listing",
  templateUrl: "./series-listing.page.html",
  styleUrls: ["./series-listing.page.scss"]
})
export class SeriesListingPage implements OnInit {
  working = true;
  series: ICCSerie[] = [];
  seriesFiltered: ICCSerie[] = [];
  states: { [key: string]: ListState } = {};

  showEmpty = false;
  filterEmpty = false;

  filterValue = "";

  constructor(
    private db: CollectionService,
    private modalCtrl: ModalController
  ) {
    db.updateSeries();
  }

  ngOnInit() {
    this.db.series$.subscribe(d => {
      this.series = d;
      this.series.forEach(serie => {
        if (!this.states[serie.name]) {
          this.states[serie.name] = { expanded: false, records: [] };
        }
      });
      this.filter();
      this.showEmpty = this.series.length === 0;
    });

    this.db.insertedRecord$.subscribe(
      record => {
        if (this.states[record.title]) {
          this.states[record.title].records = lodash.orderBy([...this.states[record.title].records, record], ["volumen"]);
        } else {
          this.db.updateSeries();
        }
      }
    );

    this.db.deletedRecord$.subscribe(deleteInfo => {
      if (deleteInfo.serieDeleted) {
        this.series = this.series.filter(s => s.name !== deleteInfo.record.title);
        this.filter();
      } else {
        lodash.remove(this.states[deleteInfo.record.title].records, r => r.id === deleteInfo.record.id);
      }

      this.showEmpty = this.series.length === 0;
    });
  }

  private filter() {
    if (this.filterValue === "") {
      this.seriesFiltered = this.series;
      this.filterEmpty = false;
    } else {
      this.seriesFiltered = this.series.filter(s => s.name.toLocaleLowerCase().includes(this.filterValue));
      this.filterEmpty = this.seriesFiltered.length === 0;
    }

    this.working = false;
  }

  filterBar($event) {
    this.filterValue = $event.detail.value.toLowerCase();
    this.filter();
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

  async openAddForm() {
    const modal = await this.modalCtrl.create({
      component: AddFormComponent
    });
    return await modal.present();
  }
}

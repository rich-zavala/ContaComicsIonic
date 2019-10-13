import { Component, ChangeDetectorRef } from "@angular/core";
import { ToastController } from "@ionic/angular";

import { File } from "@ionic-native/file/ngx";
import { TranslateService } from "@ngx-translate/core";

import { DATE_FORMAT_EXPORT } from "src/constants/formats";
import { CollectionService } from "../services/collection.service";
import { CCRecord } from "src/models";

import * as Rx from "rxjs";
import { toArray } from "rxjs/operators";

import * as lodash from "lodash";
import * as moment from "moment";

@Component({
  selector: "app-exporter",
  templateUrl: "./exporter.page.html",
  styleUrls: ["./exporter.page.scss"]
})
export class ExporterPage {
  filePath: string;
  working = false;
  success = false;
  fileName: string;
  private toastStr;

  constructor(
    private db: CollectionService,
    private fileController: File,
    private toastController: ToastController,
    private ref: ChangeDetectorRef,
    translate: TranslateService
  ) {
    translate.get("export").subscribe(val => this.toastStr = val);
  }

  chooseDestination() {
    (window as any).OurCodeWorld.Filebrowser.folderPicker.single({
      success: data => {
        if (!data.length) {
          // No folder selected
          return;
        }

        this.filePath = lodash.first(data);
        this.ref.detectChanges();
      },
      error: err => console.log(err)
    });
  }

  export() {
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
              this.writeFile(data);
            }
          );
      }
    );
  }

  private writeFile(data: string) {
    this.success = false;
    this.fileName = `ContaComics-${moment().format(DATE_FORMAT_EXPORT)}.json`;
    Rx.from(this.fileController.writeFile(this.fileController.externalRootDirectory + "/Download/", this.fileName, data, { replace: true }))
      .subscribe(
        () => {
          this.success = true;
          this.showToast(this.toastStr.successMsg);
        },
        () => this.showToast(this.toastStr.errorMsg)
      );
  }

  async showToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      showCloseButton: true
    });
    toast.present();
    this.working = false;
  }
}

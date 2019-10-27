import { Component, ChangeDetectorRef } from "@angular/core";
import { AlertController } from "@ionic/angular";

import { Dialogs } from "@ionic-native/dialogs/ngx";
import { File } from "@ionic-native/file/ngx";
import { FileChooser } from "@ionic-native/file-chooser/ngx";
import { FilePath } from "@ionic-native/file-path/ngx";

import { TranslateService } from "@ngx-translate/core";

import { CollectionService } from "../services/collection.service";
import { ICCRecord, CCRecord } from "src/models";

import * as Rx from "rxjs";
import { flatMap } from "rxjs/operators";
import * as lodash from "lodash";

@Component({
  selector: "app-importer",
  templateUrl: "./importer.page.html",
  styleUrls: ["./importer.page.scss"]
})
export class ImporterPage {
  option = 0;
  filePath: string;
  working = false;
  importOutput = "";
  progress = 0;

  private dialogStr;

  constructor(
    private ref: ChangeDetectorRef,
    private db: CollectionService,
    private alertController: AlertController,
    private fileController: File,
    private fileChooser: FileChooser,
    private filePathSrv: FilePath,
    private dialogs: Dialogs,
    translate: TranslateService
  ) {
    translate.get("import.dialog").subscribe(val => this.dialogStr = val);
  }

  updateOption($event) {
    this.option = parseInt($event.detail.value, 10);
  }

  chooseFile() {
    Rx.from(this.fileChooser.open())
      .pipe(flatMap(data => Rx.from(this.filePathSrv.resolveNativePath(data))))
      .subscribe(data => {
        this.filePath = data;
        this.importOutput = "";
        this.ref.detectChanges();
      });
  }

  importData() {
    this.progress = 0;
    this.working = true;
    if (this.option === 2) {
      this.clearData().subscribe(
        clearResult => {
          if (clearResult) {
            this.dbManage();
          } else {
            this.importErr();
          }
        },
        () => this.importErr()
      );
    } else {
      this.dbManage();
    }
  }

  clearRecords() {
    const callback = () => this.clearData().subscribe(() => this.importEnding(this.dialogStr.cleared));
    const alternativeDialog = async () => {
      const alert = await this.alertController.create({
        header: this.dialogStr.header,
        subHeader: this.dialogStr.subHeader,
        buttons: [
          {
            text: this.dialogStr.btns[0],
            cssClass: "secondary",
            handler: () => callback()
          },
          {
            text: this.dialogStr.btns[1],
            role: "cancel"
          }]
      });

      await alert.present();
    };

    try {
      Rx.from(this.dialogs.confirm(this.dialogStr.subHeader, this.dialogStr.header, this.dialogStr.btns))
        .subscribe(
          option => {
            if (option === 1) {
              callback();
            }
          },
          e => {
            console.log(this.dialogStr.fileError, e);
            alternativeDialog();
          }
        );
    } catch (e) {
      alternativeDialog();
    }
  }

  private clearData(): Rx.Observable<boolean> {
    return this.db.clear();
  }

  private dbManage() {
    const dir = this.filePath.match(/(.*)[\/\\]/)[1] || "";
    const fileName = this.filePath.substring(this.filePath.lastIndexOf("/") + 1);

    Rx.from(this.fileController.readAsText(dir, fileName))
      .subscribe(
        data => {
          try {
            let records: ICCRecord[] = JSON.parse(data);
            const importRecords = () => {
              if (records.length > 0) {
                let insCounter = 0;
                Rx.concat(...records
                  .map(r => Rx.from(this.db.insert(new CCRecord(r))))
                ).subscribe(
                  () => {
                    insCounter++;
                    this.progress = insCounter / records.length;

                    if (insCounter === records.length) {
                      this.importEnding(`${insCounter} ${this.dialogStr.newComics}!`);
                    }
                  },
                  () => this.importErr()
                );
              } else {
                console.log(this.dialogStr);
                this.importEnding(`0 ${this.dialogStr.newComics}!`);
              }
            };

            if (this.option === 0) { // Get all records and remove them from import data
              this.db.getSeries().subscribe(
                series => {
                  const currentRecords = lodash.flatMap([...series.map(serie => serie.records)]);
                  records = records.filter(r => !currentRecords.includes(r.id));
                  importRecords();
                },
                () => this.importErr()
              );
            } else {
              importRecords();
            }


          } catch (e) {
            this.importErr();
          }
        },
        () => this.importErr()
      );
  }

  private importErr() {
    this.importEnding(this.dialogStr.errorMsg);
  }

  private importEnding(message: string) {
    this.importOutput = message;
    this.filePath = undefined;
    this.working = false;
  }
}

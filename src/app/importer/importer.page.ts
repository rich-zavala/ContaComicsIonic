import { Component, ChangeDetectorRef } from "@angular/core";
import { AlertController } from "@ionic/angular";
import { File } from "@ionic-native/file/ngx";
import { Dialogs } from "@ionic-native/dialogs/ngx";

import { CollectionService } from "../services/collection.service";
import { ICCRecord } from "src/models";

import * as Rx from "rxjs";
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

  constructor(
    private ref: ChangeDetectorRef,
    private db: CollectionService,
    private alertController: AlertController,
    private fileController: File,
    private dialogs: Dialogs,
  ) { }

  updateOption($event) {
    this.option = parseInt($event.detail.value, 10);
  }

  chooseFile() {
    (window as any).OurCodeWorld.Filebrowser.filePicker.single({
      success: data => {
        if (!data.length) {
          // No folder selected
          return;
        }

        this.filePath = lodash.first(data);
        this.importOutput = "";
        this.ref.detectChanges();
      },
      error: err => console.log(err)
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
    const header = "Are you sure?";
    const subHeader = "This action cannot be undone";
    const buttons = ["Clear database", "Cancel"];
    const callback = () => this.clearData().subscribe(() => this.importEnding("The database has been cleared"));

    const alternativeDialog = async () => {
      const alert = await this.alertController.create({
        header,
        subHeader,
        buttons: [
          {
            text: buttons[0],
            cssClass: "secondary",
            handler: () => callback()
          },
          {
            text: buttons[1],
            role: "cancel"
          }]
      });

      await alert.present();
    };

    try {
      Rx.from(this.dialogs.confirm(subHeader, header, buttons))
        .subscribe(
          option => {
            if (option === 1) {
              callback();
            }
          },
          e => {
            console.log("Error displaying dialog", e);
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
              let insCounter = 0;
              Rx.concat(...records.map(r => Rx.from(this.db.insert(r))))
                .subscribe(
                  () => {
                    insCounter++;
                    this.progress = insCounter / records.length;

                    if (insCounter === records.length) {
                      this.importEnding(`${insCounter} new comics!`);
                    }
                  },
                  () => this.importErr()
                );
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
    this.importEnding("Error: File is not supported");
  }

  private importEnding(message: string) {
    this.importOutput = message;
    this.filePath = undefined;
    this.working = false;
  }
}

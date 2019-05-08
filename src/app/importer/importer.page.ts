import { Component, OnInit, ChangeDetectorRef } from "@angular/core";
import { AlertController } from "@ionic/angular";
import { File } from "@ionic-native/file/ngx";

import { CollectionService } from "../services/collection.service";
import { ICCRecord } from "src/models";

import * as Rx from "rxjs";
import { toArray } from "rxjs/operators";

import * as lodash from "lodash";

@Component({
  selector: "app-importer",
  templateUrl: "./importer.page.html",
  styleUrls: ["./importer.page.scss"],
})
export class ImporterPage implements OnInit {
  private option = 0;
  private filePath: string;
  private working = false;
  private importOutput = "";

  constructor(
    private db: CollectionService,
    private alertController: AlertController,
    private fileController: File,
    private ref: ChangeDetectorRef
  ) { }

  ngOnInit() {
  }

  private updateOption($event) {
    this.option = parseInt($event.detail.value, 10);
  }

  private chooseFile() {
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

  private importData() {
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
        (e) => console.warn(e)
      );
    } else {
      this.dbManage();
    }
  }

  async clearRecords() {
    const alert = await this.alertController.create({
      header: "Are you sure?",
      subHeader: "This action cannot be undone",
      buttons: [
        {
          text: "Clear database",
          cssClass: "secondary",
          handler: () => this.clearData().subscribe(() => this.importEnding("The database has been cleared"))
        },
        {
          text: "Cancel",
          role: "cancel"
        }]
    });

    await alert.present();
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
              console.log("Inserting!");
              Rx.merge(...records.map(r => Rx.from(this.db.insert(r))))
                .pipe(toArray())
                .subscribe(
                  res => this.importEnding(`${res.length} new comics!`),
                  x => console.warn(x)
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

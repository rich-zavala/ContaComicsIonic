import { Component } from "@angular/core";
import { ModalController, AlertController } from "@ionic/angular";
import { Dialogs } from "@ionic-native/dialogs/ngx";

import { TranslateService } from "@ngx-translate/core";

import { RECORD_FORMAT_TYPE } from "../../../models/record";
import { RecordHandlerComponent } from "../record-handler.component";
import { CollectionService } from "../../services/collection.service";

import * as Rx from "rxjs";
import * as lodash from "lodash";

@Component({
  selector: "app-record-details",
  templateUrl: "./record-details.component.html",
  styleUrls: ["./record-details.component.scss"]
})
export class RecordDetailsComponent extends RecordHandlerComponent {
  public emmitUpdates = true;
  private dialogStr;

  private formats: string[] = lodash.toArray(RECORD_FORMAT_TYPE);

  constructor(
    public db: CollectionService,
    public modalCtrl: ModalController,
    private alertController: AlertController,
    private dialogs: Dialogs,
    translate: TranslateService
  ) {
    super(db, modalCtrl);
    translate.get("details.dialog").subscribe(val => this.dialogStr = val);
  }

  readUpdate($event) {
    if (this.isChecked($event)) {
      this.cc.doRead();
    } else {
      this.cc.unRead();
    }

    this.db.updateRecord(this.cc, false);
  }

  close() {
    this.modalCtrl.getTop();
    this.modalCtrl.dismiss();
  }

  async delete() {
    const callback = () => this.db.deleteRecord(this.cc).add(() => this.close());
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
}

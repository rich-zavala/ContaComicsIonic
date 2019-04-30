import { Component } from "@angular/core";
import { ModalController, AlertController } from "@ionic/angular";

import { RecordHandlerComponent } from "../record-handler.component";
import { CollectionService } from "src/app/services/collection.service";

@Component({
  selector: "app-record-details",
  templateUrl: "./record-details.component.html",
  styleUrls: ["./record-details.component.scss"],
})
export class RecordDetailsComponent extends RecordHandlerComponent {

  constructor(
    public db: CollectionService,
    private modalCtrl: ModalController,
    private alertController: AlertController
  ) {
    super(db);
  }

  close() {
    this.modalCtrl.getTop();
    this.modalCtrl.dismiss();
  }

  async delete() {
    const alert = await this.alertController.create({
      header: "Are you sure?",
      subHeader: "This action cannot be undone",
      buttons: [
        {
          text: "Delete this record",
          cssClass: "secondary",
          handler: () => {
            this.db.deleteRecord(this.cc)
              .add(() => this.close());
          }
        },
        {
          text: "Cancel",
          role: "cancel"
        }]
    });

    await alert.present();
  }
}

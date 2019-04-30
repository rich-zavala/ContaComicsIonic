import { Component, OnInit, Input } from "@angular/core";
import { ModalController, AlertController } from "@ionic/angular";
import { CollectionService } from "src/app/services/collection.service";
import { CCRecord } from "src/models/record";

@Component({
  selector: "app-record-details",
  templateUrl: "./record-details.component.html",
  styleUrls: ["./record-details.component.scss"],
})
export class RecordDetailsComponent implements OnInit {
  @Input() cc: CCRecord;

  constructor(
    private db: CollectionService,
    private modalCtrl: ModalController,
    private alertController: AlertController
  ) {
  }

  ngOnInit() {
  }

  close() {
    this.modalCtrl.getTop();
    this.modalCtrl.dismiss();
  }

  uncheck() {
    this.db.uncheck(this.cc);
  }

  check() {
    this.cc.check();
    this.updateData();
  }

  updateData() {
    this.db.updateRecord(this.cc);
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

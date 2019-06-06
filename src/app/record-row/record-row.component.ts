import { Component, Input } from "@angular/core";
import { ModalController } from "@ionic/angular";

import { RecordHandlerComponent } from "./record-handler.component";
import { RecordDetailsComponent } from "./record-details/record-details.component";
import { CollectionService } from "../services/collection.service";

@Component({
  selector: "app-record-row",
  templateUrl: "./record-row.component.html",
  styleUrls: ["./record-row.component.scss"]
})
export class RecordRowComponent extends RecordHandlerComponent {
  @Input() odd: any;
  updatingCheckFromDetails = false;

  // Long press handlers
  protected detailPressInterval: any;
  detailPressProgress = 0;

  constructor(
    public db: CollectionService,
    public modalCtrl: ModalController
  ) {
    super(db, modalCtrl);
  }

  async showDetails($event) {
    if (!["i", "path", "svg", "input", "label"].includes($event.target.localName)) {
      const modal = await this.modalCtrl.create({
        component: RecordDetailsComponent,
        componentProps: { cc: this.cc }
      });
      return await modal.present();
    }
  }

  startPressDetail() {
    this.detailPressInterval = setInterval(() => {
      this.detailPressProgress++;
      if (this.detailPressProgress >= 3) {
        this.edit();
        this.stopPressDetail();
      }
    }, 50);
  }

  stopPressDetail() {
    this.detailPressProgress = 0;
    clearInterval(this.detailPressInterval);
  }
}

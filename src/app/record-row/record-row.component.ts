import { Component, Input } from "@angular/core";
import { ModalController } from "@ionic/angular";

import { TranslateService } from "@ngx-translate/core";

import { RecordHandlerComponent } from "./record-handler.component";
import { RecordDetailsComponent } from "./record-details/record-details.component";
import { AddFormComponent } from "../add-form/add-form.component";
import { CollectionService } from "../services/collection.service";

@Component({
  selector: "app-record-row",
  templateUrl: "./record-row.component.html",
  styleUrls: ["./record-row.component.scss"]
})
export class RecordRowComponent extends RecordHandlerComponent {
  @Input() odd: any;

  private showingDetails = false;

  // Long press handlers
  protected detailPressInterval: any;
  detailPressProgress = 0;

  constructor(
    public db: CollectionService,
    public modalCtrl: ModalController,
    translate: TranslateService
  ) {
    super(db, modalCtrl, translate);
  }

  async showDetails($event) {
    if (this.showingDetails) {
      return;
    }

    if (!["i", "path", "svg", "input", "label"].includes($event.target.localName)) {
      this.showingDetails = true;
      const modal = await this.modalCtrl.create({
        component: RecordDetailsComponent,
        componentProps: { cc: this.cc }
      });

      await modal.present();
      this.showingDetails = false;
    }
  }

  startPressDetail() {
    this.detailPressInterval = setInterval(() => {
      this.detailPressProgress++;
      if (this.detailPressProgress >= 3) {
        this.edit(AddFormComponent);
        this.stopPressDetail();
      }
    }, 50);
  }

  stopPressDetail() {
    this.detailPressProgress = 0;
    clearInterval(this.detailPressInterval);
  }
}

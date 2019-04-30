import { Component, OnInit, Input, Output, EventEmitter } from "@angular/core";
import { ModalController } from "@ionic/angular";
// import { ModalPage } from '../modal/modal.page';
import { CCRecord } from "src/models/record";
import { RecordDetailsComponent } from "./record-details/record-details.component";
import { CollectionService } from "../services/collection.service";

@Component({
  selector: "app-record-row",
  templateUrl: "./record-row.component.html",
  styleUrls: ["./record-row.component.scss"]
})
export class RecordRowComponent implements OnInit {
  @Input() cc: CCRecord;
  @Input() odd: any;
  @Output() showRecordDetails: EventEmitter<CCRecord>;

  constructor(
    private db: CollectionService,
    private modalController: ModalController
  ) {
    db.updatedRecord.subscribe(
      updatedRecord => {
        if (updatedRecord.id === this.cc.id) {
          this.cc = updatedRecord;
        }
      }
    );
  }

  ngOnInit() {
  }

  check() {
    this.cc.checked = true;
    this.db.updateRecord(this.cc);
  }

  uncheck() {
    this.db.uncheck(this.cc);
  }

  async showDetails() {
    const modal = await this.modalController.create({
      component: RecordDetailsComponent,
      componentProps: { cc: this.cc }
    });
    return await modal.present();
  }
}

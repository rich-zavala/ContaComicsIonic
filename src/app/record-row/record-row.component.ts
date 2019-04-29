import { Component, OnInit, Input, Output, EventEmitter } from "@angular/core";
import { ModalController } from "@ionic/angular";
// import { ModalPage } from '../modal/modal.page';
import { CCRecord } from "src/models/record";
import { RecordDetailsComponent } from "./record-details/record-details.component";

@Component({
  selector: "app-record-row",
  templateUrl: "./record-row.component.html",
  styleUrls: ["./record-row.component.scss"]
})
export class RecordRowComponent implements OnInit {
  @Input() cc: CCRecord;
  @Input() odd: any;
  @Output() showRecordDetails: EventEmitter<CCRecord>;

  constructor(public modalController: ModalController) { }

  ngOnInit() { }

  showDetails() {
    this.presentModal();
  }

  async presentModal() {
    const modal = await this.modalController.create({
      component: RecordDetailsComponent,
      componentProps: { cc: this.cc }
    });
    return await modal.present();
  }
}

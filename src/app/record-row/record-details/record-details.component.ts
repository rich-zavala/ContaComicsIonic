import { Component, OnInit } from "@angular/core";
import { ModalController } from "@ionic/angular";

@Component({
  selector: "app-record-details",
  templateUrl: "./record-details.component.html",
  styleUrls: ["./record-details.component.scss"],
})
export class RecordDetailsComponent implements OnInit {

  constructor(private modalCtrl: ModalController) { }

  ngOnInit() { }

  close() {
    this.modalCtrl.getTop();
    this.modalCtrl.dismiss();
  }

}

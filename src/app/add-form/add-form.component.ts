import { Component, OnInit } from "@angular/core";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { ToastController, AlertController, ModalController } from "@ionic/angular";

import { CollectionService } from "../services/collection.service";
import { CCRecord } from "src/models/record";
import { DATE_FORMAT } from "src/constants/formats";

import * as lodash from "lodash";
import * as moment from "moment";

@Component({
  selector: "app-add-form",
  templateUrl: "./add-form.component.html",
  styleUrls: ["./add-form.component.scss"],
})
export class AddFormComponent implements OnInit {
  ccRecordForm: FormGroup;
  titles: string[] = [];

  filteredTitles: string[] = [];
  filteredTitleSelected = false;

  constructor(
    private db: CollectionService,
    private modalCtrl: ModalController,
    private toastController: ToastController,
    private alertController: AlertController
  ) {
    this.initForm();
    db.getSeries().subscribe(titles => this.titles = titles.map(t => t.name));
  }

  ngOnInit() {
    this.ccRecordForm.controls.title.valueChanges
      .subscribe(
        d => {
          this.filteredTitleSelected = false;
          if (d.length < 3) { // Three characters minimum
            this.filteredTitles = [];
          } else {
            const filterValue = d.toLowerCase();
            this.filteredTitles = this.titles.filter(option => option.toLowerCase().includes(filterValue));
          }
        }
      );
  }

  private initForm() {
    this.ccRecordForm = new FormGroup({
      title: new FormControl("", Validators.required),
      volumen: new FormControl("", Validators.required),
      price: new FormControl("", Validators.required),
      variant: new FormControl(""),
      checked: new FormControl(false),
      publishDate: new FormControl(moment().format(DATE_FORMAT), Validators.required)
    });
  }

  private selectTitle(option: string) {
    this.ccRecordForm.controls.title.setValue(option);
    this.ccRecordForm.controls.title.updateValueAndValidity();
    this.filteredTitleSelected = true;
  }

  private save() {
    this.db.insert(this.ccRecordForm.value)
      .subscribe(
        res => {
          if (res.duplicate) {
            this.errorToast(res.record);
          } else {
            this.initForm();
            this.successToast();
          }
        }
      );
  }

  async successToast() {
    const toast = await this.toastController.create({
      message: "Comic is saved.",
      duration: 2000,
      showCloseButton: true
    });
    toast.present();
  }

  async errorToast(cc: CCRecord) {
    const alert = await this.alertController.create({
      header: "Warning!",
      subHeader: "This comic is in the catalog",
      message: `<b>${cc.title} #${cc.volumen}</b>
      <div class="ion-margin-top">
        <small>Variant:</small>
        <div>${(lodash.isEmpty(cc.variant) ? "No variant" : cc.variant)}</div>
      </div>
      <div class="ion-margin-top">
        <small>Date registered:</small>
        <div>${cc.getPublishDate()}</div>
      </div>
      <div class="ion-margin-top">Be careful about purchasing this comic as it may be part of your collection already</div>`,
      buttons: ["OK"]
    });

    await alert.present();
  }

  private close() {
    this.modalCtrl.getTop();
    this.modalCtrl.dismiss();
  }
}
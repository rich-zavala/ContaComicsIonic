// tslint:disable: max-line-length
import { Component, OnInit, OnDestroy, ViewChild } from "@angular/core";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { ToastController, AlertController, ModalController, IonInput, Platform } from "@ionic/angular";
import { Vibration } from "@ionic-native/vibration/ngx";
import { Dialogs } from "@ionic-native/dialogs/ngx";

import { TranslateService } from "@ngx-translate/core";

import { CollectionService } from "../services/collection.service";
import { CCRecord } from "src/models/record";
import { DATE_FORMAT } from "src/constants/formats";

import * as Rx from "rxjs";
import * as lodash from "lodash";
import * as moment from "moment";

@Component({
  selector: "app-add-form",
  templateUrl: "./add-form.component.html",
  styleUrls: ["./add-form.component.scss"]
})
export class AddFormComponent implements OnInit, OnDestroy {
  @ViewChild("title") titleField: IonInput;
  @ViewChild("volumen") volumenField: IonInput;

  ccRecordForm: FormGroup;
  titles: string[] = [];

  filteredTitles: string[] = [];
  showAutocomplete = false;

  private backSubs: Rx.Subscription;

  private strs;

  constructor(
    private db: CollectionService,
    private modalCtrl: ModalController,
    private toastController: ToastController,
    private alertController: AlertController,
    private vibration: Vibration,
    private dialogs: Dialogs,
    platform: Platform,
    private translate: TranslateService
  ) {
    translate.get("add.dialog").subscribe(val => this.strs = val);

    this.backSubs = platform.backButton.subscribe(() => this.close());

    this.initForm();
    db.getSeries().subscribe(titles => this.titles = titles.map(t => t.name));
  }

  ngOnInit() {
    setTimeout(() => this.titleField.setFocus(), 500);
  }

  ngOnDestroy() {
    this.backSubs.unsubscribe();
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

    this.ccRecordForm.controls.title.valueChanges
      .subscribe(
        value => {
          if (value) {
            if (value.length < 3) { // Three characters minimum
              this.filteredTitles = [];
            } else {
              const filterValue = value.toLowerCase();
              this.filteredTitles = this.titles.filter(option => option.toLowerCase().includes(filterValue));
            }

            this.showAutocomplete = this.filteredTitles.length > 0;
          }
        }
      );
  }

  updateTitle() {
    const value = this.ccRecordForm.controls.title.value;
    if (value) {
      this.ccRecordForm.controls.title.setValue(value.toUpperCase());
    }
  }

  private selectTitle(option: string) {
    this.ccRecordForm.controls.title.setValue(option);
    this.ccRecordForm.controls.title.updateValueAndValidity();
    this.hideAutocomplete();
    this.volumenField.setFocus();
  }

  private hideAutocomplete() {
    this.showAutocomplete = false;
  }

  save() {
    for (const i in this.ccRecordForm.value) {
      if (typeof this.ccRecordForm.value[i] === "string") {
        this.ccRecordForm.value[i] = this.ccRecordForm.value[i].trim();
      }
    }

    this.db.insert(this.ccRecordForm.value)
      .subscribe(
        res => {
          if (res.duplicate) {
            this.showWarnDialog(res.record);
          } else {
            this.initForm();
            this.successToast();
          }
        }
      );
  }

  async successToast() {
    const toast = await this.toastController.create({
      message: this.strs.success,
      duration: 2000,
      showCloseButton: true
    });
    toast.present();
  }

  showWarnDialog(cc: CCRecord) {
    this.vibration.vibrate(700);

    const header = this.strs.header;
    const variant = cc.variant.length > 0 ? `${this.strs.variant}:\n${cc.variant}\n` : "";
    const nativeMessage = `${cc.title} #${cc.volumen}\n${variant}\n${this.strs.dateRegistered}:\n${cc.detailDates.registry}\n\n${this.strs.message}`;

    const alternativeDialog = async () => {
      const alert = await this.alertController.create({
        header,
        message: nativeMessage.replace(/\n/ig, "<br>"),
        buttons: ["OK"]
      });

      await alert.present();
    };

    try {
      Rx.from(this.dialogs.alert(nativeMessage, header))
        .subscribe(
          () => { },
          () => alternativeDialog()
        );
    } catch (e) {
      alternativeDialog();
    }
  }

  close() {
    this.modalCtrl.getTop();
    this.modalCtrl.dismiss();
  }
}

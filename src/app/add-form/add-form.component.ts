// tslint:disable: max-line-length
import { Component, OnInit, OnDestroy, ViewChild, Input } from "@angular/core";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { ToastController, AlertController, ModalController, IonInput, Platform } from "@ionic/angular";
import { Vibration } from "@ionic-native/vibration/ngx";
import { Dialogs } from "@ionic-native/dialogs/ngx";

import { TranslateService } from "@ngx-translate/core";

import { CollectionService } from "../services/collection.service";
import { CCRecord, RECORD_FORMAT_TYPE, ICCRecord } from "src/models/record";
import { DATE_FORMAT } from "src/constants/formats";

import * as Rx from "rxjs";
import * as moment from "moment";
import * as lodash from "lodash";

@Component({
  selector: "app-add-form",
  templateUrl: "./add-form.component.html",
  styleUrls: ["./add-form.component.scss"]
})
export class AddFormComponent implements OnInit, OnDestroy {
  private static singleton: AddFormComponent;

  @Input() editRecord: CCRecord;

  @ViewChild("title") titleField: IonInput;
  @ViewChild("volumen") volumenField: IonInput;
  @ViewChild("price") priceField: IonInput;

  ccRecordForm: FormGroup;
  titles: string[] = [];

  filteredTitles: string[] = [];
  showAutocomplete = false;
  lockAutocompleteHidden = false;

  private backSubs: Rx.Subscription;
  formats: string[] = lodash.toArray(RECORD_FORMAT_TYPE);
  private strs;

  editing = false;
  private nonEditableFields = ["title", "volumen", "publishDate"];

  constructor(
    private db: CollectionService,
    private modalCtrl: ModalController,
    private toastController: ToastController,
    private alertController: AlertController,
    private vibration: Vibration,
    private dialogs: Dialogs,
    platform: Platform,
    translate: TranslateService
  ) {
    if (AddFormComponent.singleton) {
      return AddFormComponent.singleton;
    }
    AddFormComponent.singleton = this;

    translate.get("add.dialog").subscribe(val => this.strs = val);
    this.backSubs = platform.backButton.subscribe(() => this.close());
    this.updateTitles();
    this.initForm();
  }

  ngOnInit() {
    this.editing = !lodash.isEmpty(this.editRecord);
    let fieldToFocus: IonInput;
    if (this.editing) {
      lodash.keys(this.ccRecordForm.controls).forEach(attr => this.ccRecordForm.controls[attr].setValue(this.editRecord[attr]));
      this.nonEditableFields.forEach(attr => this.ccRecordForm.controls[attr].disable());

      // Must of imported records will be read but with no read date...
      if (this.editRecord.read && lodash.isEmpty(this.editRecord.readDate)) {
        this.ccRecordForm.controls.readDate.setValue(moment().format(DATE_FORMAT));
      }
      fieldToFocus = this.priceField;
    } else {
      this.ccRecordForm.reset();
      this.ccRecordForm.enable();
      this.initForm();
      fieldToFocus = this.titleField;
    }

    setTimeout(() => fieldToFocus.setFocus(), 500);
  }

  ngOnDestroy() {
    this.backSubs.unsubscribe();
  }

  private updateTitles() {
    return this.db.getSeries().subscribe(titles => this.titles = titles.map(t => t.name));
  }

  private initForm() {
    this.ccRecordForm = new FormGroup({
      title: new FormControl("", Validators.required),
      volumen: new FormControl("", Validators.required),
      price: new FormControl("", Validators.required),
      variant: new FormControl(""),
      format: new FormControl(RECORD_FORMAT_TYPE.Staples, Validators.required),
      lang: new FormControl("esp", Validators.required),
      read: new FormControl(false),
      readDate: new FormControl(moment().format(DATE_FORMAT)),
      provider: new FormControl(""),
      comments: new FormControl(""),
      checked: new FormControl(false),
      publishDate: new FormControl(moment().format(DATE_FORMAT), Validators.required)
    });

    this.ccRecordForm.controls.title.valueChanges.subscribe(
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

    this.ccRecordForm.controls.read.valueChanges.subscribe(
      value => {
        const readDateField = this.ccRecordForm.controls.readDate;
        if (value && readDateField.pristine && lodash.isEmpty(readDateField.value)) {
          readDateField.setValue(moment().format(DATE_FORMAT));
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

  hideAutocomplete() {
    this.showAutocomplete = false;
  }

  private hideAutocompleteLock() {
    this.lockAutocompleteHidden = true;
    this.hideAutocomplete();
  }

  save() {
    this.lockAutocompleteHidden = false; // Unlock autocomplete
    const recordValues: ICCRecord = this.ccRecordForm.value;
    for (const i in recordValues) {
      if (typeof recordValues[i] === "string") {
        recordValues[i] = recordValues[i].trim();
      }
    }

    if (this.editing) {
      this.nonEditableFields.forEach(attr => recordValues[attr] = this.editRecord[attr]);
      recordValues.checkedDate = this.editRecord.checkedDate;
      recordValues.readDate = this.editRecord.readDate;
    }

    const newRecInst = new CCRecord(recordValues);

    if (newRecInst.checked) {
      if (!newRecInst.checkedDate) { // Set check date as now!
        newRecInst.check();
      }
    } else {
      newRecInst.uncheck();
    }

    if (newRecInst.read) {
      if (!newRecInst.readDate) { // Set read date as now!
        newRecInst.doRead();
      }
    } else {
      newRecInst.unRead();
    }

    if (this.editing) {
      this.db.updateRecord(newRecInst, true)
        .add(() => {
          this.editRecord = newRecInst;
          this.successToast();
          this.close();
        });

    } else {
      this.db.insert(newRecInst)
        .subscribe(
          res => {
            if (res.duplicate) {
              this.showWarnDialog(res.record);
            } else {
              this.initForm();
              this.successToast();
              this.updateTitles();
            }
          }
        );
    }
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

import { Component, OnInit } from "@angular/core";
import { SafeStyle, DomSanitizer } from "@angular/platform-browser";
import { ModalController, AlertController } from "@ionic/angular";
import { AlertButton } from "@ionic/core";
import { Dialogs } from "@ionic-native/dialogs/ngx";

import { TranslateService } from "@ngx-translate/core";

import { RECORD_FORMAT_TYPE } from "../../../models/record";
import { RecordHandlerComponent } from "../record-handler.component";
import { CollectionService } from "../../services/collection.service";
import { FoldersService } from "../../services/folders.service";

import { FileChooser } from "@ionic-native/file-chooser/ngx";
import { FilePath } from "@ionic-native/file-path/ngx";
import { File } from "@ionic-native/file/ngx";

import { ImageResizer, ImageResizerOptions } from "@ionic-native/image-resizer/ngx";
import { Camera, CameraOptions } from "@ionic-native/camera/ngx";

import * as Rx from "rxjs";
import { flatMap } from "rxjs/operators";
import * as lodash from "lodash";

@Component({
  selector: "app-record-details",
  templateUrl: "./record-details.component.html",
  styleUrls: ["./record-details.component.scss"]
})
export class RecordDetailsComponent extends RecordHandlerComponent implements OnInit {
  translations;
  public emmitUpdates = true;

  coverImg: SafeStyle;
  private coverDir: string;
  private coverName: string;
  private coverPath: string;
  private coverFront = false;

  private formats: string[] = lodash.toArray(RECORD_FORMAT_TYPE);

  constructor(
    public db: CollectionService,
    private foldersSrv: FoldersService,
    public modalCtrl: ModalController,
    private alertController: AlertController,
    private dialogs: Dialogs,
    private fileChooser: FileChooser,
    private fileController: File,
    private filePathSrv: FilePath,
    private imageResizer: ImageResizer,
    private camera: Camera,
    private sanitizer: DomSanitizer,
    translate: TranslateService
  ) {
    super(db, modalCtrl, translate);
    translate.get("details").subscribe(val => this.translations = val);
  }

  ngOnInit() {
    this.initCheckableStates();
    this.coverDir = this.foldersSrv.getFolders().covers;
    this.coverName = this.cc.id + ".jpg";
    this.coverPath = [this.coverDir, this.coverName].join("/");
    this.makeTrustedCoverImage();
  }

  readUpdate($event) {
    if (this.isChecked($event)) {
      this.cc.doRead();
    } else {
      this.cc.unRead();
    }

    this.db.updateRecord(this.cc, false);
  }

  close() {
    this.modalCtrl.getTop();
    this.modalCtrl.dismiss();
  }

  async delete() {
    const callback = () => this.db.deleteRecord(this.cc).add(() => this.close());
    const alternativeDialog = async () => {
      const alert = await this.alertController.create({
        header: this.translations.dialog.header,
        subHeader: this.translations.dialog.subHeader,
        buttons: [
          {
            text: this.translations.dialog.btns[0],
            cssClass: "secondary",
            handler: () => callback()
          },
          {
            text: this.translations.dialog.btns[1],
            role: "cancel"
          }]
      });

      await alert.present();
    };

    try {
      Rx.from(this.dialogs.confirm(this.translations.dialog.subHeader, this.translations.dialog.header, this.translations.dialog.btns))
        .subscribe(
          option => {
            if (option === 1) {
              callback();
            }
          },
          e => alternativeDialog()
        );
    } catch (e) {
      alternativeDialog();
    }
  }

  async coverMng() {
    const buttons: AlertButton[] = [
      { text: this.translations.coverOptionsDialog.takePhoto, handler: this.coverTakePhoto.bind(this) },
      { text: this.translations.coverOptionsDialog.choose, handler: this.coverChooseImage.bind(this) }
    ];

    if (this.coverImg) {
      buttons.push({ text: this.translations.coverOptionsDialog.remove, handler: this.coverDelete.bind(this) });
    }

    const alert = await this.alertController.create({
      header: this.translations.coverOptionsDialog.header,
      buttons: [...buttons, { text: this.translations.dialog.btns[1], role: "cancel", cssClass: "secondary" }]
    });
    await alert.present();
  }

  private coverTakePhoto() {
    const options: CameraOptions = {
      quality: 100,
      destinationType: this.camera.DestinationType.FILE_URI,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE
    };

    Rx.from(this.camera.getPicture(options))
      .subscribe(imageData => this.coverSet(imageData));
  }

  private coverChooseImage() {
    Rx.from(this.fileChooser.open({ mime: "image/jpeg" }))
      .pipe(flatMap(data => Rx.from(this.filePathSrv.resolveNativePath(data))))
      .subscribe(data => this.coverSet(data));
  }

  private coverDelete() {
    Rx.from(this.fileController.removeFile(this.coverDir, this.coverName)).subscribe();
    this.makeTrustedCoverImage();
  }

  private coverSet(coverFilePath: string) {
    const options: ImageResizerOptions = {
      uri: coverFilePath,
      folderName: this.fileController.cacheDirectory,
      quality: 90,
      width: 1284,
      height: 1024
    };

    Rx.from(this.imageResizer.resize(options))
      .subscribe(resizedFilePath => {
        const fileName = resizedFilePath.substring(resizedFilePath.lastIndexOf("/") + 1);
        const dir = resizedFilePath.match(/(.*)[\/\\]/)[1] || "";
        Rx.from(this.fileController.readAsDataURL(dir, fileName))
          .subscribe(
            coverData => {
              const folder = this.foldersSrv.getFolders().covers;
              Rx.from(this.fileController.writeFile(folder, this.coverName, this.b64toBlob(coverData), { replace: true }))
                .subscribe(() => {
                  this.makeTrustedCoverImage();
                });
            },
            err => {
              alert("Something went wrong. Cover not set!");
            }
          );
      });
  }

  private b64toBlob(b64Data: string): Blob {
    const sliceSize = 512;
    const byteCharacters = atob(b64Data.replace(/^data:image\/(png|jpeg|jpg);base64,/, ""));
    const byteArrays = [];

    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
      const slice = byteCharacters.slice(offset, offset + sliceSize);

      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }

      const byteArray = new Uint8Array(byteNumbers);

      byteArrays.push(byteArray);
    }

    const blob = new Blob(byteArrays, { type: "image/jpeg" });
    return blob;
  }

  private makeTrustedCoverImage() {
    try {
      Rx.from(this.fileController.readAsDataURL(this.coverDir, this.coverName))
        .subscribe(
          coverData => {
            const imageString = JSON.stringify(coverData).replace(/\\n/g, "");
            const style = "url(" + imageString + ")";
            this.coverImg = this.sanitizer.bypassSecurityTrustStyle(style);
          },
          err => {
            delete this.coverImg;
            console.error("No cover available", err);
          }
        );
    } catch (e) {
      console.warn("No cover available");
    }
  }

  private toggleCover() {
    this.coverFront = !this.coverFront;
  }
}

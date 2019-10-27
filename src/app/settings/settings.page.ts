import { Component, ChangeDetectorRef } from "@angular/core";
import { FoldersService } from "../services/folders.service";

import { File } from "@ionic-native/file/ngx";
import * as Rx from "rxjs";
import * as moment from "moment";
import * as lodash from "lodash";
import { CC_DATA } from "../../cc";
import { CCRecord } from "../../models";
import { RECORD_FORMAT_TYPE } from "../../models/record";
import { DATE_FORMAT } from "../../constants/formats";
import { DbHandlingService } from "../services/db-handling.service";

@Component({
    selector: "app-settings",
    templateUrl: "./settings.page.html",
    styleUrls: ["./settings.page.scss"]
})
export class SettingsPage {
    backupFolder: string;
    coversFolder: string;

    constructor(private foldersSrv: FoldersService, private ref: ChangeDetectorRef) {
        const currentSettings = foldersSrv.getFolders();
        this.backupFolder = currentSettings.backup;
        this.coversFolder = currentSettings.covers;
    }

    chooseFolder(mode: number) {
        (window as any).OurCodeWorld.Filebrowser.folderPicker.single({
            success: data => {
                if (!data.length) {
                    // No folder selected
                    return;
                }

                switch (mode) {
                    case 0:
                        this.backupFolder = this.foldersSrv.setBackupFolder(lodash.first(data)).backup;
                        break;
                    case 1:
                        this.coversFolder = this.foldersSrv.setCoversFolder(lodash.first(data)).covers;
                        break;
                }

                this.ref.detectChanges();
            },
            error: err => console.log(err)
        });
    }
}

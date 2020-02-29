import { Injectable } from "@angular/core";
import { File } from "@ionic-native/file/ngx";
import * as lodash from "lodash";

@Injectable({
    providedIn: "root"
})
export class FoldersService {
    private folders = { backup: "", covers: "" };
    private lsKeys = {
        backup: "__backup__",
        covers: "__cover__"
    };

    constructor(private fileController: File) { }

    getFolders() {
        this.folders.backup = localStorage.getItem(this.lsKeys.backup);
        if (lodash.isEmpty(this.folders.backup)) {
            if (lodash.isEmpty(this.folders.backup)) {
                this.folders.backup = this.fileController.externalRootDirectory + "Download/";
            }
        }

        this.folders.covers = localStorage.getItem(this.lsKeys.covers);
        if (lodash.isEmpty(this.folders.covers)) {
            if (lodash.isEmpty(this.folders.covers)) {
                this.folders.covers = this.fileController.cacheDirectory;
            }
        }

        return this.folders;
    }

    setBackupFolder(path: string) {
        localStorage.setItem(this.lsKeys.backup, path);
        return this.getFolders();
    }

    setCoversFolder(path: string) {
        localStorage.setItem(this.lsKeys.covers, path);
        return this.getFolders();
    }
}

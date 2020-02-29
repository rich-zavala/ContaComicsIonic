import { Component, OnInit, Input } from "@angular/core";
import { ModalController } from "@ionic/angular";

import { TranslateService } from "@ngx-translate/core";

import { CCRecord } from "../../models";
import { CollectionService } from "../services/collection.service";
import { AddFormComponent } from "../add-form/add-form.component";

import * as lodash from "lodash";

@Component({
    selector: "app-record-handler",
    template: ""
})
export class RecordHandlerComponent implements OnInit {
    @Input() cc: CCRecord;
    checkableState = { checked: false, read: false };
    emmitUpdates = false;

    private strs;
    formatStr: string;

    constructor(public db: CollectionService, public modalCtrl: ModalController, translate: TranslateService) {
        translate.get("formats").subscribe(val => this.strs = val);

        db.updatedRecord$.subscribe(
            updatedRecord => {
                if (updatedRecord.id === this.cc.id) {
                    lodash.keys(updatedRecord.insertable()).forEach(attr => this.cc[attr] = updatedRecord[attr]);
                    this.initCheckableStates();
                }
            }
        );
    }

    ngOnInit() {
        this.initCheckableStates();
    }

    initCheckableStates() {
        this.cc.init();
        this.checkableState.checked = this.cc.checked;
        this.checkableState.read = this.cc.read;
        this.formatStr = this.strs[this.cc.format].slice(0, 7);
    }

    isChecked($event) {
        return ($event.target && $event.target.checked) || ($event.detail && $event.detail.checked);
    }

    checkUpdate($event) {
        if (this.isChecked($event)) {
            this.cc.check();
            this.db.updateRecord(this.cc, this.emmitUpdates);
        } else {
            this.db.uncheck(this.cc, this.emmitUpdates)
                .subscribe(
                    unchecked => {
                        if (!unchecked) {
                            this.checkableState.checked = true;
                        }
                    }
                );
        }
    }

    async edit(modalPage: typeof AddFormComponent = AddFormComponent) { // This argument was added to avoid circular dependency warnings
        const modal = await this.modalCtrl.create({
            component: modalPage,
            componentProps: {
                editRecord: this.cc
            }
        });

        await modal.present();
    }
}

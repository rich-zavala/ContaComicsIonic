import { Component, OnInit, Input } from "@angular/core";
import { CCRecord } from "src/models";
import { CollectionService } from "src/app/services/collection.service";

@Component({
    selector: "app-record-handler",
    template: ""
})
export class RecordHandlerComponent implements OnInit {
    @Input() cc: CCRecord;
    public checkState = { checked: false, read: false };
    public emmitUpdates = false;

    constructor(public db: CollectionService) { }

    ngOnInit() {
        this.checkState.checked = this.cc.checked;
        this.checkState.read = this.cc.read;
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
                            this.checkState.checked = true;
                        }
                    }
                );
        }
    }
}

import { Component, OnInit, Input } from "@angular/core";
import { CCRecord } from "src/models";
import { CollectionService } from "src/app/services/collection.service";

@Component({})
export class RecordHandlerComponent implements OnInit {
    @Input() cc: CCRecord;
    public checkState = { checked: false };

    constructor(public db: CollectionService) { }

    ngOnInit() {
        this.checkState.checked = this.cc.checked;
    }

    checkUpdate($event) {
        if ($event.detail.checked) {
            this.cc.check();
            this.db.updateRecord(this.cc, true);
        } else {
            this.db.uncheck(this.cc, true)
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

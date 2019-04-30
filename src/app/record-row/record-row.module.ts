import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { IonicModule } from "@ionic/angular";

import { RecordRowComponent } from "./record-row.component";
import { RecordDetailsComponent } from "./record-details/record-details.component";

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule
    ],
    declarations: [
        RecordRowComponent,
        RecordDetailsComponent
    ],
    exports: [
        RecordRowComponent
    ],
    entryComponents: [RecordDetailsComponent]
})
export class RecordRowModule { }

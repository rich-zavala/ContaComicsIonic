import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { IonicModule } from "@ionic/angular";

import { TranslateModule } from "@ngx-translate/core";

import { RecordRowComponent } from "./record-row.component";
import { RecordDetailsComponent } from "./record-details/record-details.component";
import { RecordHandlerComponent } from "./record-handler.component";

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        TranslateModule
    ],
    declarations: [
        RecordRowComponent,
        RecordDetailsComponent,
        RecordHandlerComponent
    ],
    exports: [
        RecordRowComponent
    ],
    entryComponents: [
        RecordDetailsComponent
    ]
})
export class RecordRowModule { }

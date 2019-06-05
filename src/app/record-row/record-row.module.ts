import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { IonicModule } from "@ionic/angular";

import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { TranslateModule } from "@ngx-translate/core";

import { RecordRowComponent } from "./record-row.component";
import { RecordDetailsComponent } from "./record-details/record-details.component";
import { RecordHandlerComponent } from "./record-handler.component";

import { library } from "@fortawesome/fontawesome-svg-core";
import { faCheckSquare } from "@fortawesome/free-solid-svg-icons/faCheckSquare";

library.add(faCheckSquare);

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        TranslateModule,
        FontAwesomeModule
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

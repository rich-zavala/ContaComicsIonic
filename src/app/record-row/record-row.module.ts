import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { IonicModule } from "@ionic/angular";

import { TranslateModule } from "@ngx-translate/core";
import { File } from "@ionic-native/file/ngx";
import { FileChooser } from "@ionic-native/file-chooser/ngx";
import { FilePath } from "@ionic-native/file-path/ngx";
import { ImageResizer } from "@ionic-native/image-resizer/ngx";
import { Camera } from "@ionic-native/camera/ngx";

import { RecordRowComponent } from "./record-row.component";
import { RecordDetailsComponent } from "./record-details/record-details.component";
import { RecordHandlerComponent } from "./record-handler.component";
import { FoldersService } from "../services/folders.service";

import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
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
    providers: [
        File,
        FileChooser,
        FilePath,
        ImageResizer,
        Camera,
        FoldersService
    ],
    exports: [
        RecordRowComponent
    ],
    entryComponents: [
        RecordDetailsComponent
    ]
})
export class RecordRowModule { }

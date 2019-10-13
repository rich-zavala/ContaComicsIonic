import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Routes, RouterModule } from "@angular/router";
import { File } from "@ionic-native/file/ngx";
import { Dialogs } from "@ionic-native/dialogs/ngx";
import { FileChooser } from "@ionic-native/file-chooser/ngx";
import { FilePath } from "@ionic-native/file-path/ngx";

import { TranslateModule } from "@ngx-translate/core";

import { IonicModule } from "@ionic/angular";

import { ImporterPage } from "./importer.page";

const routes: Routes = [
  {
    path: "",
    component: ImporterPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    TranslateModule
  ],
  declarations: [
    ImporterPage
  ],
  providers: [
    File,
    Dialogs,
    FileChooser,
    FilePath
  ]
})
export class ImporterPageModule { }

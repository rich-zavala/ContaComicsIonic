import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Routes, RouterModule } from "@angular/router";
import { File } from "@ionic-native/file/ngx";
import { TranslateModule } from "@ngx-translate/core";

import { IonicModule } from "@ionic/angular";
import { ExporterPage } from "./exporter.page";
import { FoldersService } from "../services/folders.service";

const routes: Routes = [
  {
    path: "",
    component: ExporterPage
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
    ExporterPage
  ],
  providers: [
    File,
    FoldersService
  ]
})
export class ExporterPageModule { }

import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Routes, RouterModule } from "@angular/router";
import { File } from "@ionic-native/file/ngx";

import { IonicModule } from "@ionic/angular";

import { ExporterPage } from "./exporter.page";

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
    RouterModule.forChild(routes)
  ],
  declarations: [
    ExporterPage
  ],
  providers: [
    File
  ]
})
export class ExporterPageModule { }
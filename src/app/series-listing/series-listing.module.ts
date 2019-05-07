import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Routes, RouterModule } from "@angular/router";

import { IonicModule } from "@ionic/angular";

import { RecordRowModule } from "../record-row/record-row.module";
import { SeriesListingPage } from "./series-listing.page";

const routes: Routes = [
  {
    path: "",
    component: SeriesListingPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RecordRowModule,
    RouterModule.forChild(routes)
  ],
  declarations: [
    SeriesListingPage
  ]
})
export class SeriesListingPageModule { }

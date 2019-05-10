import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { IonicModule } from "@ionic/angular";
import { RouterModule } from "@angular/router";

import { TranslateModule } from "@ngx-translate/core";

import { RecordRowModule } from "../record-row/record-row.module";

import { DatesListingPage } from "./dates-listing.page";
import { DateRecordsComponent } from "./date-records/date-records.component";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RecordRowModule,
    RouterModule.forChild([
      {
        path: "",
        component: DatesListingPage
      }
    ]),
    TranslateModule
  ],
  declarations: [
    DatesListingPage,
    DateRecordsComponent
  ]
})
export class DatesListingPageModule { }

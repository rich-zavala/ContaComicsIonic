import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { IonicModule } from "@ionic/angular";
import { RouterModule } from "@angular/router";

import { DatesListingPage } from "./dates-listing.page";
import { DateRecordsComponent } from "./date-records/date-records.component";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild([
      {
        path: "",
        component: DatesListingPage
      }
    ])
  ],
  declarations: [
    DatesListingPage,
    DateRecordsComponent
  ]
})
export class DatesListingPageModule { }

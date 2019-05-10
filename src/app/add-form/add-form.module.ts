import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { Routes, RouterModule } from "@angular/router";

import { IonicModule } from "@ionic/angular";
import { Vibration } from "@ionic-native/vibration/ngx";
import { Dialogs } from "@ionic-native/dialogs/ngx";

import { TranslateModule } from "@ngx-translate/core";

import { AddFormComponent } from "./add-form.component";

const routes: Routes = [
  {
    path: "",
    component: AddFormComponent
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    TranslateModule
  ],
  declarations: [
    AddFormComponent
  ],
  providers: [
    Vibration,
    Dialogs
  ],
  entryComponents: [
    AddFormComponent
  ]
})
export class AddFormModule { }

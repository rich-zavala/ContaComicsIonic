import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { Routes, RouterModule } from "@angular/router";

import { IonicModule } from "@ionic/angular";
import { Vibration } from "@ionic-native/vibration/ngx";

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
    RouterModule.forChild(routes)
  ],
  declarations: [
    AddFormComponent
  ],
  providers: [
    Vibration
  ],
  entryComponents: [
    AddFormComponent
  ]
})
export class AddFormModule { }

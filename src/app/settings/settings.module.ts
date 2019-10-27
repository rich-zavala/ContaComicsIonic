import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Routes, RouterModule } from "@angular/router";
import { TranslateModule } from "@ngx-translate/core";

import { IonicModule } from "@ionic/angular";
import { File } from "@ionic-native/file/ngx";

import { FoldersService } from "../services/folders.service";
import { SettingsPage } from "./settings.page";

const routes: Routes = [
    {
        path: "",
        component: SettingsPage
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
    providers: [
        File,
        FoldersService
    ],
    declarations: [
        SettingsPage
    ]
})
export class SettingsPageModule { }

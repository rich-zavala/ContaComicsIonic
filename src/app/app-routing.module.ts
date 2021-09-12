import { NgModule } from "@angular/core";
import { PreloadAllModules, RouterModule, Routes } from "@angular/router";
import { PAGE_NAMES } from "../constants/page-names";

const routes: Routes = [
  {
    path: "",
    redirectTo: PAGE_NAMES.DATES_LISTING,
    pathMatch: "full"
  },
  {
    path: PAGE_NAMES.DATES_LISTING,
    loadChildren: () => import("./dates-listing/dates-listing.module").then(m => m.DatesListingPageModule)
  },
  {
    path: PAGE_NAMES.SERIES_LISTING,
    loadChildren: () => import("./series-listing/series-listing.module").then(m => m.SeriesListingPageModule)
  },

  {
    path: PAGE_NAMES.EXPORTER,
    loadChildren: () => import("./exporter/exporter.module").then(m => m.ExporterPageModule)
  },
  {
    path: PAGE_NAMES.IMPORTER,
    loadChildren: () => import("./importer/importer.module").then(m => m.ImporterPageModule)
  },
  {
    path: PAGE_NAMES.FOLDER_SETTINGS,
    loadChildren: () => import("./settings/settings.module").then(m => m.SettingsPageModule)
  },
  {
    path: PAGE_NAMES.ABOUT,
    loadChildren: () => import("./about/about.module").then(m => m.AboutPageModule)
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }

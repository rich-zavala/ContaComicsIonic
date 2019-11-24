import { NgModule } from "@angular/core";
import { PreloadAllModules, RouterModule, Routes } from "@angular/router";
import { PAGE_NAMES } from "../constants/page-names";
import { FireStoreRouteGuard } from "./services/fireStoreRouteGuard";

const routes: Routes = [
  {
    path: "",
    redirectTo: PAGE_NAMES.DATES_LISTING,
    pathMatch: "full",
    canActivate: [FireStoreRouteGuard]
  },
  {
    path: PAGE_NAMES.DATES_LISTING,
    loadChildren: "./dates-listing/dates-listing.module#DatesListingPageModule",
    canActivate: [FireStoreRouteGuard]
  },
  {
    path: PAGE_NAMES.SERIES_LISTING,
    loadChildren: "./series-listing/series-listing.module#SeriesListingPageModule",
    canActivate: [FireStoreRouteGuard]
  },
  {
    path: PAGE_NAMES.EXPORTER,
    loadChildren: "./exporter/exporter.module#ExporterPageModule"
  },
  {
    path: PAGE_NAMES.IMPORTER,
    loadChildren: "./importer/importer.module#ImporterPageModule"
  },
  {
    path: PAGE_NAMES.FOLDER_SETTINGS,
    loadChildren: "./settings/settings.module#SettingsPageModule"
  },
  {
    path: PAGE_NAMES.ABOUT,
    loadChildren: "./about/about.module#AboutPageModule"
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }

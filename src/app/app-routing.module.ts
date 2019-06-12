import { NgModule } from "@angular/core";
import { PreloadAllModules, RouterModule, Routes } from "@angular/router";
import { PAGE_NAMES, PAGE_NAME } from "../constants/page-names";

const LOCAL_STORAGE_PAGE = window.localStorage.getItem(PAGE_NAME);
const MAIN_ROUTE = LOCAL_STORAGE_PAGE ? LOCAL_STORAGE_PAGE : PAGE_NAMES.DATES_LISTING;

alert(MAIN_ROUTE);

const routes: Routes = [
  {
    path: "",
    redirectTo: MAIN_ROUTE,
    pathMatch: "full"
  },
  {
    path: PAGE_NAMES.DATES_LISTING,
    loadChildren: "./dates-listing/dates-listing.module#DatesListingPageModule"
  },
  {
    path: PAGE_NAMES.SERIES_LISTING,
    loadChildren: "./series-listing/series-listing.module#SeriesListingPageModule"
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

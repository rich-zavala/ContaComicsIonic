import { NgModule } from "@angular/core";
import { PreloadAllModules, RouterModule, Routes } from "@angular/router";

const routes: Routes = [
  {
    path: "",
    redirectTo: "importer",
    pathMatch: "full"
  },
  {
    path: "home",
    loadChildren: "./home/home.module#HomePageModule"
  },
  {
    path: "list",
    loadChildren: "./list/list.module#ListPageModule"
  },
  {
    path: "dates-listing",
    loadChildren: "./dates-listing/dates-listing.module#DatesListingPageModule"
  },
  {
    path: "series-listing",
    loadChildren: "./series-listing/series-listing.module#SeriesListingPageModule"
  },

  {
    path: "exporter",
    loadChildren: "./exporter/exporter.module#ExporterPageModule"
  },
  {
    path: "importer",
    loadChildren: "./importer/importer.module#ImporterPageModule"
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }

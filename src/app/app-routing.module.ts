import { NgModule } from "@angular/core";
import { PreloadAllModules, RouterModule, Routes } from "@angular/router";

const routes: Routes = [
  {
    path: "",
    redirectTo: "series-listing",
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
  { path: "series-listing", loadChildren: "./series-listing/series-listing.module#SeriesListingPageModule" }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }

import { NgModule } from "@angular/core";
import { BrowserModule, HAMMER_GESTURE_CONFIG } from "@angular/platform-browser";
import { RouteReuseStrategy } from "@angular/router";
import { HttpClientModule, HttpClient, } from "@angular/common/http";

import { TranslateModule, TranslateLoader } from "@ngx-translate/core";
import { TranslateHttpLoader } from "@ngx-translate/http-loader";
import { TranslateService } from "@ngx-translate/core";

import { IonicModule, IonicRouteStrategy } from "@ionic/angular";
import { SplashScreen } from "@ionic-native/splash-screen/ngx";
import { StatusBar } from "@ionic-native/status-bar/ngx";
import { Dialogs } from "@ionic-native/dialogs/ngx";

import { AppComponent } from "./app.component";
import { AppRoutingModule } from "./app-routing.module";
import { AddFormModule } from "./add-form/add-form.module";
import { IonicGestureConfig } from "./services/hammerGestures.service";

import { AngularFireModule } from "angularfire2";
import { environment } from "../environments/environment";
import { AngularFirestoreModule } from "angularfire2/firestore";

// AoT requires an exported function for factories
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, "./assets/i18n/", ".json");
}

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(),
    AppRoutingModule,
    AddFormModule,

    HttpClientModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    }),

    AngularFireModule.initializeApp(environment.firebase),
    AngularFirestoreModule
  ],
  providers: [
    StatusBar,
    SplashScreen,
    Dialogs,
    {
      provide: RouteReuseStrategy,
      useClass: IonicRouteStrategy
    },

    TranslateService,
    {
      provide: HAMMER_GESTURE_CONFIG,
      useClass: IonicGestureConfig
    }
  ],
  bootstrap: [
    AppComponent
  ]
})
export class AppModule { }

import { Component } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";

import { Platform } from "@ionic/angular";
import { SplashScreen } from "@ionic-native/splash-screen/ngx";
import { StatusBar } from "@ionic-native/status-bar/ngx";

import { PAGE_NAMES, PAGE_NAME } from "../constants/page-names";

import * as Rx from "rxjs";
import { toArray } from "rxjs/operators";

import * as moment from "moment";

@Component({
  selector: "app-root",
  templateUrl: "app.component.html"
})
export class AppComponent {
  PAGE_NAMES = PAGE_NAMES;

  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private translate: TranslateService
  ) {
    this.initializeApp();
  }

  initializeApp() {
    Rx.merge(
      this.platform.ready(),
      this.initTranslate(),
    )
      .pipe(toArray())
      .subscribe(res => {
        this.splashScreen.hide();
        if (typeof cordova !== "undefined" && cordova.platformId === "android") {
          this.statusBar.overlaysWebView(false);
          this.statusBar.backgroundColorByHexString("#9a0031");
        }
      });
  }

  private initTranslate() {
    this.translate.setDefaultLang("en");
    let UseResolver: Rx.Observable<any>;

    if (this.translate.getBrowserLang() !== undefined) {
      UseResolver = this.translate.use(this.translate.getBrowserLang());
      moment.locale(this.translate.getBrowserLang());
    } else {
      UseResolver = this.translate.use("es");
      moment.locale("es");
    }

    return UseResolver;
  }

  setLastPage(pageName: string) {
    window.localStorage.setItem(PAGE_NAME, pageName);
  }
}

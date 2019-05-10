import { Component } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";

import { Platform } from "@ionic/angular";
import { SplashScreen } from "@ionic-native/splash-screen/ngx";
import { StatusBar } from "@ionic-native/status-bar/ngx";

@Component({
  selector: "app-root",
  templateUrl: "app.component.html"
})
export class AppComponent {
  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private translate: TranslateService
  ) {
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.splashScreen.hide();
      this.initTranslate();

      if (typeof cordova !== "undefined" && cordova.platformId === "android") {
        this.statusBar.overlaysWebView(false);
        this.statusBar.backgroundColorByHexString("#9a0031");
      }
    });
  }

  private initTranslate() {
    this.translate.setDefaultLang("en");

    if (this.translate.getBrowserLang() !== undefined) {
      this.translate.use(this.translate.getBrowserLang());
    } else {
      this.translate.use("en");
    }
  }
}

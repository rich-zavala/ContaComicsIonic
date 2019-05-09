import { Component } from "@angular/core";

import { Platform } from "@ionic/angular";
import { SplashScreen } from "@ionic-native/splash-screen/ngx";
import { StatusBar } from "@ionic-native/status-bar/ngx";

@Component({
  selector: "app-root",
  templateUrl: "app.component.html"
})
export class AppComponent {
  public appPages = [
    {
      title: "Grouped by year",
      url: "/dates-listing",
      icon: "calendar"
    },
    {
      title: "Grouped by serie",
      url: "/series-listing",
      icon: "list"
    }
  ];

  public dataPages = [
    {
      title: "Import data",
      url: "/importer",
      icon: "download"
    },
    {
      title: "Export data",
      url: "/exporter",
      icon: "save"
    }
  ];

  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar
  ) {
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();
    });
  }
}

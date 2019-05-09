import { Component } from "@angular/core";

@Component({
  selector: "app-about",
  templateUrl: "./about.page.html",
  styleUrls: ["./about.page.scss"]
})
export class AboutPage {
  expanded = false;

  constructor() { }

  expandTerms() {
    this.expanded = !this.expanded;
  }
}

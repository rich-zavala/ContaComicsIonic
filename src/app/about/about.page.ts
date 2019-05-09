import { Component, OnInit } from "@angular/core";

@Component({
  selector: "app-about",
  templateUrl: "./about.page.html",
  styleUrls: ["./about.page.scss"],
})
export class AboutPage implements OnInit {
  private expanded = false;

  constructor() { }

  ngOnInit() {
  }

  private expandTerms() {
    this.expanded = !this.expanded;
  }
}

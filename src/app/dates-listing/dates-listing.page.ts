import { Component, OnInit } from "@angular/core";
import { ICCYear } from "src/models/year";
import { CollectionService } from "../services/collection.service";

import * as lodash from "lodash";
import { ICCDay } from 'src/models/day';

@Component({
  selector: "app-dates-listing",
  templateUrl: "./dates-listing.page.html",
  styleUrls: ["./dates-listing.page.scss"],
})
export class DatesListingPage implements OnInit {
  years: ICCYear[] = [];
  selectedYear: ICCYear;
  selectedYearDates: ICCDay[] = [];

  constructor(private db: CollectionService) {
    db.years.subscribe(d => {
      this.years = d;
      if (!lodash.isEmpty(d) && (!this.selectedYear || !this.years.map(y => y.year).includes(this.selectedYear.year))) {
        this.updateYearSelected(lodash.first(this.years));
      }
    });
  }

  ngOnInit() {
  }

  private updateYearSelected($event: ICCYear) {
    this.selectedYear = $event;
    this.db.getYearDates($event.year)
      .subscribe(d => this.selectedYearDates = d);
  }
}

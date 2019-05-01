import { CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { SeriesListingPage } from "./series-listing.page";

describe("SeriesListingPage", () => {
  let component: SeriesListingPage;
  let fixture: ComponentFixture<SeriesListingPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SeriesListingPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SeriesListingPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});

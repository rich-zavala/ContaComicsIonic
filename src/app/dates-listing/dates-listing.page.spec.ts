import { CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { DatesListingPage } from "./dates-listing.page";

describe("DatesListingPage", () => {
  let component: DatesListingPage;
  let fixture: ComponentFixture<DatesListingPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DatesListingPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DatesListingPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});

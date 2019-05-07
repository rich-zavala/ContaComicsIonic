import { CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { ExporterPage } from "./exporter.page";

describe("ExporterPage", () => {
  let component: ExporterPage;
  let fixture: ComponentFixture<ExporterPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExporterPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExporterPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});

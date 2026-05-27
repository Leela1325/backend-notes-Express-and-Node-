import { ComponentFixture, TestBed } from "@angular/core/testing";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { RouterTestingModule } from "@angular/router/testing";
import { ActivatedRoute, Router } from "@angular/router";
import { of } from "rxjs";
import { ZoneComponent } from "./zone.component";

describe("ZoneComponent", () => {
  let component: ZoneComponent;
  let fixture: ComponentFixture<ZoneComponent>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    routerSpy = jasmine.createSpyObj("Router", ["navigate"]);

    await TestBed.configureTestingModule({
      imports: [ZoneComponent, HttpClientTestingModule, RouterTestingModule],
      providers: [
        { provide: Router, useValue: routerSpy },
        {
          provide: ActivatedRoute,
          useValue: { params: of({ zoneid: "1" }) },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ZoneComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput("name", "Test Zone");
    fixture.componentRef.setInput("zoneid", "1");
    fixture.componentRef.setInput("suppliers", [
      { id: "1", name: "Sup1", active: true },
      { id: "2", name: "Sup2", active: false },
      { id: "3", name: "Sup3", active: true },
    ]);
    fixture.componentRef.setInput("categories", [{ id: "c1", name: "Cat1" }]);
    fixture.componentRef.setInput("zoneObject", {
      id: "1",
      name: "Test Zone",
      maxcapacity: 100,
      currentcapacity: 40,
      availablecapacity: 60,
    });
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("should count active suppliers", () => {
    component.updatecount();
    expect(component.activecount).toBe(2);
  });

  it("should count inactive suppliers", () => {
    component.updatecount();
    expect(component.inactivecount).toBe(1);
  });

  it("should navigate to category list", () => {
    component.navigateUser();
    expect(routerSpy.navigate).toHaveBeenCalledWith(
      ["1", "category-list"],
      jasmine.any(Object),
    );
  });

  it("should update counts on ngOnChanges", () => {
    spyOn(component, "updatecount");
    component.ngOnChanges({});
    expect(component.updatecount).toHaveBeenCalled();
  });
});

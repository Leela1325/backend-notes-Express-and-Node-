import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ServiceZoneListComponent } from "./zone-list.component";
import { ZoneService } from "./zone/zone.service";
import { CategoryService } from "../category-list/category/category.service";
import { SupplierService } from "../supplier-list/supplier/supplier.service";
import { of, BehaviorSubject } from "rxjs";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { RouterTestingModule } from "@angular/router/testing";
import { ActivatedRoute } from "@angular/router";

describe("ServiceZoneListComponent", () => {
  let component: ServiceZoneListComponent;
  let fixture: ComponentFixture<ServiceZoneListComponent>;

  let zoneServiceSpy: jasmine.SpyObj<ZoneService>;

  const mockZones = [
    {
      id: "1",
      name: "Zone A",
      maxcapacity: 100,
      currentcapacity: 40,
      availablecapacity: 60,
      suppliers: [],
      categories: [],
    },
    {
      id: "2",
      name: "Zone B",
      maxcapacity: 200,
      currentcapacity: 80,
      availablecapacity: 120,
      suppliers: [],
      categories: [],
    },
  ];

  beforeEach(async () => {
    const zoneSubject = new BehaviorSubject(mockZones);
    zoneServiceSpy = jasmine.createSpyObj("ZoneService", ["getZones"], {
      getZonesBhSubject$: zoneSubject.asObservable(),
    });

    await TestBed.configureTestingModule({
      imports: [
        ServiceZoneListComponent,
        HttpClientTestingModule,
        RouterTestingModule,
      ],
      providers: [
        { provide: ZoneService, useValue: zoneServiceSpy },
        { provide: CategoryService, useValue: {} },
        { provide: SupplierService, useValue: {} },
        { provide: ActivatedRoute, useValue: { params: of({ zoneid: "1" }) } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ServiceZoneListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("should call getZones on init", () => {
    expect(zoneServiceSpy.getZones).toHaveBeenCalled();
  });

  it("should load zones from BehaviorSubject", () => {
    expect(component.zoneArray().length).toBe(2);
    expect(component.zoneArray()[0].name).toBe("Zone A");
  });
});

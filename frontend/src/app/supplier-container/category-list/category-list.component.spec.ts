import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ServiceCategoryListComponent } from "./category-list.component";
import { ZoneService } from "../zone-list/zone/zone.service";
import { CategoryService } from "./category/category.service";
import { SupplierService } from "../supplier-list/supplier/supplier.service";
import { ActivatedRoute } from "@angular/router";
import { of } from "rxjs";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { RouterTestingModule } from "@angular/router/testing";

describe("ServiceCategoryListComponent", () => {
  let component: ServiceCategoryListComponent;
  let fixture: ComponentFixture<ServiceCategoryListComponent>;

  let zoneServiceSpy: jasmine.SpyObj<ZoneService>;
  let categoryServiceSpy: jasmine.SpyObj<CategoryService>;

  const mockZone = {
    id: "1",
    name: "Zone 1",
    maxcapacity: 100,
    currentcapacity: 40,
    availablecapacity: 60,
  };
  const mockCategories = [
    {
      id: "c1",
      name: "Cat1",
      zoneid: "1",
      suppliers: [{ active: true }, { active: false }],
    },
    { id: "c2", name: "Cat2", zoneid: "1", suppliers: [{ active: true }] },
  ];

  beforeEach(async () => {
    zoneServiceSpy = jasmine.createSpyObj("ZoneService", ["getZone"]);
    categoryServiceSpy = jasmine.createSpyObj("CategoryService", [
      "getCategoriesByZoneId",
    ]);

    zoneServiceSpy.getZone.and.returnValue(of(mockZone));
    categoryServiceSpy.getCategoriesByZoneId.and.returnValue(
      of(mockCategories as any),
    );

    await TestBed.configureTestingModule({
      imports: [
        ServiceCategoryListComponent,
        HttpClientTestingModule,
        RouterTestingModule,
      ],
      providers: [
        { provide: ZoneService, useValue: zoneServiceSpy },
        { provide: CategoryService, useValue: categoryServiceSpy },
        { provide: SupplierService, useValue: {} },
        { provide: ActivatedRoute, useValue: { params: of({ zoneid: "1" }) } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ServiceCategoryListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("should load zone and categories on init", () => {
    expect(zoneServiceSpy.getZone).toHaveBeenCalledWith("1");
    expect(categoryServiceSpy.getCategoriesByZoneId).toHaveBeenCalledWith("1");
    expect(component.zoneObject().name).toBe("Zone 1");
    expect(component.categoryArray().length).toBe(2);
  });

  

  it("should update zoneid signal from route params", () => {
    expect(component.zoneid()).toBe("1");
  });
});

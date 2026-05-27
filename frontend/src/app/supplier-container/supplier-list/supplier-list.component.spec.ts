/// <reference types="jasmine" />
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { SuppliersListComponent } from "./supplier-list.component";
import { SupplierService } from "./supplier/supplier.service";
import { ZoneService } from "../zone-list/zone/zone.service";
import { ProductSupplierService } from "./supplier/product-supplier.service";
import { ActivatedRoute } from "@angular/router";
import { of } from "rxjs";
import { RouterTestingModule } from "@angular/router/testing";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { SupplierWithProducts } from "./supplier/supplier.model";
import { Zone } from "../zone-list/zone/zone.model";

describe("SuppliersListComponent", () => {
  let component: SuppliersListComponent;
  let fixture: ComponentFixture<SuppliersListComponent>;

  let supplierServiceSpy: jasmine.SpyObj<SupplierService>;
  let zoneServiceSpy: jasmine.SpyObj<ZoneService>;
  let productSupplierServiceSpy: jasmine.SpyObj<ProductSupplierService>;

  beforeEach(async () => {
    supplierServiceSpy = jasmine.createSpyObj("SupplierService", [
      "getSuppliersByCategoryId",
      "searchName",
    ]);
    zoneServiceSpy = jasmine.createSpyObj("ZoneService", ["getZone"]);
    productSupplierServiceSpy = jasmine.createSpyObj("ProductSupplierService", [
      "getProductsBySupplier",
    ]);

    const mockSuppliers: SupplierWithProducts[] = [
      {
        id: "1",
        name: "A",
        contact: "111",
        address: "x",
        email: "a@a.com",
        products: [],
      } as any,
      {
        id: "2",
        name: "B",
        contact: "222",
        address: "y",
        email: "b@b.com",
        products: [],
      } as any,
    ];
    const mockZone: Zone = {
      id: "1",
      name: "Zone-1",
      maxcapacity: 100,
      currentcapacity: 40,
      availablecapacity: 60,
    };

    supplierServiceSpy.getSuppliersByCategoryId.and.returnValue(
      of(mockSuppliers),
    );
    zoneServiceSpy.getZone.and.returnValue(of(mockZone));
    supplierServiceSpy.searchName.and.callFake((list: any[], term: string) =>
      list.filter((x) => x.name.toLowerCase().includes(term.toLowerCase())),
    );

    await TestBed.configureTestingModule({
      imports: [
        SuppliersListComponent,
        RouterTestingModule,
        HttpClientTestingModule,
      ],
      providers: [
        { provide: SupplierService, useValue: supplierServiceSpy },
        { provide: ZoneService, useValue: zoneServiceSpy },
        {
          provide: ProductSupplierService,
          useValue: productSupplierServiceSpy,
        },
        {
          provide: ActivatedRoute,
          useValue: { params: of({ zoneid: "1", categoryid: "1" }) },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SuppliersListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("should load suppliers and zone on init", () => {
    expect(supplierServiceSpy.getSuppliersByCategoryId).toHaveBeenCalledWith(
      "1",
      "1",
    );
    expect(zoneServiceSpy.getZone).toHaveBeenCalledWith("1");
    expect(component.supplierArray().length).toBe(2);
    expect(component.zonedata.name).toBe("Zone-1");
  });

 

  it("should delete supplier by id", () => {
    component.DeleteSupplier("1");
    expect(component.supplierArray().some((s) => s.id === "1")).toBeFalse();
  });

  it("should filter suppliers by search", () => {
    component.searchvalue = "A";
    component.searchFunction();
    expect(component.supplierArray().length).toBe(1);
    expect(component.supplierArray()[0].name).toBe("A");
  });

  it("should add supplier on onSupplierAdded", () => {
    const count = component.supplierArray().length;
    component.onSupplierAdded({
      id: "3",
      name: "C",
      contact: "333",
      address: "z",
      email: "c@c.com",
    } as any);
    expect(component.supplierArray().length).toBe(count + 1);
    expect(component.supplierArray().some((s) => s.id === "3")).toBeTrue();
  });
});

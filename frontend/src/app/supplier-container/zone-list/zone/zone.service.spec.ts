import { TestBed } from "@angular/core/testing";
import {
  HttpClientTestingModule,
  HttpTestingController,
} from "@angular/common/http/testing";
import { ZoneService } from "./zone.service";
import { CategoryService } from "../../category-list/category/category.service";
import { SupplierService } from "../../supplier-list/supplier/supplier.service";
import { Zone, ZoneWithSupplierAndCategories } from "./zone.model";

describe("ZoneService", () => {
  let service: ZoneService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        ZoneService,
        { provide: CategoryService, useValue: {} },
        { provide: SupplierService, useValue: {} },
      ],
    });

    service = TestBed.inject(ZoneService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });

  it("should get zone by id", () => {
    const mockZone: Zone = {
      id: "1",
      name: "Zone A",
      maxcapacity: 100,
      currentcapacity: 40,
      availablecapacity: 60,
    };

    service.getZone("1").subscribe((zone) => {
      expect(zone.name).toBe("Zone A");
      expect(zone.maxcapacity).toBe(100);
    });

    const req = httpMock.expectOne(
      "http://localhost:4040/zones/zone-supplier/1",
    );
    expect(req.request.method).toBe("GET");
    req.flush(mockZone);
  });

  it("should get zones and emit via BehaviorSubject", () => {
    const mockZones: ZoneWithSupplierAndCategories[] = [
      {
        id: "1",
        name: "Zone A",
        maxcapacity: 100,
        currentcapacity: 40,
        availablecapacity: 60,
        suppliers: [],
        categories: [],
      } as any,
      {
        id: "2",
        name: "Zone B",
        maxcapacity: 200,
        currentcapacity: 80,
        availablecapacity: 120,
        suppliers: [],
        categories: [],
      } as any,
    ];

    service.getZones();

    const req = httpMock.expectOne("http://localhost:4040/zones/zone-supplier");
    expect(req.request.method).toBe("GET");
    req.flush(mockZones);

    service.getZonesBhSubject$.subscribe((zones) => {
      expect(zones.length).toBe(2);
    });
  });

  it("should not call http if zones already loaded", () => {
    const mockZones: ZoneWithSupplierAndCategories[] = [
      {
        id: "1",
        name: "Zone A",
        maxcapacity: 100,
        currentcapacity: 40,
        availablecapacity: 60,
        suppliers: [],
        categories: [],
      } as any,
    ];

    // First call
    service.getZones();
    const req = httpMock.expectOne("http://localhost:4040/zones/zone-supplier");
    req.flush(mockZones);

    // Second call should not make HTTP request
    service.getZones();
    httpMock.expectNone("http://localhost:4040/zones/zone-supplier");
  });
});

import { TestBed } from "@angular/core/testing";
import {
  HttpClientTestingModule,
  HttpTestingController,
} from "@angular/common/http/testing";
import { CategoryService } from "./category.service";
import { SupplierService } from "../../supplier-list/supplier/supplier.service";

describe("CategoryService", () => {
  let service: CategoryService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [CategoryService, { provide: SupplierService, useValue: {} }],
    });

    service = TestBed.inject(CategoryService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });

  it("should get categories by zone id", () => {
    const mockCategories = [
      { id: "c1", name: "Category 1", zoneid: "1", suppliers: [] },
      { id: "c2", name: "Category 2", zoneid: "1", suppliers: [] },
    ];

    service.getCategoriesByZoneId("1").subscribe((categories) => {
      expect(categories.length).toBe(2);
      expect(categories[0].name).toBe("Category 1");
    });

    const req = httpMock.expectOne(
      "http://localhost:4040/categories/category-supplier?zoneid=1",
    );
    expect(req.request.method).toBe("GET");
    req.flush(mockCategories);
  });
});

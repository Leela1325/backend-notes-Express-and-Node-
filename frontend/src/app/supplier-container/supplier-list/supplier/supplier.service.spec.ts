import { TestBed } from "@angular/core/testing";
import {
  HttpClientTestingModule,
  HttpTestingController,
} from "@angular/common/http/testing";
import { SupplierService } from "./supplier.service";
import { ProductSupplierService } from "./product-supplier.service";
import { ProductService } from "../../../stock-container/products-list/product.service";
import {
  Supplier,
  SupplierWithoutId,
  SupplierWithProducts,
} from "./supplier.model";

describe("SupplierService", () => {
  let service: SupplierService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        SupplierService,
        { provide: ProductSupplierService, useValue: {} },
        { provide: ProductService, useValue: {} },
      ],
    });

    service = TestBed.inject(SupplierService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });

  it("should get suppliers by category id", () => {
    const mockSuppliers: SupplierWithProducts[] = [
      {
        id: "1",
        name: "Sup1",
        contact: "111",
        address: "Addr1",
        email: "a@a.com",
        performance: "Good",
        rating: 4,
        active: true,
        zoneid: "z1",
        categoryid: "c1",
        productids: [],
        products: [],
      } as any,
    ];

    service.getSuppliersByCategoryId("c1", "z1").subscribe((suppliers) => {
      expect(suppliers.length).toBe(1);
      expect(suppliers[0].name).toBe("Sup1");
    });

    const req = httpMock.expectOne(
      "http://localhost:4040/suppliers?categoryid=c1&zoneid=z1",
    );
    expect(req.request.method).toBe("GET");
    req.flush(mockSuppliers);
  });

  it("should update supplier details", () => {
    const supplierData: SupplierWithoutId = {
      name: "Updated",
      contact: "222",
      address: "NewAddr",
      email: "b@b.com",
      performance: "Excellent",
      rating: 5,
      active: true,
      zoneid: "z1",
      categoryid: "c1",
      productids: [],
    };

    service.updateSupplierDetails("1", supplierData).subscribe((response) => {
      expect(response).toBeTruthy();
    });

    const req = httpMock.expectOne("http://localhost:4040/suppliers/1");
    expect(req.request.method).toBe("PUT");
    req.flush({});
  });

  it("should add supplier", () => {
    const newSupplier: SupplierWithoutId = {
      name: "New Supplier",
      contact: "333",
      address: "NewAddr",
      email: "c@c.com",
      performance: "Good",
      rating: 3,
      active: true,
      zoneid: "z1",
      categoryid: "c1",
      productids: [],
    };

    service.addSupplier(newSupplier).subscribe((supplier) => {
      expect(supplier.name).toBe("New Supplier");
    });

    const req = httpMock.expectOne("http://localhost:4040/suppliers");
    expect(req.request.method).toBe("POST");
    req.flush({ id: "3", ...newSupplier });
  });

  it("should delete supplier by id", () => {
    service.DeleteSupplierById("1").subscribe((response) => {
      expect(response).toBeTruthy();
    });

    const req = httpMock.expectOne("http://localhost:4040/suppliers/1");
    expect(req.request.method).toBe("DELETE");
    req.flush({});
  });

  it("should search suppliers by product name", () => {
    const suppliers: SupplierWithProducts[] = [
      {
        id: "1",
        name: "Alpha",
        contact: "111",
        products: [{ name: "Widget" }],
      } as any,
      {
        id: "2",
        name: "Beta",
        contact: "222",
        products: [{ name: "Gadget" }],
      } as any,
      {
        id: "3",
        name: "Gamma",
        contact: "333",
        products: [{ name: "Widget Pro" }],
      } as any,
    ];

    const result = service.searchName(suppliers, "Widget");
    expect(result.length).toBe(2);
    expect(result[0].name).toBe("Alpha");
  });

  it("should return all suppliers when search value is empty", () => {
    const suppliers: SupplierWithProducts[] = [
      { id: "1", name: "Alpha", products: [] } as any,
      { id: "2", name: "Beta", products: [] } as any,
    ];

    const result = service.searchName(suppliers, "");
    expect(result.length).toBe(2);
  });

  it("should calculate rating with current", () => {
    service.calculateRatingWithCurrent("1", 4.5).subscribe((response) => {
      expect(response).toBeTruthy();
    });

    const req = httpMock.expectOne(
      "http://localhost:4040/suppliers/1/updaterating",
    );
    expect(req.request.method).toBe("PATCH");
    req.flush({});
  });
});

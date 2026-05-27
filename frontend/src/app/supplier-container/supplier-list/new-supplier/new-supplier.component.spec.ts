import { ComponentFixture, TestBed } from "@angular/core/testing";
import { NewsupplierComponent } from "./new-supplier.component";
import { SupplierService } from "../supplier/supplier.service";
import { ActivityDaoService } from "../../../dao/activitydao.service";
import { ActivatedRoute, Router } from "@angular/router";
import { of } from "rxjs";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import Swal from "sweetalert2";

describe("NewsupplierComponent", () => {
  let component: NewsupplierComponent;
  let fixture: ComponentFixture<NewsupplierComponent>;

  let supplierServiceSpy: jasmine.SpyObj<SupplierService>;
  let activityServiceSpy: jasmine.SpyObj<ActivityDaoService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    supplierServiceSpy = jasmine.createSpyObj("SupplierService", [
      "getSuppliers",
      "addSupplier",
    ]);
    activityServiceSpy = jasmine.createSpyObj("ActivityDaoService", [
      "updateActivity",
    ]);
    routerSpy = jasmine.createSpyObj("Router", ["navigate"]);

    supplierServiceSpy.addSupplier.and.returnValue(
      of({ id: "1", name: "Test" } as any),
    );
    activityServiceSpy.updateActivity.and.returnValue(of({}));

    await TestBed.configureTestingModule({
      imports: [NewsupplierComponent, HttpClientTestingModule],
      providers: [
        { provide: SupplierService, useValue: supplierServiceSpy },
        { provide: ActivityDaoService, useValue: activityServiceSpy },
        { provide: Router, useValue: routerSpy },
        {
          provide: ActivatedRoute,
          useValue: { params: of({ zoneid: "1", categoryid: "1" }) },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(NewsupplierComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput("supplierlist", []);
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("should set zoneid and categoryid from route params", () => {
    expect(component.zoneId).toBe("1");
    expect(component.categoryId).toBe("1");
  });

  it("should emit close event on navigateToBack", () => {
    const closeSpy = spyOn(component.close, "emit");
    component.navigateToBack();
    expect(closeSpy).toHaveBeenCalled();
  });

  it("should validate digits only", () => {
    expect(component.isDigitsOnly("12345")).toBeTrue();
    expect(component.isDigitsOnly("123a5")).toBeFalse();
  });

  it("should validate starts with valid number", () => {
    expect(component.startsWithValid("9123456789")).toBeTrue();
    expect(component.startsWithValid("1234567890")).toBeFalse();
  });

  it("should check contact exists", () => {
    fixture.componentRef.setInput("supplierlist", [{ contact: "999" }]);
    fixture.detectChanges();
    component.checkContact("999");
    expect(component.contactexists).toBeTrue();
    component.checkContact("111");
    expect(component.contactexists).toBeFalse();
  });

  it("should check email exists", () => {
    fixture.componentRef.setInput("supplierlist", [{ email: "test@test.com" }]);
    fixture.detectChanges();
    component.checkEmail("test@test.com");
    expect(component.emailexists).toBeTrue();
    component.checkEmail("other@test.com");
    expect(component.emailexists).toBeFalse();
  });

  it("should not add supplier if form invalid", () => {
    const mockForm: any = { invalid: true, valid: false };
    component.addSupplier(mockForm);
    expect(supplierServiceSpy.addSupplier).not.toHaveBeenCalled();
  });

  it("should add supplier when form is valid", () => {
    spyOn(Swal, "fire").and.returnValue(Promise.resolve({} as any));
    const closeSpy = spyOn(component.close, "emit");
    const addSpy = spyOn(component.add, "emit");

    const mockForm: any = {
      invalid: false,
      valid: true,
      controls: {
        name: { value: "Test Supplier" },
        email: { value: "test@test.com" },
        contact: { value: "9876543210" },
        address: { value: "Test Address" },
        active: { value: "active" },
      },
    };

    component.addSupplier(mockForm);

    expect(supplierServiceSpy.addSupplier).toHaveBeenCalled();
  });
});

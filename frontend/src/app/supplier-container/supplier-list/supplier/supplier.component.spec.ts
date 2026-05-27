import { ComponentFixture, TestBed } from "@angular/core/testing";
import { SupplierComponent } from "./supplier.component";
import { SupplierService } from "./supplier.service";
import { ActivityDaoService } from "../../../dao/activitydao.service";
import { of } from "rxjs";
import Swal from "sweetalert2";
import { SupplierWithProducts } from "./supplier.model";

describe("SupplierComponent", () => {
  let component: SupplierComponent;
  let fixture: ComponentFixture<SupplierComponent>;

  let supplierServiceSpy: jasmine.SpyObj<SupplierService>;
  let activityServiceSpy: jasmine.SpyObj<ActivityDaoService>;

  const mockSupplier: SupplierWithProducts = {
    id: "1",
    name: "ABC",
    email: "a@a.com",
    contact: "999",
    address: "Addr",
    performance: "Good",
    rating: 4,
    active: true,
    zoneid: "z1",
    categoryid: "c1",
    productids: ["p1"],
  } as any;

  beforeEach(async () => {
    supplierServiceSpy = jasmine.createSpyObj("SupplierService", [
      "updateSupplierDetails",
      "DeleteSupplierById",
      "removeSupplierFromProducts",
    ]);
    activityServiceSpy = jasmine.createSpyObj("ActivityDaoService", [
      "updateActivity",
    ]);

    supplierServiceSpy.updateSupplierDetails.and.returnValue(of({}));
    supplierServiceSpy.DeleteSupplierById.and.returnValue(of({}));
    supplierServiceSpy.removeSupplierFromProducts.and.returnValue(of({}));
    activityServiceSpy.updateActivity.and.returnValue(of({}));

    await TestBed.configureTestingModule({
      imports: [SupplierComponent],
      providers: [
        { provide: SupplierService, useValue: supplierServiceSpy },
        { provide: ActivityDaoService, useValue: activityServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SupplierComponent);
    component = fixture.componentInstance;

    // set required input
    fixture.componentRef.setInput("supplierdata", mockSupplier);
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("should map performance correctly", () => {
    expect(component.getPerformance(5)).toBe("Excellent");
    expect(component.getPerformance(2)).toBe("Average");
  });

  it("should round rating", () => {
    expect(component.round(3.6)).toBe(4);
  });

  it("should update supplier details when form is dirty", () => {
    const swalSpy = spyOn(Swal, "fire").and.returnValue(
      Promise.resolve({} as any),
    );

    const mockForm: any = {
      dirty: true,
      value: {
        suppliercontact: "123",
        supplieraddress: "New Addr",
        active: false,
      },
    };

    component.updateSupplierDetails(mockForm);

    expect(supplierServiceSpy.updateSupplierDetails).toHaveBeenCalled();
    expect(activityServiceSpy.updateActivity).toHaveBeenCalled();
    expect(swalSpy).toHaveBeenCalled();
  });

  it("should toggle edit mode", () => {
    const initial = component.edit;
    component.btnTrigger();
    expect(component.edit).toBe(!initial);
  });

  it("should delete supplier after confirmation", async () => {
    spyOn(Swal, "fire").and.returnValues(
      Promise.resolve({ isConfirmed: true } as any),
      Promise.resolve({} as any),
    );

    const emitSpy = spyOn(component.delete, "emit");

    component.DeleteSupplier();
    await Promise.resolve();

    expect(supplierServiceSpy.removeSupplierFromProducts).toHaveBeenCalledWith(
      "1",
      ["p1"],
    );
    expect(supplierServiceSpy.DeleteSupplierById).toHaveBeenCalledWith("1");
    expect(emitSpy).toHaveBeenCalledWith("1");
    expect(activityServiceSpy.updateActivity).toHaveBeenCalled();
  });

  it("should not update supplier details when form is not dirty", () => {
    const mockForm: any = {
      dirty: false,
      value: {},
    };

    component.updateSupplierDetails(mockForm);

    expect(supplierServiceSpy.updateSupplierDetails).not.toHaveBeenCalled();
  });

  it("should return N/A for invalid rating", () => {
    expect(component.getPerformance(10)).toBe("N/A");
    expect(component.getPerformance(0)).toBe("N/A");
  });

  it("should set editRating when entering edit mode", () => {
    component.supplierrating = 4.7;
    component.edit = false;
    component.btnTrigger();
    expect(component.edit).toBeTrue();
    expect(component.editRating).toBe(5);
  });

  it("should map all performance levels correctly", () => {
    expect(component.getPerformance(1)).toBe("Poor");
    expect(component.getPerformance(3)).toBe("Good");
    expect(component.getPerformance(4)).toBe("Very Good");
  });
});

import { ComponentFixture, TestBed } from "@angular/core/testing";
import { SupplierfeedbackComponent } from "./supplier-feedback.component";
import { SupplierService } from "../supplier/supplier.service";
import { ActivityDaoService } from "../../../dao/activitydao.service";
import { ActivatedRoute, Router } from "@angular/router";
import { of } from "rxjs";
import Swal from "sweetalert2";
import { Supplier } from "../supplier/supplier.model";

describe("SupplierfeedbackComponent", () => {
  let component: SupplierfeedbackComponent;
  let fixture: ComponentFixture<SupplierfeedbackComponent>;

  let supplierServiceSpy: jasmine.SpyObj<SupplierService>;
  let activityServiceSpy: jasmine.SpyObj<ActivityDaoService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    supplierServiceSpy = jasmine.createSpyObj("SupplierService", [
      "getSupplierById",
      "calculateRating",
    ]);
    activityServiceSpy = jasmine.createSpyObj("ActivityDaoService", [
      "updateActivity",
    ]);
    routerSpy = jasmine.createSpyObj("Router", ["navigate"]);

    const mockSupplier: Supplier = {
      id: "1",
      name: "ABC",
      contact: "",
      address: "",
      performance: "",
      rating: 0,
      email: "",
      zoneid: "zone-1",
      categoryid: "cat-1",
      active: true,
      productids: [] as string[],
      length: function (arg0: string, length: any, arg2: any): void {
        throw new Error("Function not implemented.");
      },
    };

    supplierServiceSpy.getSupplierById.and.returnValue(of(mockSupplier));
    activityServiceSpy.updateActivity.and.returnValue(of({}));

    await TestBed.configureTestingModule({
      imports: [SupplierfeedbackComponent],
      providers: [
        { provide: SupplierService, useValue: supplierServiceSpy },
        { provide: ActivityDaoService, useValue: activityServiceSpy },
        {
          provide: ActivatedRoute,
          useValue: { params: of({ supplierid: "1" }) },
        },
        { provide: Router, useValue: routerSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SupplierfeedbackComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("should load supplier on init", () => {
    expect(supplierServiceSpy.getSupplierById).toHaveBeenCalledWith("1");
    expect(component.supplier().name).toBe("ABC");
  });

  it("should submit feedback when form is valid", async () => {
    const swalSpy = spyOn(Swal, "fire").and.returnValue(
      Promise.resolve({ isConfirmed: true } as any),
    );

    const mockForm: any = {
      valid: true,
      controls: {
        rating1: { value: "1" },
        rating2: { value: "2" },
        rating3: { value: "3" },
        rating4: { value: "4" },
        rating5: { value: "5" },
      },
    };

    component.submitFeedback(mockForm);

    expect(supplierServiceSpy.calculateRating).toHaveBeenCalledWith("1", 15);
    expect(activityServiceSpy.updateActivity).toHaveBeenCalled();

    await Promise.resolve();
    expect(swalSpy).toHaveBeenCalled();
  });

  it("should navigate on cancel", () => {
    component.onCancel();
    expect(routerSpy.navigate).toHaveBeenCalled();
  });

  it("should not submit feedback when form is invalid", () => {
    const mockForm = {
      valid: false,
      controls: {},
    } as unknown as any;

    component.submitFeedback(mockForm);
    expect(supplierServiceSpy.calculateRating).not.toHaveBeenCalled();
  });

  it("should set supplierid from route params", () => {
    expect(component.supplierid()).toBe("1");
  });
});

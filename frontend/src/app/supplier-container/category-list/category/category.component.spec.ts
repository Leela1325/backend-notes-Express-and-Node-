import { ComponentFixture, TestBed } from "@angular/core/testing";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { RouterTestingModule } from "@angular/router/testing";
import { ActivatedRoute, Router } from "@angular/router";
import { of } from "rxjs";
import { CategoryComponent } from "./category.component";

describe("CategoryComponent", () => {
  let component: CategoryComponent;
  let fixture: ComponentFixture<CategoryComponent>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    routerSpy = jasmine.createSpyObj("Router", ["navigate"]);

    await TestBed.configureTestingModule({
      imports: [
        CategoryComponent,
        HttpClientTestingModule,
        RouterTestingModule,
      ],
      providers: [
        { provide: Router, useValue: routerSpy },
        {
          provide: ActivatedRoute,
          useValue: { params: of({ zoneid: "1" }) },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CategoryComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput("name", "Test Category");
    fixture.componentRef.setInput("categoryId", "c1");
    fixture.componentRef.setInput("supplierArray", [
      { id: "1", active: true },
      { id: "2", active: false },
      { id: "3", active: true },
    ]);
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("should compute active suppliers count", () => {
    expect(component.active()).toBe(2);
  });

  it("should compute inactive suppliers count", () => {
    expect(component.inactive()).toBe(1);
  });

  it("should navigate to suppliers list", () => {
    component.navigateToSuppliers();
    expect(routerSpy.navigate).toHaveBeenCalledWith(
      ["c1", "suppliers-list"],
      jasmine.any(Object),
    );
  });
});

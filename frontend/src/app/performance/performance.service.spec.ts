import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HttpParams } from '@angular/common/http';

import { PerformanceService } from './performance.service';
import {
  CategoryAnalytic,
  DailySale,
  ProductDailySale,
  ProductOverview,
  ProductPerformanceData,
  WeeklyCategorySales
} from './sales.model';

const API_BASE = 'http://localhost:4040';

describe('PerformanceService', () => {
  let service: PerformanceService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [PerformanceService]
    });

    service = TestBed.inject(PerformanceService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    // Verify that no unmatched requests are outstanding
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize allCategories as an empty array', () => {
    expect(service.allCategories).toEqual([]);
  });

  // ---------------------------------------------------------------------------
  // getAllCategories
  // ---------------------------------------------------------------------------
  describe('getAllCategories', () => {
    it('should GET /categories/all and populate allCategories with names', () => {
      const mockResponse = [
        { _id: 'cat-001', name: 'Electronics' },
        { _id: 'cat-002', name: 'Groceries' },
        { _id: 'cat-003', name: 'Apparel' }
      ];

      service.getAllCategories().subscribe(res => {
        expect(res).toEqual(mockResponse);
        expect(res.length).toBe(3);
      });

      const req = httpMock.expectOne(`${API_BASE}/categories/all`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);

      // tap side-effect should have populated allCategories
      expect(service.allCategories).toEqual(['Electronics', 'Groceries', 'Apparel']);
    });

    it('should set allCategories to empty array when API returns empty list', () => {
      service.getAllCategories().subscribe(res => {
        expect(res).toEqual([]);
      });

      const req = httpMock.expectOne(`${API_BASE}/categories/all`);
      req.flush([]);

      expect(service.allCategories).toEqual([]);
    });

    it('should propagate HTTP errors and leave allCategories untouched', () => {
      service.allCategories = ['Stale'];
      let errorCaught: any;

      service.getAllCategories().subscribe({
        next: () => fail('expected error'),
        error: err => (errorCaught = err)
      });

      const req = httpMock.expectOne(`${API_BASE}/categories/all`);
      req.flush('Server down', { status: 500, statusText: 'Internal Server Error' });

      expect(errorCaught.status).toBe(500);
      expect(service.allCategories).toEqual(['Stale']);
    });
  });

  // ---------------------------------------------------------------------------
  // getAllProductsNames
  // ---------------------------------------------------------------------------
  describe('getAllProductsNames', () => {
    it('should GET /products/all and return the product list', () => {
      const mockResponse = [
        { _id: 'prod-001', name: 'Laptop', description: 'A fast laptop' },
        { _id: 'prod-002', name: 'Phone', description: 'A new phone' }
      ];

      service.getAllProductsNames().subscribe(res => {
        expect(res).toEqual(mockResponse);
        expect(res.length).toBe(2);
      });

      const req = httpMock.expectOne(`${API_BASE}/products/all`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  // ---------------------------------------------------------------------------
  // getCategoryPerformers
  // ---------------------------------------------------------------------------
  describe('getCategoryPerformers', () => {
    it('should GET top-products with days=7 & type=best', () => {
      const mockResponse: CategoryAnalytic[] = [
        { productId: 'p1', name: 'Item 1', totalSales: 100, revenue: 5000 } as any
      ];

      service.getCategoryPerformers('cat-001', 7, 'best').subscribe(res => {
        expect(res).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(
        r =>
          r.url === `${API_BASE}/analytics/categories/cat-001/top-products` &&
          r.params.get('days') === '7' &&
          r.params.get('type') === 'best'
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should GET top-products with type=worst', () => {
      service.getCategoryPerformers('cat-002', 30, 'worst').subscribe();

      const req = httpMock.expectOne(
        r =>
          r.url === `${API_BASE}/analytics/categories/cat-002/top-products` &&
          r.params.get('type') === 'worst' &&
          r.params.get('days') === '30'
      );
      req.flush([]);
    });

    it('should encode the categoryid in the URL', () => {
      service.getCategoryPerformers('cat-001', 14, 'best').subscribe();

      const req = httpMock.expectOne(req =>
        req.url.includes('/analytics/categories/cat-001/top-products')
      );
      req.flush([]);
    });
  });

  // ---------------------------------------------------------------------------
  // getCategoryAnalytics  (delegates to getCategoryPerformers)
  // ---------------------------------------------------------------------------
  describe('getCategoryAnalytics', () => {
    it('should delegate to getCategoryPerformers with "best" when type=BEST', () => {
      const spy = spyOn(service, 'getCategoryPerformers').and.callThrough();

      service.getCategoryAnalytics('cat-001', 7, 'BEST').subscribe();

      expect(spy).toHaveBeenCalledWith('cat-001', 7, 'best');

      const req = httpMock.expectOne(
        r => r.url === `${API_BASE}/analytics/categories/cat-001/top-products`
      );
      req.flush([]);
    });

    it('should delegate to getCategoryPerformers with "worst" when type=WORST', () => {
      const spy = spyOn(service, 'getCategoryPerformers').and.callThrough();

      service.getCategoryAnalytics('cat-002', 14, 'WORST').subscribe();

      expect(spy).toHaveBeenCalledWith('cat-002', 14, 'worst');

      const req = httpMock.expectOne(
        r => r.url === `${API_BASE}/analytics/categories/cat-002/top-products`
      );
      expect(req.request.params.get('type')).toBe('worst');
      req.flush([]);
    });
  });

  // ---------------------------------------------------------------------------
  // getDailySalesByCategory
  // ---------------------------------------------------------------------------
  describe('getDailySalesByCategory', () => {
    it('should GET daily-sales for a category with given days', () => {
      const mockResponse = { categoryId: 'cat-001', series: [] } as unknown as DailySale;

      service.getDailySalesByCategory('cat-001', 14).subscribe(res => {
        expect(res).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(
        r =>
          r.url === `${API_BASE}/analytics/categories/cat-001/daily-sales` &&
          r.params.get('days') === '14'
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  // ---------------------------------------------------------------------------
  // getProductOverview
  // ---------------------------------------------------------------------------
  describe('getProductOverview', () => {
    it('should GET product overview with the provided days', () => {
      const mockResponse = { productId: 'prod-001', totalRevenue: 12000 } as unknown as ProductOverview;

      service.getProductOverview('prod-001', 7).subscribe(res => {
        expect(res).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(
        r =>
          r.url === `${API_BASE}/analytics/products/prod-001/overview` &&
          r.params.get('days') === '7'
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should default days to 30 when not provided', () => {
      service.getProductOverview('prod-001').subscribe();

      const req = httpMock.expectOne(
        r =>
          r.url === `${API_BASE}/analytics/products/prod-001/overview` &&
          r.params.get('days') === '30'
      );
      req.flush({} as ProductOverview);
    });
  });

  // ---------------------------------------------------------------------------
  // getProductSalesAnalytics
  // ---------------------------------------------------------------------------
  describe('getProductSalesAnalytics', () => {
    it('should GET product daily-sales with given days', () => {
      const mockResponse = { productId: 'prod-001', daily: [] } as unknown as ProductDailySale;

      service.getProductSalesAnalytics('prod-001', 30).subscribe(res => {
        expect(res).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(
        r =>
          r.url === `${API_BASE}/analytics/products/prod-001/daily-sales` &&
          r.params.get('days') === '30'
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  // ---------------------------------------------------------------------------
  // getProductPerformance
  // ---------------------------------------------------------------------------
  describe('getProductPerformance', () => {
    it('should GET product performance without params', () => {
      const mockResponse = { productId: 'prod-001', heatmap: [] } as unknown as ProductPerformanceData;

      service.getProductPerformance('prod-001').subscribe(res => {
        expect(res).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${API_BASE}/analytics/products/prod-001/performance`);
      expect(req.request.method).toBe('GET');
      expect(req.request.params.keys().length).toBe(0);
      req.flush(mockResponse);
    });
  });

  // ---------------------------------------------------------------------------
  // getWeeklyCategorySales
  // ---------------------------------------------------------------------------
  describe('getWeeklyCategorySales', () => {
    it('should GET weekly-sales with the provided days', () => {
      const mockResponse = { weeks: [] } as unknown as WeeklyCategorySales;

      service.getWeeklyCategorySales(14).subscribe(res => {
        expect(res).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(
        r =>
          r.url === `${API_BASE}/analytics/categories/weekly-sales` &&
          r.params.get('days') === '14'
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should default days to 30 when not provided', () => {
      service.getWeeklyCategorySales().subscribe();

      const req = httpMock.expectOne(
        r =>
          r.url === `${API_BASE}/analytics/categories/weekly-sales` &&
          r.params.get('days') === '30'
      );
      req.flush({} as WeeklyCategorySales);
    });
  });
});
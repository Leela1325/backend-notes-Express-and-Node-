export interface VisitorsResponse {
  id: number;
  week: number;
  days: string[];
  visitors: number[];
}

export interface InventoryItem {
  name: string;
  stockValue: number;
}

export interface WeeklyCategorySales {
  dates: string[];
  series: { name: string; data: number[] }[];
}

export interface DailySale {
  dates: string[];
  revenue: number[];
}

export interface CategoryAnalytic {
  productId: string;
  productName: string;
  category: string;
  value: number;
}

export type CategoryPerformer = CategoryAnalytic;

export interface Sale {
  id: string;
  productid: string;
  productname: string;
  category: string;
  timestamp: string;
  quantity: number;
}

export interface Product {
  id: string;
  name: string;
  zoneid: number;
  categoryid: string;
  supplierid: number;
  quantity: number;
  price: number;
  description: string;
  createdat: string;
  updatedat: string;
}

export interface Category {
  id: string;
  name: string;
  zoneid: number;
  description: string;
}

export interface ProductDailySale {
  dates: string[];
  quantity: number[];
}

export interface ProductPerformanceData {
  productName: string;
  revenue: number[];      // 12 entries (Jan–Dec)
  units: number[];        // 12 entries
  heatmap: number[][];    // [12 months][7 days] Mon=0 … Sun=6
}

export interface ProductOverview {
  revenue: number;
  revenuePrev: number;
  unitsSold: number;
  unitsSoldPrev: number;
  avgPrice: number;
  avgPricePrev: number;
}
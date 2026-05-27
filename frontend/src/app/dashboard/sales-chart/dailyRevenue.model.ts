export interface DailyRevenue {
  dates: string[];      // backend sends Date objects → become ISO strings in JSON
  revenue: number[];
}
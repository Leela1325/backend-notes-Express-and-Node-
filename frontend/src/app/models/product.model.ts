// 1. Define what a single stock batch looks like
export interface InventoryBatch {
  quantity: number;
  expirydate: string;
  price: number;
}

// 2. Update the main Product interface
export interface Product {
  id: string;
  name: string;
  zoneid: string;
  categoryid: string;
  supplierids: string[];
  price: number;
  description?: string;
  // CHANGE: Replace 'quantity' and 'expirydate' with 'inventory' array
  inventory: InventoryBatch[]; 
  updatedat?: string;
}

// 3. Keep your View Model for the table
export type ProductWithNames = Product & {
  categoryName?: string;
  zoneName?: string;
  supplierName?: string;
};
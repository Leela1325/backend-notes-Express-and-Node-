// 1. Define what a single stock batch looks like
export interface InventoryBatch {
   _id: string;
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
 
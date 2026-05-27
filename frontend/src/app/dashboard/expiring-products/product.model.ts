export interface InventoryBatch {
  quantity: number;
  expirydate: string;
}

export interface Product {
  _id: string;
  name: string;
  zoneid: string;
  categoryid: string;
  supplierids: string[];
  price: number;
  description: string;
  inventory: InventoryBatch[];
  updatedat: string;
}
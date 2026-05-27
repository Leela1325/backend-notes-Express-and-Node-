export interface Product {
  id: string;
  name: string;
  zoneid: string;
  categoryid: string;
  supplierids: string[];  
 
  description: string;
  updatedat: string;
  inventory: {            
    quantity: number;
    expirydate: string;
     price: number;
  }[];
}
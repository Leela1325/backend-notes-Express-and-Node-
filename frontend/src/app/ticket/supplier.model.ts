export interface Supplier {
  id: string;
  name: string;
  contact: string;
  email: string;
  address: string;
  performance: string;
  zoneid: string;
  categoryid: string;
  rating: number;
  active: boolean;
  productids: string[];
}
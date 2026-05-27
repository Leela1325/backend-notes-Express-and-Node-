export interface ticket {
  id: string;
  productid: string;
  productName: string;
  requestedQuantity: number;
  createdAt: string;
  status: string;
  supplierId?: string;
    updatedat?: string;

  suppliers?: TicketSupplier[];
}

export interface TicketSupplier {
  id: string;
  name: string;
  rating: number;
  email?: string;
  contact?: string;
  performance?: string;
  active?: boolean;
}
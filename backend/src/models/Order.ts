export interface Order {
  order_id: number;
  customer_id: number;
  status: string;
  total_amount: number;
  order_date: string;
  delivery_date?: string;
}
export interface OrderDetail {
  orderdetail_id?: number;
  order_id: number;
  product_item_id: number;
  quantity: number;
  amount: number;
}

export interface UpdateOrderStatusDto {
  order_id: number;
  status: string;
}

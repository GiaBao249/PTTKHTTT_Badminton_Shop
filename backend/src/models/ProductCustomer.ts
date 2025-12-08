export interface ProductCustomer {
  product_id: number;
  supplier_id?: number;
  category_id: number;
  product_name: string;
  price: number;
  description?: string;
  warranty_period?: number;
  category?: {
    category_id: number;
    category_name: string;
  };
  total_quantity?: number;
  thumbnail?: string | null;
}

export interface ProductDetail {
  product_id: number;
  supplier_id?: number;
  category_id: number;
  product_name: string;
  price: number;
  description?: string;
  warranty_period?: number;
  category?: {
    category_id: number;
    category_name: string;
  };
  items: Array<{
    product_item_id: number;
    product_id: number;
    quantity: number;
    images: Array<{
      image_id: number;
      image_filename: string;
      image_url: string;
    }>;
    attributes: Array<{
      variation_option_id: number;
      value?: string;
      variation?: {
        variation_id: number;
        name: string;
      };
    }>;
  }>;
}

export interface Variation {
  variation_id: number;
  name: string;
  variation_options: Array<{
    variation_option_id: number;
    value: string;
  }>;
}

export interface TopByCategory {
  category_id: number;
  category_name: string;
  products: Array<ProductCustomer & { sold_quantity: number }>;
}

export interface FilterDto {
  optionIds?: number[];
  categoryId?: number | string;
}


export type ProductListItem = {
  product_id: number;
  product_name: string;
  price: number;
  description: string | null;
  category: { category_id: number; category_name: string } | null;
  thumbnail?: string | null;
  total_quantity?: number;
};

export type Products = {
  id: number;
  title: string;
  image: string;
  price: number;
  isSale: boolean;
  rating: number;
  countRating: number;
  company: string;
  category: string;
  color: string;
  inStockCount: number;
  description: string;
  percent?: number;
  isBestSeller?: boolean;
  isNew?: boolean;
};

export type VariationAttribute = {
  variation_id: number;
  name: string;
  variation_option_id: number;
  value: string;
  //variation: { variation_id: number; name: string };
};

export type ProductItem = {
  product_item_id: number;
  product_id: number;
  quantity: number;
  images: { image_id: number; image_filename: string }[];
  attributes: VariationAttribute[];
};

export type ProductDetail = ProductListItem & {
  items: ProductItem[];
};

export type CartItem = {
  product: ProductListItem;
  quantity: number;
};

export type ProductCardVariant =
  | "default"
  | "compact"
  | "minimal"
  | "list"
  | "cart";

export type ProductCardProps = {
  product: ProductListItem;
  variant?: ProductCardVariant;
};

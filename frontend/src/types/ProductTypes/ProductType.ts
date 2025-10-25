export type Products = {
  id: number;
  title: string;
  image: string;
  price: number;
  isSale: boolean;
  rating: number;
  countRating: number;
  company: string;
  color: string;
  inStockCount: number;
  description: string;
  percent?: number;
  isBestSeller?: boolean;
  isNew?: boolean;
  balance?: string;
  material?: string;
  stringTension?: string;
};

export type ProductCardVariant = "default" | "compact" | "minimal" | "list";

export type ProductCardProps = {
  product: Products;
  variant?: ProductCardVariant;
};

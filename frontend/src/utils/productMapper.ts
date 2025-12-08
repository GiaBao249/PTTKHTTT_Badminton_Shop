import type {
  ProductListItem,
  Products,
} from "../types/ProductTypes/ProductType";
import placeholder from "../assets/c2.jpg";

export function toUIProduct(p: ProductListItem): Products {
  return {
    id: p.product_id,
    title: p.product_name,
    image: p.thumbnail ?? (placeholder as unknown as string),
    price: p.price,
    isSale: false,
    rating: 0,
    countRating: 0,
    company: "",
    category: p.category?.category_name ?? "Không có danh mục",
    color: "",
    inStockCount: p.total_quantity ?? 0,
    description: p.description ?? "",
  };
}

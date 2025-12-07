import { injectable, inject } from "tsyringe";
import { TopSellingProductRepository } from "../repositories/TopSellingProductRepository";
import { TopSellingProduct } from "../models/Product";
import { supabase } from "../config/supabase";

@injectable()
export class TopSellingProductService {
  constructor(
    @inject(TopSellingProductRepository)
    private productRepo: TopSellingProductRepository
  ) {}
  async getTopSellingProducts(limit: number = 5): Promise<TopSellingProduct[]> {
    const orderDetails = await this.productRepo.getOrderDetails();
    if (orderDetails.length === 0) {
      return [];
    }
    const productItemIds = [
      ...new Set(orderDetails.map((od) => od.product_item_id)),
    ].filter(Boolean) as number[];
    const productItems = await this.productRepo.getProductItemsByIds(
      productItemIds
    );
    const productItemIdToProductId = new Map<number, number>();
    productItems.forEach((pi) => {
      productItemIdToProductId.set(pi.product_item_id, pi.product_id);
    });
    const productIdToSoldQuantity = new Map<number, number>();
    orderDetails.forEach((od) => {
      const productId = productItemIdToProductId.get(od.product_item_id);
      if (productId) {
        const current = productIdToSoldQuantity.get(productId) || 0;
        productIdToSoldQuantity.set(productId, current + (od.quantity || 0));
      }
    });
    const sortProductIds = Array.from(productIdToSoldQuantity.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([productId]) => productId);

    if (sortProductIds.length === 0) {
      return [];
    }
    const products = await this.productRepo.getProductsWithImages(
      sortProductIds
    );
    const thumbnailMap = new Map<number, string>();
    products.forEach((p: any) => {
      const firstItem = p.product_item?.[0];
      const firstImage = firstItem?.product_image?.[0]?.image_filename;
      if (p.product_id && firstImage && !thumbnailMap.has(p.product_id)) {
        const {
          data: { publicUrl },
        } = supabase.storage.from("product-images").getPublicUrl(firstImage);
        thumbnailMap.set(p.product_id, publicUrl);
      }
    });
    return sortProductIds
      .map((productId: any) => {
        const product = products.find((p: any) => p.product_id === productId);
        const soldQuantity = productIdToSoldQuantity.get(productId) || 0;

        if (!product) return null;

        return {
          product_id: productId,
          product_name: product.product_name,
          price: product.price || 0,
          sold_quantity: soldQuantity,
          thumbnail: thumbnailMap.get(productId) ?? null,
        };
      })
      .filter((p: any): p is TopSellingProduct => p !== null);
  }
}

import { injectable, inject } from "tsyringe";
import { ProductCustomerRepository } from "../repositories/ProductCustomerRepository";
import {
  ProductCustomer,
  ProductDetail,
  Variation,
  TopByCategory,
  FilterDto,
} from "../models/ProductCustomer";
import { AppError } from "../middleware/errorHandler";
import { supabase } from "../config/supabase";

@injectable()
export class ProductCustomerService {
  constructor(
    @inject(ProductCustomerRepository)
    private productCustomerRepo: ProductCustomerRepository
  ) {}

  /**
   * Lấy tất cả products với quantity và thumbnail
   */
  async getAllProducts(): Promise<ProductCustomer[]> {
    const products = await this.productCustomerRepo.findAll();
    if (products.length === 0) return [];

    const productIds = products.map((p: any) => p.product_id);
    const { quantityMap, thumbnailMap } =
      await this.productCustomerRepo.getProductItemsWithQuantityAndImages(
        productIds
      );

    return products.map((p: any) => ({
      ...p,
      total_quantity: quantityMap.get(p.product_id) ?? 0,
      thumbnail: thumbnailMap.get(p.product_id) ?? null,
    }));
  }

  /**
   * Lấy products theo category
   */
  async getProductsByCategory(categoryId: number): Promise<ProductCustomer[]> {
    const products = await this.productCustomerRepo.findByCategory(categoryId);
    if (products.length === 0) return [];

    const productIds = products.map((p: any) => p.product_id);
    const { quantityMap, thumbnailMap } =
      await this.productCustomerRepo.getProductItemsWithQuantityAndImages(
        productIds
      );

    return products.map((p: any) => ({
      ...p,
      total_quantity: quantityMap.get(p.product_id) ?? 0,
      thumbnail: thumbnailMap.get(p.product_id) ?? null,
    }));
  }

  /**
   * Search products
   */
  async searchProducts(keyword: string): Promise<ProductCustomer[]> {
    if (!keyword || keyword.trim() === "") {
      return [];
    }

    const products = await this.productCustomerRepo.search(keyword.trim());
    if (products.length === 0) return [];

    const productIds = products.map((p: any) => p.product_id);
    const { quantityMap, thumbnailMap } =
      await this.productCustomerRepo.getProductItemsWithQuantityAndImages(
        productIds
      );

    return products.map((p: any) => ({
      ...p,
      total_quantity: quantityMap.get(p.product_id) ?? 0,
      thumbnail: thumbnailMap.get(p.product_id) ?? null,
    }));
  }

  /**
   * Filter products
   */
  async filterProducts(filterDto: FilterDto): Promise<ProductCustomer[]> {
    const products = await this.productCustomerRepo.filter(filterDto);
    if (products.length === 0) return [];

    const productIds = products.map((p: any) => p.product_id);

    // Nếu có optionIds, filter theo configurations
    if (filterDto.optionIds && filterDto.optionIds.length > 0) {
      const itemsWithConfig = await this.productCustomerRepo.getProductItemsWithConfigurations(
        productIds
      );

      const productIdMatches = new Set<number>();
      itemsWithConfig.forEach((it: any) => {
        const itemOptionIds = new Set<number>(
          (it.product_configuration ?? []).map(
            (c: any) => c.variation_option_id
          )
        );
        const hasSome = filterDto.optionIds!.some((id) =>
          itemOptionIds.has(id)
        );
        if (hasSome) productIdMatches.add(it.product_id);
      });

      const filteredProducts = products.filter((p: any) =>
        productIdMatches.has(p.product_id)
      );

      if (filteredProducts.length === 0) return [];

      const filteredProductIds = filteredProducts.map((p: any) => p.product_id);
      const { quantityMap } =
        await this.productCustomerRepo.getProductItemsWithQuantityAndImages(
          filteredProductIds
        );

      return filteredProducts.map((p: any) => ({
        ...p,
        total_quantity: quantityMap.get(p.product_id) ?? 0,
      }));
    } else {
      // Không có optionIds, chỉ lấy quantity
      const { quantityMap } =
        await this.productCustomerRepo.getProductItemsWithQuantityAndImages(
          productIds
        );

      return products.map((p: any) => ({
        ...p,
        total_quantity: quantityMap.get(p.product_id) ?? 0,
      }));
    }
  }

  /**
   * Lấy featured products
   */
  async getFeaturedProducts(limit: number = 4): Promise<ProductCustomer[]> {
    const products = await this.productCustomerRepo.findFeatured(limit);
    if (products.length === 0) return [];

    const productIds = products.map((p: any) => p.product_id);
    const { quantityMap, thumbnailMap } =
      await this.productCustomerRepo.getProductItemsWithQuantityAndImages(
        productIds
      );

    return products.map((p: any) => ({
      ...p,
      total_quantity: quantityMap.get(p.product_id) ?? 0,
      thumbnail: thumbnailMap.get(p.product_id) ?? null,
    }));
  }

  /**
   * Lấy product detail
   */
  async getProductDetail(productId: number): Promise<ProductDetail> {
    const product = await this.productCustomerRepo.findDetailById(productId);
    if (!product) {
      throw new AppError(404, "Product not found", "PRODUCT_NOT_FOUND");
    }

    const items = await this.productCustomerRepo.getProductItemsWithDetails(
      productId
    );

    const normalizedItems = items.map((it: any) => ({
      product_item_id: it.product_item_id,
      product_id: it.product_id,
      quantity: it.quantity,
      images: (it.product_image ?? []).map((img: any) => {
        const {
          data: { publicUrl },
        } = supabase.storage
          .from("product-images")
          .getPublicUrl(img.image_filename);
        return {
          image_id: img.image_id,
          image_filename: img.image_filename,
          image_url: publicUrl,
        };
      }),
      attributes: (it.product_configuration ?? []).map((cfg: any) => ({
        variation_option_id: cfg.variation_option_id,
        value: cfg.variation_options?.value,
        variation: cfg.variation_options?.variation
          ? {
              variation_id: cfg.variation_options.variation.variation_id,
              name: cfg.variation_options.variation.name,
            }
          : null,
      })),
    }));

    return {
      ...product,
      items: normalizedItems,
    };
  }

  /**
   * Lấy variations theo category
   */
  async getVariationsByCategory(categoryId: number): Promise<Variation[]> {
    return await this.productCustomerRepo.getVariationsByCategory(categoryId);
  }

  /**
   * Đếm products
   */
  async countProducts(categoryId?: number): Promise<number> {
    return await this.productCustomerRepo.count(categoryId);
  }

  /**
   * Lấy top products by category
   */
  async getTopByCategories(categoryIds: number[] = [1, 2, 5]): Promise<TopByCategory[]> {
    const products = await this.productCustomerRepo.getTopByCategories(
      categoryIds
    );

    if (products.length === 0) {
      return categoryIds.map((id) => ({
        category_id: id,
        category_name: "",
        products: [],
      }));
    }

    const productIds = products.map((p: any) => p.product_id);
    const { items, thumbnailMap, inventoryMap } =
      await this.productCustomerRepo.getProductItemsForTop(productIds);

    const productItemIds = items.map((it: any) => it.product_item_id);
    const orderDetails =
      productItemIds.length > 0
        ? await this.productCustomerRepo.getOrderDetailsByProductItemIds(
            productItemIds
          )
        : [];

    // Map product_item_id to product_id
    const productItemIdToProductId = new Map<number, number>();
    items.forEach((it: any) => {
      productItemIdToProductId.set(it.product_item_id, it.product_id);
    });

    // Tính sold quantity
    const productIdToSold = new Map<number, number>();
    orderDetails.forEach((od) => {
      const pid = productItemIdToProductId.get(od.product_item_id);
      if (!pid) return;
      const prev = productIdToSold.get(pid) ?? 0;
      productIdToSold.set(pid, prev + od.quantity);
    });

    // Group by category
    return categoryIds.map((catId) => {
      const categoryProducts = products.filter(
        (p: any) => p.category_id === catId
      );

      let categoryName = "";
      if (categoryProducts.length > 0 && categoryProducts[0]) {
        const firstProduct = categoryProducts[0];
        if (firstProduct?.category) {
          const cat = Array.isArray(firstProduct.category)
            ? firstProduct.category[0]
            : firstProduct.category;
          categoryName = cat?.category_name || "";
        }
      }

      const topProducts = [...categoryProducts]
        .map((p: any) => ({
          ...p,
          sold_quantity: productIdToSold.get(p.product_id) ?? 0,
          total_quantity: inventoryMap.get(p.product_id) ?? 0,
          thumbnail: thumbnailMap.get(p.product_id) ?? null,
        }))
        .sort((a, b) => b.sold_quantity - a.sold_quantity)
        .slice(0, 4);

      return {
        category_id: catId,
        category_name: categoryName,
        products: topProducts,
      };
    });
  }

  /**
   * Lấy specification của product
   */
  async getProductSpecification(
    productId: number
  ): Promise<Array<{ name: string; value: string }>> {
    return await this.productCustomerRepo.getProductSpecification(productId);
  }
}


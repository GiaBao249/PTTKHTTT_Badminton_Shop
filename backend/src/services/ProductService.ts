import { injectable, inject } from "tsyringe";
import { ProductRepository } from "../repositories/ProductRepository";
import {
  Product,
  ProductItem,
  CreateProductDto,
  UpdateProductDto,
} from "../models/Product";
import { AppError } from "../middleware/errorHandler";

@injectable()
export class ProductService {
  constructor(
    @inject(ProductRepository) private productRepo: ProductRepository
  ) {}
  async getAllProducts(): Promise<Product[]> {
    const products = await this.productRepo.findAll();
    if (products.length === 0) {
      return [];
    }
    const productIds = products.map((p) => p.product_id);
    const thumbnailMap = await this.productRepo.getProductItemsWithImages(
      productIds
    );
    return products.map((product) => ({
      ...product,
      thumbnail: thumbnailMap.get(product.product_id) ?? null,
    }));
  }
  async getProductById(productId: number): Promise<Product> {
    const product = await this.productRepo.findById(productId);
    if (!product) {
      throw new AppError(404, "Không tìm thấy sản phẩm", "PRODUCT_NOT_FOUND");
    }
    const thumbnailMap = await this.productRepo.getProductItemsWithImages([
      product.product_id,
    ]);
    return {
      ...product,
      thumbnail: thumbnailMap.get(product.product_id) ?? null,
    };
  }
  async createProduct(createDto: CreateProductDto): Promise<{
    product: Product;
    product_items: Array<{
      product_item_id: number;
      variation_option_ids: number[];
    }>;
  }> {
    if (!createDto.product_name || !createDto.category_id) {
      throw new AppError(
        400,
        "Thiếu thông tin bắt buộc: tên sản phẩm và danh mục",
        "VALIDATION_ERROR"
      );
    }

    if (
      createDto.price !== undefined &&
      createDto.price !== null &&
      createDto.price < 0
    ) {
      throw new AppError(400, "Giá bán không được âm", "VALIDATION_ERROR");
    }

    if (
      createDto.price_purchase !== undefined &&
      createDto.price_purchase !== null &&
      createDto.price_purchase < 0
    ) {
      throw new AppError(400, "Giá nhập không được âm", "VALIDATION_ERROR");
    }

    if (
      !createDto.items ||
      !Array.isArray(createDto.items) ||
      createDto.items.length === 0
    ) {
      throw new AppError(
        400,
        "Cần ít nhất một biến thể sản phẩm (item)",
        "VALIDATION_ERROR"
      );
    }
    const productData: Partial<Product> = {
      product_name: createDto.product_name,
      category_id: createDto.category_id,
      description: createDto.description || "",
      warranty_period: createDto.warranty_period || 0,
      price: createDto.price || 0,
    };
    if (createDto.supplier_id) {
      productData.supplier_id = createDto.supplier_id;
    }

    if (
      createDto.price_purchase !== undefined &&
      createDto.price_purchase !== null
    ) {
      productData.price_purchase = createDto.price_purchase;
    }
    const newProduct = await this.productRepo.create(productData);
    const productId = newProduct.product_id;
    const createdItems: Array<{
      product_item_id: number;
      variation_option_ids: number[];
    }> = [];
    for (const item of createDto.items) {
      const variationOptionIds = item.variation_option_ids || [];
      const newProductItem = await this.productRepo.createProductItem(
        productId
      );
      if (variationOptionIds.length > 0) {
        await this.productRepo.createProductConfigurations(
          newProductItem.product_item_id,
          variationOptionIds
        );
      }
      createdItems.push({
        product_item_id: newProductItem.product_item_id,
        variation_option_ids: variationOptionIds,
      });
    }
    return {
      product: newProduct,
      product_items: createdItems,
    };
  }
  async updateProduct(
    productId: number,
    updateDto: UpdateProductDto
  ): Promise<Product> {
    if (!updateDto.product_name || !updateDto.category_id || !updateDto.price) {
      throw new AppError(
        400,
        "Thiếu thông tin sản phẩm (tên, danh mục, giá)",
        "VALIDATION_ERROR"
      );
    }

    if (updateDto.price <= 0) {
      throw new AppError(400, "Giá phải lớn hơn 0", "VALIDATION_ERROR");
    }

    const existingProduct = await this.productRepo.findById(productId);
    if (!existingProduct) {
      throw new AppError(404, "Không tìm thấy sản phẩm", "PRODUCT_NOT_FOUND");
    }

    return await this.productRepo.update(productId, updateDto);
  }
  async deleteProduct(productId: number): Promise<void> {
    const existingProduct = await this.productRepo.findById(productId);
    if (!existingProduct) {
      throw new AppError(404, "Không tìm thấy sản phẩm", "PRODUCT_NOT_FOUND");
    }

    if (existingProduct.is_deleted === true) {
      throw new AppError(400, "Sản phẩm đã bị xóa", "PRODUCT_ALREADY_DELETED");
    }

    await this.productRepo.softDelete(productId);
  }
  async getAllProductItems(): Promise<ProductItem[]> {
    return await this.productRepo.findAllProductItems();
  }
}

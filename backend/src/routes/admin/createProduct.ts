import { Request, Response, Router } from "express";
import { supabase } from "../../config/supabase";

export function registerCreateProduct(router: Router) {
  router.post("/createProducts", async (req: Request, res: Response) => {
    try {
      const {
        product_name,
        category_id,
        supplier_id,
        price,
        price_purchase,
        description,
        warranty_period,
        items, // Mảng các ProductItem với variations và quantity
      } = req.body;

      // Validation
      if (!product_name || !category_id) {
        return res.status(400).json({
          error: "Thiếu thông tin bắt buộc: tên sản phẩm và danh mục",
        });
      }

      if (price !== undefined && price !== null && price < 0) {
        return res.status(400).json({ error: "Giá bán không được âm" });
      }

      if (price_purchase !== undefined && price_purchase !== null && price_purchase < 0) {
        return res.status(400).json({ error: "Giá nhập không được âm" });
      }

      // Validation items
      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({
          error: "Cần ít nhất một biến thể sản phẩm (item)",
        });
      }

      // Tạo sản phẩm mới
      const productData: any = {
        product_name,
        category_id,
        description: description || "",
        warranty_period: warranty_period || 0,
        price: price || 0,
      };

      // Thêm supplier_id nếu có
      if (supplier_id) {
        productData.supplier_id = supplier_id;
      }

      // Thêm price_purchase nếu có
      if (price_purchase !== undefined && price_purchase !== null) {
        productData.price_purchase = price_purchase;
      }

      const { data: newProduct, error: productError } = await supabase
        .from("product")
        .insert([productData])
        .select()
        .single();

      if (productError) {
        throw productError;
      }

      if (!newProduct || !newProduct.product_id) {
        return res.status(500).json({
          error: "Không thể tạo sản phẩm: Không nhận được product_id",
        });
      }

      const productId = newProduct.product_id;

      // Tạo ProductItem và ProductConfiguration cho mỗi item
      for (const item of items) {
        const { quantity, variation_option_ids } = item;

        // Validation item
        if (!quantity || quantity <= 0) {
          return res.status(400).json({
            error: "Số lượng phải lớn hơn 0",
          });
        }

        if (!variation_option_ids || !Array.isArray(variation_option_ids) || variation_option_ids.length === 0) {
          return res.status(400).json({
            error: "Mỗi item cần ít nhất một variation option",
          });
        }

        // Tạo ProductItem
        const { data: newProductItem, error: itemError } = await supabase
          .from("product_item")
          .insert([
            {
              product_id: productId,
              quantity: quantity,
            },
          ])
          .select()
          .single();

        if (itemError) {
          console.error("Lỗi khi tạo product_item:", itemError);
          throw itemError;
        }

        if (!newProductItem || !newProductItem.product_item_id) {
          return res.status(500).json({
            error: "Không thể tạo product_item: Không nhận được product_item_id",
          });
        }

        const productItemId = newProductItem.product_item_id;

        // Tạo ProductConfiguration cho mỗi variation_option_id
        const configurations = variation_option_ids.map((optionId: number) => ({
          product_item_id: productItemId,
          variation_option_id: optionId,
        }));

        const { error: configError } = await supabase
          .from("product_configuration")
          .insert(configurations);

        if (configError) {
          console.error("Lỗi khi tạo product_configuration:", configError);
          throw configError;
        }
      }

      res.status(201).json({
        success: true,
        product: newProduct,
        message: "Tạo sản phẩm thành công",
      });
    } catch (error: any) {
      console.error("Lỗi khi tạo sản phẩm:", error);
      return res.status(500).json({
        error: error.message || "Lỗi server khi tạo sản phẩm",
      });
    }
  });
}

import { Router, Request, Response } from "express";
import { supabase } from "../../config/supabase";
import { authRequired } from "../../middleware/authRequired";

export function registerCartRoutes(router: Router) {
  router.get(
    "/cart/customer/:customerId",
    async (req: Request, res: Response) => {
      const customerId = req.params.customerId;
      try {
        const { data: cart, error: cartError } = await supabase
          .from("cart")
          .select("cart_id")
          .eq("customer_id", customerId)
          .single();
        if (cartError) throw cartError;
        if (!cart || !cart.cart_id) return res.json([]);
        const { data, error } = await supabase
          .from("cartitems")
          .select(
            `
          quantity,
          total_amount,
          product_item:product_item_id(
            product_item_id,
            product_id,
            quantity,
            product:product_id(
              product_id,
              product_name,
              price,
              is_deleted,
              category:category_id(
                category_id,
                category_name
              ) 
            )
          )  
        `
          )
          .eq("cart_id", cart.cart_id);
        if (error) throw error;
        
        // Filter out items with deleted products
        const filteredData = (data || []).filter((item: any) => {
          const product = item.product_item?.product;
          return product && (product.is_deleted === false || product.is_deleted === null);
        });
        
        // Get product IDs to fetch thumbnails
        const productIds = filteredData
          .map((item: any) => item.product_item?.product?.product_id)
          .filter(Boolean);
        
        if (productIds.length > 0) {
          const { data: productItems, error: itemsError } = await supabase
            .from("product_item")
            .select(
              `
              product_id,
              product_image (
                image_filename
              )
            `
            )
            .in("product_id", productIds);
          
          const thumbnailMap = new Map<number, string>();
          if (!itemsError && productItems) {
            (productItems ?? []).forEach((item: any) => {
              const firstImage = item.product_image?.[0]?.image_filename;
              if (item.product_id && firstImage && !thumbnailMap.has(item.product_id)) {
                thumbnailMap.set(item.product_id, firstImage);
              }
            });
          }
          
          // Add thumbnail to each cart item
          const enrichedData = filteredData.map((item: any) => {
            const productId = item.product_item?.product?.product_id;
            if (productId && item.product_item?.product) {
              item.product_item.product.thumbnail = thumbnailMap.get(productId) ?? null;
            }
            return item;
          });
          
          return res.json(enrichedData);
        }
        
        return res.json(filteredData);
      } catch (err: any) {
        return res.status(400).json({ error: err.message || "Lỗi server" });
      }
    }
  );

  // CRUD
  router.post(
    "/cart/add",
    authRequired,
    async (req: Request, res: Response) => {
      const customer_id = (req as any).user?.id;
      const { product_item_id, quantity } = req.body;
      if (!customer_id) {
        return res.status(401).json({ error: "Chưa đăng nhập" });
      }
      if (!customer_id || !product_item_id || !quantity) {
        return res.status(400).json({ error: "Thiếu thông tin" });
      }
      if (typeof quantity !== "number" || quantity <= 0) {
        return res.status(400).json({ error: "Số lượng phải là số nguyên" });
      }

      try {
        let { data: cart } = await supabase
          .from("cart")
          .select("cart_id")
          .eq("customer_id", customer_id)
          .single();

        if (!cart) {
          const { data: newCart, error: createError } = await supabase
            .from("cart")
            .insert({ customer_id })
            .select("cart_id")
            .single();
          if (createError) {
            throw createError;
          }
          cart = newCart;
        }

        const { data: productItem } = await supabase
          .from("product_item")
          .select("product_id , product_item_id , quantity")
          .eq("product_item_id", product_item_id)
          .single();
        if (!productItem) throw new Error("Không tìm thấy sản phẩm");
        if (!productItem.quantity || productItem.quantity <= 0) {
          return res.status(400).json({ error: "Sản phẩm đã hết hàng" });
        }
        if (
          typeof quantity !== "number" ||
          quantity <= 0 ||
          !Number.isInteger(quantity)
        ) {
          return res
            .status(400)
            .json({ error: "Số lượng phải là số nguyên dương" });
        }
        const { data: product } = await supabase
          .from("product")
          .select("price")
          .eq("product_id", productItem.product_id)
          .or("is_deleted.is.null,is_deleted.eq.false")
          .single();

        if (!product) throw new Error("Không tìm thấy thông tin sản phẩm");
        const price = product.price;
        const { data: existingItem, error: existingItemError } = await supabase
          .from("cartitems")
          .select("*")
          .eq("cart_id", cart.cart_id)
          .eq("product_item_id", product_item_id)
          .maybeSingle();
        if (existingItemError) {
          throw existingItemError;
        }
        const totalQuantity = existingItem
          ? existingItem.quantity + quantity
          : quantity;
        if (totalQuantity > productItem.quantity) {
          return res.status(400).json({
            error: `Chỉ còn ${productItem.quantity} sản phẩm trong kho`,
          });
        }
        if (existingItem) {
          const newQuantity = existingItem.quantity + quantity;
          const { data: dataUpdate, error } = await supabase
            .from("cartitems")
            .update({
              quantity: newQuantity,
              total_amount: price * newQuantity,
            })
            .eq("cart_id", cart.cart_id)
            .eq("product_item_id", product_item_id)
            .select();
          if (error) {
            throw error;
          }
          return res.json({
            success: true,
            data: dataUpdate,
            message: "Đã cập nhật giỏ hàng",
          });
        } else {
          const { data: newItem, error } = await supabase
            .from("cartitems")
            .insert({
              cart_id: cart.cart_id,
              product_item_id,
              quantity: quantity,
              total_amount: price * quantity,
            })
            .select()
            .single();
          if (error) throw error;
          return res.json({
            success: true,
            data: newItem,
            message: "Đã thêm vào giỏ hàng",
          });
        }
      } catch (err: any) {
        return res.status(400).json({ error: err.message });
      }
    }
  );
  router.put(
    "/cart/update",
    authRequired,
    async (req: Request, res: Response) => {
      const customer_id = (req as any).user?.id;
      const { product_item_id, quantity } = req.body;
      if (!customer_id) {
        return res.status(401).json({ error: "Chưa đăng nhập" });
      }
      if (!product_item_id || quantity === undefined) {
        return res.status(400).json({ error: "Thiếu thông tin" });
      }
      try {
        const { data: cart } = await supabase
          .from("cart")
          .select("cart_id")
          .eq("customer_id", customer_id)
          .single();
        if (!cart) throw new Error("Không thấy thông tin sản phẩm");
        const { data: productItem } = await supabase
          .from("product_item")
          .select("product_id, quantity")
          .eq("product_item_id", product_item_id)
          .single();
        if (!productItem) throw new Error("Không tìm thấy sản phẩm");
        if (quantity > productItem.quantity) {
          return res.status(400).json({
            error: `Chỉ còn ${productItem.quantity} sản phẩm trong kho`,
          });
        }
        const { data: product } = await supabase
          .from("product")
          .select("price")
          .eq("product_id", productItem.product_id)
          .or("is_deleted.is.null,is_deleted.eq.false")
          .single();

        if (!product) throw new Error("Không tìm thấy thông tin sản phẩm");
        const price = product.price;
        const total_amount = price * quantity;
        const { data, error } = await supabase
          .from("cartitems")
          .update({
            quantity: quantity,
            total_amount: total_amount,
          })
          .eq("cart_id", cart.cart_id)
          .eq("product_item_id", product_item_id)
          .select();
        if (error) {
          throw error;
        }
        return res.json({
          success: true,
          data: data[0],
        });
      } catch (error: any) {
        return res.status(400).json({
          error: error.message || "Lỗi cập nhật giỏ hàng",
        });
      }
    }
  );
  router.delete(
    "/cart/delete",
    authRequired,
    async (req: Request, res: Response) => {
      const customer_id = (req as any).user?.id;
      const { product_item_id } = req.body;
      if (!customer_id) {
        return res.status(401).json({ error: "Chưa đăng nhập" });
      }
      if (!product_item_id) {
        return res.status(401).json({ error: "Thiếu product_item_id" });
      }
      try {
        const { data: cart } = await supabase
          .from("cart")
          .select("cart_id")
          .eq("customer_id", customer_id)
          .single();
        if (!cart) {
          return res.status(404).json({ error: "Không lấy được cart" });
        }
        const { error } = await supabase
          .from("cartitems")
          .delete()
          .eq("cart_id", cart.cart_id)
          .eq("product_item_id", product_item_id);
        if (error) {
          throw error;
        }
        return res.json({ success: true });
      } catch (error) {
        return res
          .status(404)
          .json({ error: "Lỗi khi tiến hành xóa sản phẩm" });
      }
    }
  );
}

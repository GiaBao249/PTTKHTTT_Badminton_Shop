import { Request, Response, Router } from "express";
import { supabase } from "../../config/supabase";

export function registerGetTopSellingProducts(router: Router) {
  router.get("/getTopSellingProducts", async (req: Request, res: Response) => {
    try {
      const limit = parseInt(req.query.limit as string) || 5;

      const { data: orderDetails, error: orderDetailsError } = await supabase
        .from("orderdetail")
        .select("product_item_id, quantity");

      if (orderDetailsError) {
        console.error("Lỗi khi lấy chi tiết đơn hàng:", orderDetailsError);
        throw orderDetailsError;
      }

      if (!orderDetails || orderDetails.length === 0) {
        return res.json([]);
      }

      const productItemIds = [
        ...new Set(orderDetails.map((od: any) => od.product_item_id)),
      ].filter(Boolean);

      const { data: productItems, error: productItemsError } = await supabase
        .from("product_item")
        .select("product_item_id, product_id")
        .in("product_item_id", productItemIds);

      if (productItemsError) {
        console.error("Lỗi khi lấy sản phẩm:", productItemsError);
        throw productItemsError;
      }

      const productItemIdToProductId = new Map<number, number>();
      (productItems || []).forEach((pi: any) => {
        productItemIdToProductId.set(pi.product_item_id, pi.product_id);
      });

      const productIdToSoldQuantity = new Map<number, number>();
      orderDetails.forEach((od: any) => {
        const productId = productItemIdToProductId.get(od.product_item_id);
        if (productId) {
          const current = productIdToSoldQuantity.get(productId) || 0;
          productIdToSoldQuantity.set(productId, current + (od.quantity || 0));
        }
      });

      const sortedProductIds = Array.from(productIdToSoldQuantity.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, limit)
        .map(([productId]) => productId);

      if (sortedProductIds.length === 0) {
        return res.json([]);
      }
      const { data: products, error: productsError } = await supabase
        .from("product")
        .select("product_id, product_name, price")
        .in("product_id", sortedProductIds)
        .or("is_deleted.is.null,is_deleted.eq.false");

      if (productsError) {
        console.error("Lỗi khi lấy sản phẩm:", productsError);
        throw productsError;
      }

      const { data: productImages, error: productImagesError } = await supabase
        .from("product_item")
        .select(
          `
            product_id,
            product_image (
              image_filename
            )
          `
        )
        .in("product_id", sortedProductIds);

      if (productImagesError) {
        console.error("Lỗi khi lấy ảnh sản phẩm:", productImagesError);
        throw productImagesError;
      }

      const thumbnailMap = new Map<number, string>();
      (productImages ?? []).forEach((item) => {
        const firstImage = item.product_image?.[0]?.image_filename;
        if (item.product_id && firstImage && !thumbnailMap.has(item.product_id)) {
          thumbnailMap.set(item.product_id, firstImage);
        }
      });

      const topProducts = sortedProductIds
        .map((productId) => {
          const product = products?.find(
            (p: any) => p.product_id === productId
          );
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
        .filter((p) => p !== null);

      res.json(topProducts);
    } catch (error: any) {
      console.error("Lỗi khi lấy sản phẩm bán chạy:", error);
      res
        .status(500)
        .json({ error: error.message || "Lỗi khi lấy sản phẩm bán chạy" });
    }
  });
}

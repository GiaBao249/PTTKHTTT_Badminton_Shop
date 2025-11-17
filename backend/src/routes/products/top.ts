import { Request, Response, Router } from "express";
import { supabase } from "../../config/supabase";

export function registerTopByCategoryRoutes(router: Router) {
  router.get("/top-by-categories", async (req: Request, res: Response) => {
    try {
      const categoryIds = [1, 2, 5];

      const { data: products, error: prodError } = await supabase
        .from("product")
        .select(
          `
          product_id,
          supplier_id,
          category_id,
          product_name,
          price,
          description,
          warranty_period,
          category:category_id (
            category_id,
            category_name
          )
        `
        )
        .in("category_id", categoryIds);
      if (prodError) throw prodError;

      const productList = products ?? [];
      if (productList.length === 0)
        return res.json(
          categoryIds.map((id) => ({
            category_id: id,
            category_name: "",
            products: [],
          }))
        );

      const productIds = productList.map((p: any) => p.product_id);

      const { data: items, error: itemsError } = await supabase
        .from("product_item")
        .select("product_item_id, product_id, quantity")
        .in("product_id", productIds);
      if (itemsError) throw itemsError;

      const productItemList = items ?? [];

      if (productItemList.length === 0) {
        const result = categoryIds.map((catId) => {
          const categoryProducts = productList.filter(
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

          const topProducts = categoryProducts
            .map((p: any) => ({
              ...p,
              sold_quantity: 0,
            }))
            .slice(0, 4);

          return {
            category_id: catId,
            category_name: categoryName,
            products: topProducts,
          };
        });
        return res.json(result);
      }

      const productItemIds = productItemList.map(
        (it: any) => it.product_item_id
      );

      const productIdToInventory = new Map<number, number>();
      productItemList.forEach((it: any) => {
        const prev = productIdToInventory.get(it.product_id) ?? 0;
        productIdToInventory.set(it.product_id, prev + (it.quantity ?? 0));
      });

      const productItemIdToProductId = new Map<number, number>();
      productItemList.forEach((it: any) => {
        productItemIdToProductId.set(it.product_item_id, it.product_id);
      });

      const { data: orderDetails, error: odError } = await supabase
        .from("orderdetail")
        .select("product_item_id, quantity")
        .in("product_item_id", productItemIds);
      if (odError) throw odError;

      const productIdToSold = new Map<number, number>();
      (orderDetails ?? []).forEach((od: any) => {
        const pid = productItemIdToProductId.get(od.product_item_id);
        if (!pid) return;
        const prev = productIdToSold.get(pid) ?? 0;
        productIdToSold.set(pid, prev + (od.quantity ?? 0));
      });

      const result = categoryIds.map((catId) => {
        const categoryProducts = productList.filter(
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
            total_quantity: productIdToInventory.get(p.product_id) ?? 0,
          }))
          .sort((a, b) => b.sold_quantity - a.sold_quantity)
          .slice(0, 4);

        return {
          category_id: catId,
          category_name: categoryName,
          products: topProducts,
        };
      });

      return res.json(result);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  });
}

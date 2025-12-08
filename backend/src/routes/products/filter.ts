import { Request, Response, Router } from "express";
import { supabase } from "../../config/supabase";

export function registerFilterRoutes(router: Router) {
  router.post("/filter", async (req: Request, res: Response) => {
    try {
      const { optionIds, categoryId } = req.body as {
        optionIds?: number[];
        categoryId?: number | string;
      };

      const selectedOptionIds: number[] = Array.isArray(optionIds)
        ? optionIds.filter((x) => typeof x === "number")
        : [];

      let baseQuery = supabase
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
        .or("is_deleted.is.null,is_deleted.eq.false")
        .order("product_id", { ascending: false });

      if (categoryId) {
        baseQuery = baseQuery.eq("category_id", categoryId);
      }

      const { data: products, error: baseError } = await baseQuery;
      if (baseError) throw baseError;

      const baseProducts = products ?? [];
      if (baseProducts.length === 0) return res.json([]);

      const productIds = baseProducts.map((p: any) => p.product_id);

      if (selectedOptionIds.length === 0) {
        const { data: items, error: itemsError } = await supabase
          .from("product_item")
          .select("product_id, quantity")
          .in("product_id", productIds);
        if (itemsError) throw itemsError;

        const idToTotalQty = new Map<number, number>();
        (items ?? []).forEach((it: any) => {
          const prev = idToTotalQty.get(it.product_id) ?? 0;
          idToTotalQty.set(it.product_id, prev + (it.quantity ?? 0));
        });

        const withInventory = baseProducts.map((p: any) => ({
          ...p,
          total_quantity: idToTotalQty.get(p.product_id) ?? 0,
        }));
        return res.json(withInventory);
      }

      const { data: itemsWithCfg, error: cfgError } = await supabase
        .from("product_item")
        .select(
          `
        product_item_id,
        product_id,
        quantity,
        product_configuration (
          variation_option_id
        )
      `
        )
        .in("product_id", productIds);
      if (cfgError) throw cfgError;

      const productIdMatches = new Set<number>();
      (itemsWithCfg ?? []).forEach((it: any) => {
        const itemOptionIds = new Set<number>(
          (it.product_configuration ?? []).map(
            (c: any) => c.variation_option_id
          )
        );
        const hasSome = selectedOptionIds.some((id) => itemOptionIds.has(id));
        if (hasSome) productIdMatches.add(it.product_id);
      });

      const filteredProducts = baseProducts.filter((p: any) =>
        productIdMatches.has(p.product_id)
      );

      if (filteredProducts.length === 0) return res.json([]);

      const { data: qtyItems, error: qtyError } = await supabase
        .from("product_item")
        .select("product_id, quantity")
        .in(
          "product_id",
          filteredProducts.map((p: any) => p.product_id)
        );
      if (qtyError) throw qtyError;

      const idToTotalQty = new Map<number, number>();
      (qtyItems ?? []).forEach((it: any) => {
        const prev = idToTotalQty.get(it.product_id) ?? 0;
        idToTotalQty.set(it.product_id, prev + (it.quantity ?? 0));
      });

      const withInventory = filteredProducts.map((p: any) => ({
        ...p,
        total_quantity: idToTotalQty.get(p.product_id) ?? 0,
      }));

      res.json(withInventory);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
}

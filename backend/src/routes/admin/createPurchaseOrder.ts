import { Request, Response, Router } from "express";
import { supabase } from "../../config/supabase";

export function registerCreatePurchaseOrder(router: Router) {
  router.post("/createPurchaseOrder", async (req: Request, res: Response) => {
    try {
      const { supplier_id, employee_id, items } = req.body;

      if (!supplier_id || !employee_id || !items || items.length === 0) {
        return res.status(400).json({ error: "Thiếu thông tin phiếu nhập" });
      }

      const { data: maxData, error: maxError } = await supabase
        .from("purchaseorders")
        .select("purchaseorder_id")
        .order("purchaseorder_id", { ascending: false })
        .limit(1)
        .single();

      let nextPurchaseOrderId = 1;
      if (!maxError && maxData && maxData.purchaseorder_id) {
        nextPurchaseOrderId = maxData.purchaseorder_id + 1;
      }

      const { data: purchaseOrder, error: poError } = await supabase
        .from("purchaseorders")
        .insert([
          {
            purchaseorder_id: nextPurchaseOrderId,
            supplier_id,
            employee_id,
            purchaseorder_date: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (poError) throw poError;

      const purchaseOrderDetails: any[] = [];

      for (const item of items) {
        const {
          product_id,
          product_name,
          category_id,
          price,
          quantity,
          description,
          warranty_period,
        } = item;

        let finalProductId = product_id;

        if (product_id) {
          const { data: existingProduct, error: productError } = await supabase
            .from("product")
            .select("*")
            .eq("product_id", product_id)
            .single();

          if (productError || !existingProduct) {
            return res.status(400).json({
              error: `Không tìm thấy sản phẩm với ID: ${product_id}`,
            });
          }

          const updateData: any = {};
          if (price && price > 0) {
            updateData.price_purchase = price;
          }
          if (supplier_id) {
            updateData.supplier_id = supplier_id;
          }

          if (Object.keys(updateData).length > 0) {
            const { error: updateError } = await supabase
              .from("product")
              .update(updateData)
              .eq("product_id", product_id);
            if (updateError) throw updateError;
          }

          finalProductId = product_id;
        } else {
          if (!product_name || !category_id) {
            return res.status(400).json({
              error: "Thiếu thông tin sản phẩm (tên và danh mục)",
            });
          }

          const { data: newProduct, error: productError } = await supabase
            .from("product")
            .insert([
              {
                product_name,
                category_id,
                description: description || "",
                warranty_period: warranty_period || 0,
                price: 0,
                price_purchase: price || 0,
                supplier_id: supplier_id || null,
              },
            ])
            .select()
            .single();

          if (productError) throw productError;
          finalProductId = newProduct.product_id;
        }

        purchaseOrderDetails.push({
          purchaseorder_id: purchaseOrder.purchaseorder_id,
          product_id: finalProductId,
          price: price,
          quantity: quantity,
        });

        if (!quantity || quantity <= 0) {
          return res.status(400).json({
            error: `Số lượng phải lớn hơn 0 cho sản phẩm ID: ${finalProductId}`,
          });
        }

        const { data: existingItems, error: findItemsError } = await supabase
          .from("product_item")
          .select("product_item_id, quantity")
          .eq("product_id", finalProductId)
          .limit(1);

        if (findItemsError) {
          console.warn("Không tìm thấy sản phẩm trong kho", findItemsError);
        }

        if (existingItems && existingItems.length > 0 && existingItems[0]) {
          const existingItem = existingItems[0];
          const newQuantity = (existingItem.quantity || 0) + quantity;
          const { error: updateItemError } = await supabase
            .from("product_item")
            .update({ quantity: newQuantity })
            .eq("product_item_id", existingItem.product_item_id);
          if (updateItemError) throw updateItemError;
        } else {
          const { error: itemError } = await supabase
            .from("product_item")
            .insert([
              {
                product_id: finalProductId,
                quantity: quantity,
              },
            ]);
          if (itemError) throw itemError;
        }
      }

      if (purchaseOrderDetails.length > 0) {
        const { data: maxDetailData, error: maxDetailError } = await supabase
          .from("purchaseorderdetail")
          .select("purchaseorderdetail_id")
          .order("purchaseorderdetail_id", { ascending: false })
          .limit(1)
          .single();

        let nextDetailId = 1;
        if (
          !maxDetailError &&
          maxDetailData &&
          maxDetailData.purchaseorderdetail_id
        ) {
          nextDetailId = maxDetailData.purchaseorderdetail_id + 1;
        }

        const detailsWithId = purchaseOrderDetails.map((detail, index) => ({
          purchaseorderdetail_id: nextDetailId + index,
          purchaseorder_id: detail.purchaseorder_id,
          product_id: detail.product_id,
          price: detail.price,
          quantity: detail.quantity,
        }));

        const { data: insertedDetails, error: detailError } = await supabase
          .from("purchaseorderdetail")
          .insert(detailsWithId)
          .select();

        if (detailError) {
          const { data: retryDetails, error: retryError } = await supabase
            .from("purchaseorderdetail")
            .insert(purchaseOrderDetails)
            .select();
        }
      }

      res.status(201).json({
        success: true,
        purchaseOrder,
        message: "Tạo phiếu nhập thành công",
      });
    } catch (error: any) {
      return res.status(500).json({
        error: error.message || "Không thể tạo phiếu nhập",
      });
    }
  });
}

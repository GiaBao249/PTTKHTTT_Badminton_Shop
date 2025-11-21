import { Request, Response, Router } from "express";
import { supabase } from "../../config/supabase";

export function registerGetPurchaseOrderDetail(router: Router) {
  router.get(
    "/getPurchaseOrderDetail/:id",
    async (req: Request, res: Response) => {
      try {
        const purchaseOrderId = parseInt(req.params.id!);
        if (isNaN(purchaseOrderId)) {
          return res.status(400).json({ error: "Invalid purchase order ID" });
        }

        const { data: purchaseOrder, error: poError } = await supabase
          .from("purchaseorders")
          .select(
            "purchaseorder_id, supplier_id, employee_id, purchaseorder_date"
          )
          .eq("purchaseorder_id", purchaseOrderId)
          .single();

        if (poError) {
          console.error("Lỗi khi lấy phiếu nhập:", poError);
          throw poError;
        }
        if (!purchaseOrder) {
          return res.status(404).json({ error: "Purchase order not found" });
        }

        let supplier = null;
        let employee = null;

        if (purchaseOrder.supplier_id) {
          const { data: supplierData, error: supplierError } = await supabase
            .from("suppliers")
            .select("supplier_id, supplier_name")
            .eq("supplier_id", purchaseOrder.supplier_id)
            .single();

          if (!supplierError && supplierData) {
            supplier = supplierData;
          } else {
            console.warn("Lỗi khi lấy nhà cung cấp:", supplierError);
          }
        }

        if (purchaseOrder.employee_id) {
          const { data: employeeData, error: employeeError } = await supabase
            .from("employees")
            .select("employee_id, name")
            .eq("employee_id", purchaseOrder.employee_id)
            .single();

          if (!employeeError && employeeData) {
            employee = employeeData;
          } else {
            console.warn("Lỗi khi lấy nhân viên:", employeeError);
          }
        }

        const { data: orderDetails, error: detailsError } = await supabase
          .from("purchaseorderdetail")
          .select("purchaseorderdetail_id, product_id, price, quantity")
          .eq("purchaseorder_id", purchaseOrderId);

        let itemsWithProducts: any[] = [];

        if (!detailsError && orderDetails && orderDetails.length > 0) {
          const productIds = orderDetails
            .map((od: any) => od.product_id)
            .filter(Boolean);

          if (productIds.length > 0) {
            const { data: productsData, error: productsError } = await supabase
              .from("product")
              .select(
                "product_id, product_name, category_id, description, warranty_period"
              )
              .in("product_id", productIds);

            // Get product images for thumbnails
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

            if (!productsError && productsData) {
              itemsWithProducts = orderDetails.map((od: any) => {
                const product = productsData.find(
                  (p: any) => p.product_id === od.product_id
                );
                return {
                  ...od,
                  product: product
                    ? {
                        ...product,
                        thumbnail: thumbnailMap.get(product.product_id) ?? null,
                      }
                    : null,
                };
              });
            } else {
              itemsWithProducts = orderDetails;
            }
          }
        } else if (detailsError) {
          console.warn("Lỗi khi lấy chi tiết phiếu nhập:", detailsError);
        }

        res.json({
          ...purchaseOrder,
          supplier: supplier,
          employee: employee,
          items: itemsWithProducts,
        });
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    }
  );
}

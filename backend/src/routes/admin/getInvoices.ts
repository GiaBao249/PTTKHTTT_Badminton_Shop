import { Request, Response, Router } from "express";
import { supabase } from "../../config/supabase";
import { authRequired } from "../../middleware/authRequired";

export function registerGetInvoices(router: Router) {
  router.get(
    "/getInvoices",
    authRequired,
    async (req: Request, res: Response) => {
      try {
        const { startDate, endDate, status } = req.query;

        let query = supabase
          .from("orders")
          .select(
            "order_id, customer_id, status, total_amount, order_date, delivery_date, address_id"
          )
          .order("order_date", { ascending: false });

        if (startDate && typeof startDate === "string") {
          query = query.gte("order_date", startDate);
        }
        if (endDate && typeof endDate === "string") {
          const endDateTime = new Date(endDate);
          endDateTime.setHours(23, 59, 59, 999);
          query = query.lte("order_date", endDateTime.toISOString());
        }

        if (status && typeof status === "string" && status !== "all") {
          const normalizedStatus =
            status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
          query = query.eq("status", normalizedStatus);
        }

        const { data: orders, error } = await query;

        if (error) {
          return res.status(500).json({
            error: error.message || "Lỗi khi lấy đơn hàng",
          });
        }

        if (!orders || orders.length === 0) {
          return res.json([]);
        }

        const customerIds = [
          ...new Set(orders.map((o: any) => o.customer_id).filter(Boolean)),
        ];
        const customerMap = new Map();

        if (customerIds.length > 0) {
          try {
            const { data: customers, error: customersError } = await supabase
              .from("customer")
              .select(
                "customer_id, customer_name, customer_phone, customer_email"
              )
              .in("customer_id", customerIds);

            if (!customersError && customers) {
              customers.forEach((c: any) => {
                customerMap.set(c.customer_id, c);
              });
            }
          } catch (err: any) {
            console.warn("Error fetching customers (non-fatal):", err);
          }
        }
        const orderIds = orders.map((o: any) => o.order_id).filter(Boolean);
        const { data: orderDetails, error: detailsError } = await supabase
          .from("orderdetail")
          .select("order_id, product_item_id, quantity, amount")
          .in("order_id", orderIds);

        if (detailsError) {
          console.error("Lỗi khi lấy chi tiết đơn hàng:", detailsError);
        }

        const productItemIds = orderDetails
          ? [
              ...new Set(
                orderDetails
                  .map((od: any) => od?.product_item_id)
                  .filter(Boolean)
              ),
            ]
          : [];

        const productItemMap = new Map();
        const productMap = new Map();
        const thumbnailMap = new Map();

        if (productItemIds.length > 0) {
          try {
            const { data: productItems, error: itemsError } = await supabase
              .from("product_item")
              .select("product_item_id, product_id")
              .in("product_item_id", productItemIds);

            if (!itemsError && productItems) {
              productItems.forEach((pi: any) => {
                productItemMap.set(pi.product_item_id, pi);
              });

              const productIds = [
                ...new Set(
                  productItems.map((pi: any) => pi.product_id).filter(Boolean)
                ),
              ];

              if (productIds.length > 0) {
                const { data: products, error: productsError } = await supabase
                  .from("product")
                  .select("product_id, product_name, price, category_id")
                  .in("product_id", productIds);

                if (!productsError && products) {
                  products.forEach((p: any) => {
                    productMap.set(p.product_id, p);
                  });

                  const categoryIds = [
                    ...new Set(
                      products.map((p: any) => p.category_id).filter(Boolean)
                    ),
                  ];

                  if (categoryIds.length > 0) {
                    const { data: categories, error: categoriesError } =
                      await supabase
                        .from("category")
                        .select("category_id, category_name")
                        .in("category_id", categoryIds);

                    const categoryMap = new Map();
                    if (!categoriesError && categories) {
                      categories.forEach((c: any) => {
                        categoryMap.set(c.category_id, c);
                      });

                      // Add categories to products
                      products.forEach((p: any) => {
                        if (p.category_id && categoryMap.has(p.category_id)) {
                          p.category = categoryMap.get(p.category_id);
                        }
                        // Update productMap with the modified product
                        if (p.product_id) {
                          productMap.set(p.product_id, p);
                        }
                      });
                    } else {
                      // Update productMap even if no categories
                      products.forEach((p: any) => {
                        if (p.product_id) {
                          productMap.set(p.product_id, p);
                        }
                      });
                    }
                  }

                  try {
                    const { data: productImages, error: imagesError } =
                      await supabase
                        .from("product_item")
                        .select("product_id, product_image(image_filename)")
                        .in("product_id", productIds);

                    if (!imagesError && productImages) {
                      productImages.forEach((item: any) => {
                        const firstImage =
                          item.product_image?.[0]?.image_filename;
                        if (
                          item.product_id &&
                          firstImage &&
                          !thumbnailMap.has(item.product_id)
                        ) {
                          thumbnailMap.set(item.product_id, firstImage);
                        }
                      });

                      products.forEach((p: any) => {
                        if (p.product_id) {
                          p.thumbnail = thumbnailMap.get(p.product_id) || null;
                          // Update productMap with the modified product (with thumbnail)
                          productMap.set(p.product_id, p);
                        }
                      });
                    } else {
                      // Ensure productMap is updated even without thumbnails
                      products.forEach((p: any) => {
                        if (p.product_id) {
                          productMap.set(p.product_id, p);
                        }
                      });
                    }
                  } catch (thumbErr: any) {
                    console.warn(
                      "Error fetching thumbnails (non-fatal):",
                      thumbErr
                    );
                  }
                }
              }
            }
          } catch (err: any) {
            console.error("Error processing products (non-fatal):", err);
          }
        }

        const result = orders.map((order: any) => {
          const details = orderDetails
            ? orderDetails.filter((od: any) => od.order_id === order.order_id)
            : [];

          const detailsWithProducts = details.map((detail: any) => {
            const productItem = productItemMap.get(detail.product_item_id);
            const product = productItem
              ? productMap.get(productItem.product_id)
              : null;

            return {
              ...detail,
              product_item: productItem
                ? {
                    ...productItem,
                    product: product || null,
                  }
                : null,
            };
          });

          return {
            ...order,
            customer: customerMap.get(order.customer_id) || null,
            orderdetail: detailsWithProducts,
          };
        });

        return res.json(result);
      } catch (error: any) {
        return res.status(500).json({
          error: error?.message || "Lỗi khi lấy hóa đơn",
        });
      }
    }
  );

  router.get(
    "/getInvoice/:orderId",
    authRequired,
    async (req: Request, res: Response) => {
      try {
        const orderId = parseInt(req.params.orderId as string);
        const user = (req as any).user;

        if (isNaN(orderId)) {
          return res.status(400).json({ error: "Invalid order ID" });
        }

        const { data: order, error: orderError } = await supabase
          .from("orders")
          .select(
            "order_id, customer_id, status, total_amount, order_date, delivery_date, address_id"
          )
          .eq("order_id", orderId)
          .single();

        if (orderError || !order) {
          return res.status(404).json({ error: "Không tìm thấy hóa đơn" });
        }

        if (user && user.role === "user" && order.customer_id !== user.id) {
          return res
            .status(403)
            .json({ error: "Bạn không có quyền xem hóa đơn này" });
        }

        let customer = null;
        try {
          const { data: customerData, error: customerError } = await supabase
            .from("customer")
            .select(
              "customer_id, customer_name, customer_phone, customer_email"
            )
            .eq("customer_id", order.customer_id)
            .single();

          if (!customerError && customerData) {
            customer = customerData;
          }
        } catch (err: any) {
          console.warn("Error fetching customer (non-fatal):", err);
        }

        const { data: orderDetails, error: detailsError } = await supabase
          .from("orderdetail")
          .select("order_id, product_item_id, quantity, amount")
          .eq("order_id", orderId);

        if (detailsError) {
          return res
            .status(500)
            .json({ error: "Lỗi khi lấy chi tiết đơn hàng" });
        }

        let detailsWithProducts: any[] = [];

        if (orderDetails) {
          if (Array.isArray(orderDetails)) {
            if (orderDetails.length > 0) {
              detailsWithProducts = orderDetails.map((detail: any) => ({
                ...detail,
                product_item: null,
              }));
            }
          }
        }

        const productItemIds =
          Array.isArray(orderDetails) && orderDetails.length > 0
            ? [
                ...new Set(
                  orderDetails
                    .map((od: any) => od?.product_item_id)
                    .filter((id: any) => id != null && !isNaN(id))
                ),
              ]
            : [];

        if (productItemIds.length > 0) {
          try {
            const { data: productItems, error: itemsError } = await supabase
              .from("product_item")
              .select("product_item_id, product_id")
              .in("product_item_id", productItemIds);

            if (!itemsError && productItems) {
              const productIds = [
                ...new Set(
                  productItems.map((pi: any) => pi.product_id).filter(Boolean)
                ),
              ];

              if (productIds.length > 0) {
                const { data: products, error: productsError } = await supabase
                  .from("product")
                  .select("product_id, product_name, price, category_id")
                  .in("product_id", productIds);

                if (!productsError && products) {
                  const categoryIds = [
                    ...new Set(
                      products.map((p: any) => p.category_id).filter(Boolean)
                    ),
                  ];

                  if (categoryIds.length > 0) {
                    const { data: categories, error: categoriesError } =
                      await supabase
                        .from("category")
                        .select("category_id, category_name")
                        .in("category_id", categoryIds);

                    const categoryMap = new Map();
                    if (!categoriesError && categories) {
                      categories.forEach((c: any) => {
                        categoryMap.set(c.category_id, c);
                      });
                    }

                    products.forEach((p: any) => {
                      if (p.category_id && categoryMap.has(p.category_id)) {
                        p.category = categoryMap.get(p.category_id);
                      }
                    });
                  }

                  try {
                    const { data: productImages, error: imagesError } =
                      await supabase
                        .from("product_item")
                        .select("product_id, product_image(image_filename)")
                        .in("product_id", productIds);

                    const thumbnailMap = new Map();
                    if (!imagesError && productImages) {
                      productImages.forEach((item: any) => {
                        const firstImage =
                          item.product_image?.[0]?.image_filename;
                        if (item.product_id && firstImage) {
                          thumbnailMap.set(item.product_id, firstImage);
                        }
                      });

                      products.forEach((p: any) => {
                        p.thumbnail = thumbnailMap.get(p.product_id) || null;
                      });
                    }
                  } catch (thumbErr: any) {
                    console.warn(
                      "Error fetching thumbnails (non-fatal):",
                      thumbErr
                    );
                  }

                  const productItemMap = new Map();
                  productItems.forEach((pi: any) => {
                    productItemMap.set(pi.product_item_id, pi);
                  });

                  const productMap = new Map();
                  products.forEach((p: any) => {
                    productMap.set(p.product_id, p);
                  });

                  if (Array.isArray(orderDetails) && orderDetails.length > 0) {
                    orderDetails.forEach((detail: any, index: number) => {
                      const productItem = productItemMap.get(
                        detail.product_item_id
                      );
                      const product = productItem
                        ? productMap.get(productItem.product_id)
                        : null;

                      const detailIndex = detailsWithProducts.findIndex(
                        (d: any) =>
                          d.order_id === detail.order_id &&
                          d.product_item_id === detail.product_item_id
                      );

                      if (detailIndex >= 0) {
                        detailsWithProducts[detailIndex] = {
                          ...detail,
                          product_item: productItem
                            ? {
                                ...productItem,
                                product: product || null,
                              }
                            : null,
                        };
                      } else {
                        // If not found by composite key, use index as fallback
                        if (index < detailsWithProducts.length) {
                          detailsWithProducts[index] = {
                            ...detail,
                            product_item: productItem
                              ? {
                                  ...productItem,
                                  product: product || null,
                                }
                              : null,
                          };
                        } else {
                          console.warn(
                            `⚠️ Detail with order_id ${detail.order_id} and product_item_id ${detail.product_item_id} not found in detailsWithProducts`
                          );
                        }
                      }
                    });
                  }
                }
              }
            }
          } catch (err: any) {
            console.error("Error processing products:", err);
          }
        }

        const result = {
          ...order,
          customer: customer,
          orderdetail: detailsWithProducts,
        };

        return res.json(result);
      } catch (error: any) {
        console.error("Error getting invoice:", error);
        return res.status(500).json({
          error: error?.message || "Lỗi khi lấy hóa đơn",
        });
      }
    }
  );
}

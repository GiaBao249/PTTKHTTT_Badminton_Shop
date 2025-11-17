import { Router, Request, Response } from "express";
import { supabase } from "../../config/supabase";
import { authRequired } from "../../middleware/authRequired";

export function registerCheckoutRoutes(router: Router) {
  router.post(
    "/checkout",
    authRequired,
    async (req: Request, res: Response) => {
      const user = (req as any).user;
      const customerId = user.id;
      const { cart_items, address_id, payment_method, total_amount } = req.body;
      try {
        if (!cart_items || cart_items.length === 0) {
          return res.status(400).json({ error: "Giỏ hàng trống" });
        }
        const productItemIds = cart_items.map(
          (item: any) => item.product_item_id
        );
        const { data: productItems, error } = await supabase
          .from("product_item")
          .select("*")
          .in("product_item_id", productItemIds);
        if (error || !productItems) {
          throw error;
        }
        for (const item of cart_items) {
          const productItem = productItems?.find(
            (p: any) => item.product_item_id === p.product_item_id
          );
          if (!productItem || productItem.quantity < item.quantity) {
            return res.status(400).json({
              error: `Sản phẩm #${item.product_item_id} không đủ số lượng`,
            });
          }
        }
        let finalAddressId = address_id;
        if (!finalAddressId && !req.body.shipping_info) {
          return res.status(400).json({ error: "Thiếu thông tin địa chỉ" });
        }

        if (!finalAddressId && req.body.shipping_info) {
          const { address, district, city } = req.body.shipping_info;
          if (!address || !district || !city) {
            return res
              .status(400)
              .json({ error: "Thiếu thông tin địa chỉ giao hàng" });
          }
        }
        if (!finalAddressId && req.body.shipping_info) {
          const { data: newAddress, error: newAddressError } = await supabase
            .from("address")
            .insert({
              customer_id: customerId,
              address_line: req.body.shipping_info.address,
              ward: req.body.shipping_info.ward || "",
              district: req.body.shipping_info.district,
              city: req.body.shipping_info.city,
              postal_code: req.body.shipping_info.postalCode || "",
            })
            .select("address_id")
            .single();
          if (newAddressError) throw newAddressError;
          finalAddressId = newAddress?.address_id;
        }
        const orderStatus = "Pending";
        console.log("Attempting to create order with status:", orderStatus);
        console.log("Order data:", {
          customer_id: customerId,
          address_id: finalAddressId,
          status: orderStatus,
          total_amount: total_amount,
        });
        const { data: order, error: orderError } = await supabase
          .from("orders")
          .insert({
            customer_id: customerId,
            address_id: finalAddressId,
            status: orderStatus,
            total_amount: total_amount,
            order_date: new Date().toISOString(),
            delivery_date: null,
          })
          .select("order_id")
          .single();
        if (orderError) {
          if (orderError) {
            console.error("Order error details:", {
              message: orderError.message,
              code: orderError.code,
              details: orderError.details,
              hint: orderError.hint,
            });
            throw orderError;
          }
        }
        const orderDetails = cart_items.map((item: any) => ({
          order_id: order.order_id,
          product_item_id: item.product_item_id,
          quantity: item.quantity,
          amount: item.total_amount || item.quantity * item.price,
        }));
        const { error: detailError } = await supabase
          .from("orderdetail")
          .insert(orderDetails);
        if (detailError) throw detailError;
        for (const item of cart_items) {
          const productItem = productItems?.find(
            (p: any) => p.product_item_id === item.product_item_id
          );
          if (productItem) {
            const { error: updateError } = await supabase
              .from("product_item")
              .update({ quantity: productItem.quantity - item.quantity })
              .eq("product_item_id", item.product_item_id);
            if (updateError) {
              throw updateError;
            }
          }
        }
        const { data: cart, error: cartError } = await supabase
          .from("cart")
          .select("cart_id")
          .eq("customer_id", customerId)
          .single();

        if (cart && !cartError && cart.cart_id) {
          const checkedOutProductIds = cart_items.map(
            (item: any) => item.product_item_id
          );

          const { error: deleteCartError } = await supabase
            .from("cartitems")
            .delete()
            .eq("cart_id", cart.cart_id)
            .in("product_item_id", checkedOutProductIds);

          if (deleteCartError) {
            console.error(
              "Error deleting checked out cart items:",
              deleteCartError
            );
          }
        }
        return res.json({
          success: true,
          order_id: order.order_id,
          message: "Đặt hàng thành công",
        });
      } catch (error: any) {
        console.error("Checkout error:", error);
        return res.status(500).json({
          error: error.message || "Lỗi khi đặt hàng",
        });
      }
    }
  );
}

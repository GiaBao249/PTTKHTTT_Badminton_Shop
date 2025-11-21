import { Router, Request, Response } from "express";
import { supabase } from "../../config/supabase";

export function registerUpdateOrderStatus(router: Router) {
  router.patch("/updateOrderStatus", async (req: Request, res: Response) => {
    const { order_id, status } = req.body;

    if (!order_id) {
      return res.status(400).json({ error: "Thiếu order_id" });
    }
    if (!status) {
      return res.status(400).json({ error: "Thiếu status" });
    }
    try {
      const { data: currentOrder, error: getOrderError } = await supabase
        .from("orders")
        .select("status")
        .eq("order_id", order_id)
        .single();

      if (getOrderError) {
        console.error("Error getting current order:", getOrderError);
        return res
          .status(500)
          .json({ error: "Lỗi khi lấy thông tin đơn hàng" });
      }

      if (!currentOrder) {
        return res.status(404).json({ error: "Không tìm thấy đơn hàng" });
      }

      const oldStatus = currentOrder.status;
      const isCancelling = status === "Cancelled" && oldStatus !== "Cancelled";

      // Nếu đơn hàng đang được hủy (chuyển sang Cancelled), trả lại số lượng sản phẩm
      if (isCancelling) {
        const { data: orderDetails, error: detailError } = await supabase
          .from("orderdetail")
          .select("product_item_id, quantity")
          .eq("order_id", order_id);

        if (detailError) {
          console.error("Error getting order details:", detailError);
          return res
            .status(500)
            .json({ error: "Lỗi khi lấy chi tiết đơn hàng" });
        }

        if (orderDetails && orderDetails.length > 0) {
          // Với mỗi sản phẩm trong đơn hàng, cộng lại số lượng vào kho
          for (const detail of orderDetails) {
            // Lấy số lượng hiện tại của product_item
            const { data: productItem, error: getItemError } = await supabase
              .from("product_item")
              .select("quantity")
              .eq("product_item_id", detail.product_item_id)
              .single();

            if (getItemError) {
              console.error(
                `Error getting product_item ${detail.product_item_id}:`,
                getItemError
              );
              continue;
            }

            if (productItem) {
              const newQuantity = productItem.quantity + detail.quantity;
              const { error: updateError } = await supabase
                .from("product_item")
                .update({ quantity: newQuantity })
                .eq("product_item_id", detail.product_item_id);

              if (updateError) {
                console.error(
                  `Error updating product_item ${detail.product_item_id}:`,
                  updateError
                );
              } else {
                console.log(
                  `Trả lại ${detail.quantity} sản phẩm cho product_item ${detail.product_item_id}`
                );
              }
            }
          }
        }
      }

      const { data: updatedOrder, error } = await supabase
        .from("orders")
        .update({
          status: status,
        })
        .eq("order_id", order_id)
        .select();

      if (error) {
        console.error("Supabase error:", error);
        return res
          .status(500)
          .json({ error: "Lỗi khi cập nhật trạng thái đơn hàng" });
      }

      if (!updatedOrder || updatedOrder.length === 0) {
        return res.status(404).json({ error: "Không tìm thấy đơn hàng" });
      }

      return res.json({
        success: true,
        message: isCancelling
          ? "Hủy đơn hàng thành công và đã trả lại số lượng sản phẩm vào kho"
          : "Cập nhật trạng thái thành công",
        order: updatedOrder[0],
      });
    } catch (error) {
      console.error("Server error:", error);
      return res.status(500).json({ error: "Lỗi máy chủ" });
    }
  });
}

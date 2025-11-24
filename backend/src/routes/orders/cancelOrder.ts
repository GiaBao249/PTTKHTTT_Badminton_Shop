import { Router, Request, Response } from "express";
import { supabase } from "../../config/supabase";
import { authRequired } from "../../middleware/authRequired";

export function registerCancelOrderRoutes(router: Router) {
  router.patch(
    "/cancel/:orderId",
    authRequired,
    async (req: Request, res: Response) => {
      const orderId = parseInt(req.params.orderId as string);
      const user = (req as any).user;

      if (!orderId || isNaN(orderId)) {
        return res.status(400).json({ error: "Invalid order ID" });
      }

      if (!user || user.role !== "user") {
        return res
          .status(403)
          .json({ error: "Chỉ khách hàng mới có thể hủy đơn hàng" });
      }

      try {
        const { data: order, error: orderError } = await supabase
          .from("orders")
          .select("order_id, customer_id, status")
          .eq("order_id", orderId)
          .single();

        if (orderError || !order) {
          return res.status(404).json({ error: "Không tìm thấy đơn hàng" });
        }

        if (order.customer_id !== user.id) {
          return res
            .status(403)
            .json({ error: "Bạn không có quyền hủy đơn hàng này" });
        }

        // Cho phép hủy đơn hàng khi status là "Pending" (chưa thanh toán) hoặc "Processing" (đã thanh toán nhưng chưa ship)
        if (order.status !== "Pending" && order.status !== "Processing") {
          return res.status(400).json({
            error: `Không thể hủy đơn hàng với trạng thái hiện tại: ${order.status}. Chỉ có thể hủy đơn hàng đang "Chờ xử lý"`,
          });
        }

        const { data: orderDetails, error: detailError } = await supabase
          .from("orderdetail")
          .select("product_item_id, quantity")
          .eq("order_id", orderId);

        if (detailError) {
          console.error("Error getting order details:", detailError);
          return res
            .status(500)
            .json({ error: "Lỗi khi lấy chi tiết đơn hàng" });
        }

        if (orderDetails && orderDetails.length > 0) {
          for (const detail of orderDetails) {
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

        const { data: updatedOrder, error: updateOrderError } = await supabase
          .from("orders")
          .update({ status: "Cancelled" })
          .eq("order_id", orderId)
          .select()
          .single();

        if (updateOrderError) {
          console.error(
            "Lỗi khi cập nhật trạng thái đơn hàng:",
            updateOrderError
          );
          return res
            .status(500)
            .json({ error: "Lỗi khi cập nhật trạng thái đơn hàng" });
        }

        if (!updatedOrder) {
          return res
            .status(404)
            .json({ error: "Không tìm thấy đơn hàng sau khi cập nhật" });
        }

        console.log("đơn hàng bị hủy bởi khách hàng:", updatedOrder);
        return res.json({
          success: true,
          message:
            "Hủy đơn hàng thành công và đã trả lại số lượng sản phẩm vào kho",
          order: updatedOrder,
        });
      } catch (error: any) {
        console.error("Server error:", error);
        return res.status(500).json({ error: "Lỗi máy chủ" });
      }
    }
  );
}

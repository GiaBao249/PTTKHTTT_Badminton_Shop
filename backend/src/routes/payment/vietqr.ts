import { Router, Request, Response } from "express";
import { supabase } from "../../config/supabase";
import {
  createVietQRCode,
  createVietQRData,
  getBankName,
  vietqrConfig,
} from "../../utils/vietqr";
import { authRequired } from "../../middleware/authRequired";

export function registerVietQRRoutes(router: Router) {
  /**
   * Tạo QR code thanh toán VietQR
   * POST /api/payment/vietqr/create-qr
   */
  router.post(
    "/create-qr",
    authRequired,
    async (req: Request, res: Response) => {
      try {
        const { order_id, amount, order_info } = req.body;

        if (!order_id || !amount) {
          return res.status(400).json({
            error: "Thiếu thông tin order_id hoặc amount",
          });
        }

        // Kiểm tra đơn hàng
        const { data: order, error: orderError } = await supabase
          .from("orders")
          .select("*")
          .eq("order_id", order_id)
          .single();

        if (orderError || !order) {
          return res.status(404).json({
            error: "Không tìm thấy đơn hàng",
          });
        }

        // Tạo QR code URL
        let qrUrl: string;
        try {
          qrUrl = createVietQRCode(
            amount,
            order_info || `Thanh toan don hang ${order_id}`
          );
        } catch (error: any) {
          console.error("Error creating VietQR URL:", error);
          return res.status(500).json({
            error: error.message || "Lỗi khi tạo QR code VietQR",
          });
        }

        // Tạo QR data để client render
        const qrData = createVietQRData(
          amount,
          order_info || `Thanh toan don hang ${order_id}`
        );

        const response = {
          success: true,
          qr_url: qrUrl,
          qr_data: qrData,
          order_id: order_id,
          amount: amount,
          bank_name: getBankName(vietqrConfig.bankCode),
          account_number: vietqrConfig.accountNumber,
          account_name: vietqrConfig.accountName,
          message: `Vui lòng quét mã QR và chuyển khoản ${amount.toLocaleString(
            "vi-VN"
          )} VND`,
        };

        console.log("VietQR Response:", {
          qr_url: qrUrl.substring(0, 100) + "...",
          bank_name: response.bank_name,
          account_number: response.account_number
            ? "***" + response.account_number.slice(-4)
            : "MISSING",
        });

        return res.json(response);
      } catch (error: any) {
        console.error("Error creating VietQR code:", error);
        return res.status(500).json({
          error: error.message || "Lỗi khi tạo QR code VietQR",
        });
      }
    }
  );

  /**
   * Kiểm tra trạng thái thanh toán (manual check)
   * POST /api/payment/vietqr/check-payment
   */
  router.post(
    "/check-payment",
    authRequired,
    async (req: Request, res: Response) => {
      try {
        const { order_id } = req.body;

        if (!order_id) {
          return res.status(400).json({
            error: "Thiếu thông tin order_id",
          });
        }

        // Kiểm tra đơn hàng
        const { data: order, error: orderError } = await supabase
          .from("orders")
          .select("*")
          .eq("order_id", order_id)
          .single();

        if (orderError || !order) {
          return res.status(404).json({
            error: "Không tìm thấy đơn hàng",
          });
        }

        // Trả về trạng thái đơn hàng
        // Note: VietQR không có webhook tự động, cần admin xác nhận thủ công
        // Hoặc tích hợp với ngân hàng để kiểm tra tự động
        return res.json({
          order_id: order.order_id,
          status: order.status,
          total_amount: order.total_amount,
          payment_method: order.payment_method,
          message:
            "Vui lòng kiểm tra trạng thái thanh toán trong tài khoản ngân hàng",
        });
      } catch (error: any) {
        console.error("Error checking VietQR payment:", error);
        return res.status(500).json({
          error: error.message || "Lỗi khi kiểm tra thanh toán",
        });
      }
    }
  );

  /**
   * Xác nhận thanh toán (admin hoặc tự động)
   * POST /api/payment/vietqr/confirm-payment
   */
  router.post(
    "/confirm-payment",
    authRequired,
    async (req: Request, res: Response) => {
      try {
        const { order_id, transaction_no } = req.body;

        if (!order_id) {
          return res.status(400).json({
            error: "Thiếu thông tin order_id",
          });
        }

        // Kiểm tra đơn hàng
        const { data: order, error: orderError } = await supabase
          .from("orders")
          .select("*")
          .eq("order_id", order_id)
          .single();

        if (orderError || !order) {
          return res.status(404).json({
            error: "Không tìm thấy đơn hàng",
          });
        }

        if (order.status !== "Pending") {
          return res.status(400).json({
            error: `Đơn hàng đã được xử lý (status: ${order.status})`,
          });
        }

        // Cập nhật trạng thái đơn hàng
        const { error: updateError } = await supabase
          .from("orders")
          .update({ status: "Processing" })
          .eq("order_id", order_id);

        if (updateError) {
          throw updateError;
        }

        // Trừ inventory và xóa cart (giống VNPay)
        const { data: orderDetails, error: detailsError } = await supabase
          .from("orderdetail")
          .select("product_item_id, quantity")
          .eq("order_id", order_id);

        if (!detailsError && orderDetails) {
          for (const detail of orderDetails) {
            const { data: productItem, error: itemError } = await supabase
              .from("product_item")
              .select("quantity")
              .eq("product_item_id", detail.product_item_id)
              .single();

            if (!itemError && productItem) {
              await supabase
                .from("product_item")
                .update({ quantity: productItem.quantity - detail.quantity })
                .eq("product_item_id", detail.product_item_id);
            }
          }

          // Xóa cart items
          const { data: cart } = await supabase
            .from("cart")
            .select("cart_id")
            .eq("customer_id", order.customer_id)
            .single();

          if (cart && cart.cart_id) {
            const checkedOutProductIds = orderDetails.map(
              (item: any) => item.product_item_id
            );
            await supabase
              .from("cartitems")
              .delete()
              .eq("cart_id", cart.cart_id)
              .in("product_item_id", checkedOutProductIds);
          }
        }

        return res.json({
          success: true,
          order_id: order_id,
          status: "Processing",
          message: "Xác nhận thanh toán thành công",
        });
      } catch (error: any) {
        console.error("Error confirming VietQR payment:", error);
        return res.status(500).json({
          error: error.message || "Lỗi khi xác nhận thanh toán",
        });
      }
    }
  );

  /**
   * Test Mode: Simulate payment (không cần chuyển tiền thật)
   * POST /api/payment/vietqr/test-payment
   * Có thể dùng với hoặc không có auth (cho test callback từ điện thoại)
   */
  router.post("/test-payment", async (req: Request, res: Response) => {
    try {
      const { order_id } = req.body;

      if (!order_id) {
        return res.status(400).json({
          error: "Thiếu thông tin order_id",
        });
      }

      // Check if order exists and status is Pending (bảo mật cơ bản)
      const { data: orderCheck, error: checkError } = await supabase
        .from("orders")
        .select("order_id, status")
        .eq("order_id", order_id)
        .single();

      if (checkError || !orderCheck) {
        return res.status(404).json({
          error: "Không tìm thấy đơn hàng",
        });
      }

      if (orderCheck.status !== "Pending") {
        return res.status(400).json({
          error: `Đơn hàng đã được xử lý (status: ${orderCheck.status}). Chỉ có thể test với đơn hàng đang chờ thanh toán.`,
        });
      }

      // Kiểm tra đơn hàng
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .select("*")
        .eq("order_id", order_id)
        .single();

      if (orderError || !order) {
        return res.status(404).json({
          error: "Không tìm thấy đơn hàng",
        });
      }

      if (order.status !== "Pending") {
        return res.status(400).json({
          error: `Đơn hàng đã được xử lý (status: ${order.status})`,
        });
      }

      // Simulate payment - cập nhật trạng thái đơn hàng
      const { error: updateError } = await supabase
        .from("orders")
        .update({ status: "Processing" })
        .eq("order_id", order_id);

      if (updateError) {
        throw updateError;
      }

      // Trừ inventory và xóa cart (giống payment thật)
      const { data: orderDetails, error: detailsError } = await supabase
        .from("orderdetail")
        .select("product_item_id, quantity")
        .eq("order_id", order_id);

      if (!detailsError && orderDetails) {
        for (const detail of orderDetails) {
          const { data: productItem, error: itemError } = await supabase
            .from("product_item")
            .select("quantity")
            .eq("product_item_id", detail.product_item_id)
            .single();

          if (!itemError && productItem) {
            await supabase
              .from("product_item")
              .update({ quantity: productItem.quantity - detail.quantity })
              .eq("product_item_id", detail.product_item_id);
          }
        }

        // Xóa cart items
        const { data: cart } = await supabase
          .from("cart")
          .select("cart_id")
          .eq("customer_id", order.customer_id)
          .single();

        if (cart && cart.cart_id) {
          const checkedOutProductIds = orderDetails.map(
            (item: any) => item.product_item_id
          );
          await supabase
            .from("cartitems")
            .delete()
            .eq("cart_id", cart.cart_id)
            .in("product_item_id", checkedOutProductIds);
        }
      }

      return res.json({
        success: true,
        order_id: order_id,
        status: "Processing",
        message:
          "Test payment thành công - Đơn hàng đã được xác nhận (TEST MODE)",
        test_mode: true,
      });
    } catch (error: any) {
      console.error("Error in test payment:", error);
      return res.status(500).json({
        error: error.message || "Lỗi khi simulate test payment",
      });
    }
  });
}

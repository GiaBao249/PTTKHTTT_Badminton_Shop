import { Request, Response, Router } from "express";
import { supabase } from "../../config/supabase";
export function registerDashBoardAdmin(router: Router) {
  router.get("/getDashBoardStats", async (req: Request, res: Response) => {
    try {
      const { data: orders, error: ordersError } = await supabase
        .from("orders")
        .select("order_id, total_amount, status");
      if (ordersError) {
        console.error("Error fetching orders:", ordersError);
        throw ordersError;
      }
      const totalOrders = orders?.length || 0;
      const totalRevenue =
        orders
          ?.filter(
            (order) =>
              order.status === "Shipped" || order.status === "Delivered"
          )
          .reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;

      const { data: customers, error: customersError } = await supabase
        .from("customer")
        .select("customer_id");
      if (customersError) {
        console.error("Error fetching customers:", customersError);
        throw customersError;
      }
      const totalCustomers = customers?.length || 0;

      const { data: products, error: productsError } = await supabase
        .from("product")
        .select("product_id")
        .or("is_deleted.is.null,is_deleted.eq.false");
      if (productsError) {
        console.error("Error fetching products:", productsError);
        throw productsError;
      }
      const totalProducts = products?.length || 0;

      const stats = {
        totalOrders,
        totalCustomers,
        totalProducts,
        totalRevenue,
      };

      res.json(stats);
    } catch (error) {
      console.error("Dashboard error:", error);
      return res.status(500).json({
        error: "Lỗi server khi lấy thống kê",
      });
    }
  });
}

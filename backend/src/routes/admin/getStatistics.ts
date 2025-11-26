import { Request, Response, Router } from "express";
import { supabase } from "../../config/supabase";
import { checkPermission } from "../../middleware/checkPermission";

export function registerGetStatistics(router: Router) {
  // Thống kê doanh thu theo thời gian
  router.get("/statistics/revenue", checkPermission("dashboard:read"), async (req: Request, res: Response) => {
    try {
      const { period = "month" } = req.query; // day, week, month, year

      const { data: orders, error } = await supabase
        .from("orders")
        .select("order_id, total_amount, order_date, status")
        .in("status", ["Shipped", "Delivered"]);

      if (error) throw error;

      // Group by period
      const revenueByPeriod: Record<string, number> = {};
      const orderCountByPeriod: Record<string, number> = {};

      (orders || []).forEach((order: any) => {
        if (!order.order_date) return;
        
        const date = new Date(order.order_date);
        if (isNaN(date.getTime())) {
          console.warn("Invalid date:", order.order_date);
          return;
        }
        
        let key = "";

        switch (period) {
          case "day":
            key = date.toISOString().split("T")[0]; // YYYY-MM-DD
            break;
          case "week":
            // Tính tuần: tuần bắt đầu từ thứ 2 (Monday = 1)
            const weekDate = new Date(date);
            const dayOfWeek = weekDate.getDay(); // 0 = Chủ nhật, 1 = Thứ 2, ..., 6 = Thứ 7
            // Đưa về thứ 2 của tuần
            const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
            weekDate.setDate(weekDate.getDate() - daysToMonday);
            
            // Tính số tuần trong năm (tuần 1 bắt đầu từ ngày 1/1)
            const year = weekDate.getFullYear();
            const jan1 = new Date(year, 0, 1);
            const jan1Day = jan1.getDay(); // Ngày trong tuần của 1/1
            const daysFromJan1 = Math.floor((weekDate.getTime() - jan1.getTime()) / (24 * 60 * 60 * 1000));
            
            // Điều chỉnh để tuần 1 bắt đầu từ ngày 1/1
            let weekNumber = Math.floor((daysFromJan1 + jan1Day) / 7);
            if (jan1Day > 1) weekNumber += 1; // Nếu 1/1 không phải thứ 2, tuần 1 bắt đầu sớm hơn
            
            key = `${year}-W${String(weekNumber).padStart(2, "0")}`;
            break;
          case "month":
            key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
            break;
          case "year":
            key = String(date.getFullYear());
            break;
          default:
            key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
        }

        const amount = Number(order.total_amount) || 0;
        revenueByPeriod[key] = (revenueByPeriod[key] || 0) + amount;
        orderCountByPeriod[key] = (orderCountByPeriod[key] || 0) + 1;
      });

      // Log for debugging
      console.log(`Revenue stats for period: ${period}`);
      console.log(`Total orders: ${orders?.length || 0}`);
      console.log(`Periods with revenue: ${Object.keys(revenueByPeriod).length}`);
      const totalRevenue = Object.values(revenueByPeriod).reduce((sum, val) => sum + val, 0);
      console.log(`Total revenue: ${totalRevenue}`);

      res.json({
        revenue: revenueByPeriod,
        orderCount: orderCountByPeriod,
        period,
        totalRevenue,
        totalOrders: orders?.length || 0,
      });
    } catch (error: any) {
      console.error("Error fetching revenue statistics:", error);
      return res.status(500).json({
        error: "Lỗi khi lấy thống kê doanh thu",
      });
    }
  });

  // Thống kê sản phẩm
  router.get("/statistics/products", checkPermission("dashboard:read"), async (req: Request, res: Response) => {
    try {
      // Lấy tổng số sản phẩm
      const { data: products, error: productsError } = await supabase
        .from("product")
        .select("product_id")
        .or("is_deleted.is.null,is_deleted.eq.false");

      if (productsError) throw productsError;

      // Lấy tổng số lượng tồn kho
      const { data: productItems, error: itemsError } = await supabase
        .from("product_item")
        .select("quantity");

      if (itemsError) throw itemsError;

      const totalQuantity = (productItems || []).reduce(
        (sum: number, item: any) => sum + (item.quantity || 0),
        0
      );

      // Lấy sản phẩm hết hàng
      const outOfStockProducts = (productItems || []).filter(
        (item: any) => (item.quantity || 0) === 0
      ).length;

      res.json({
        totalProducts: products?.length || 0,
        totalQuantity,
        outOfStockProducts,
        inStockProducts: (products?.length || 0) - outOfStockProducts,
      });
    } catch (error: any) {
      console.error("Error fetching product statistics:", error);
      return res.status(500).json({
        error: "Lỗi khi lấy thống kê sản phẩm",
      });
    }
  });

  // Thống kê đơn hàng theo trạng thái
  router.get("/statistics/orders", checkPermission("dashboard:read"), async (req: Request, res: Response) => {
    try {
      const { data: orders, error } = await supabase
        .from("orders")
        .select("order_id, status, total_amount, order_date");

      if (error) throw error;

      const statusCount: Record<string, number> = {};
      const statusRevenue: Record<string, number> = {};

      (orders || []).forEach((order: any) => {
        const status = order.status || "Unknown";
        statusCount[status] = (statusCount[status] || 0) + 1;
        
        if (order.total_amount) {
          statusRevenue[status] = (statusRevenue[status] || 0) + (order.total_amount || 0);
        }
      });

      res.json({
        statusCount,
        statusRevenue,
        totalOrders: orders?.length || 0,
      });
    } catch (error: any) {
      console.error("Error fetching order statistics:", error);
      return res.status(500).json({
        error: "Lỗi khi lấy thống kê đơn hàng",
      });
    }
  });

  // Thống kê tổng hợp
  router.get("/statistics/summary", checkPermission("dashboard:read"), async (req: Request, res: Response) => {
    try {
      const { startDate, endDate } = req.query;

      // Orders
      let ordersQuery = supabase.from("orders").select("order_id, total_amount, status, order_date");
      if (startDate && endDate) {
        ordersQuery = ordersQuery.gte("order_date", startDate).lte("order_date", endDate);
      }
      const { data: orders, error: ordersError } = await ordersQuery;

      if (ordersError) throw ordersError;

      const completedOrders = (orders || []).filter(
        (o: any) => o.status === "Shipped" || o.status === "Delivered"
      );
      const totalRevenue = completedOrders.reduce(
        (sum: number, o: any) => sum + (o.total_amount || 0),
        0
      );

      // Customers
      const { data: customers, error: customersError } = await supabase
        .from("customer")
        .select("customer_id");

      if (customersError) throw customersError;

      // Products
      const { data: products, error: productsError } = await supabase
        .from("product")
        .select("product_id")
        .or("is_deleted.is.null,is_deleted.eq.false");

      if (productsError) throw productsError;

      // Purchase Orders
      let purchaseOrdersQuery = supabase.from("purchaseorders").select("purchaseorder_id");
      if (startDate && endDate) {
        purchaseOrdersQuery = purchaseOrdersQuery
          .gte("purchaseorder_date", startDate)
          .lte("purchaseorder_date", endDate);
      }
      const { data: purchaseOrders, error: poError } = await purchaseOrdersQuery;

      if (poError) throw poError;

      res.json({
        totalOrders: orders?.length || 0,
        completedOrders: completedOrders.length,
        totalRevenue,
        totalCustomers: customers?.length || 0,
        totalProducts: products?.length || 0,
        totalPurchaseOrders: purchaseOrders?.length || 0,
        period: startDate && endDate ? { startDate, endDate } : null,
      });
    } catch (error: any) {
      console.error("Error fetching summary statistics:", error);
      return res.status(500).json({
        error: "Lỗi khi lấy thống kê tổng hợp",
      });
    }
  });
}


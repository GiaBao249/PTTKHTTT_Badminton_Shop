import { Request, Response, Router } from "express";
import { supabase } from "../../config/supabase";

export function registerRecentOrders(router: Router) {
    router.get("/recent_orders", async (req: Request, res: Response) => {
        try {
            const { data: orders, error: ordersError } = await supabase
            .from("orders")
            .select("*")
            .order("order_date", { ascending: false })
            .limit(5);

            if (ordersError) {
                throw ordersError;
            }
            
            console.log(orders);

            return res.json(orders);
        } catch (error) {
            console.error("Dashboard error:", error);
            return res.status(500).json({
                error: "Lỗi server khi lấy thống kê",
            });
        }
    });
}
import { Request, Response, Router } from "express";
import { supabase } from "../../config/supabase";

export function registerGetCustomers (router: Router) {
    router.get('/getCustomers', async (req: Request, res: Response) => {
        try {
            const { data: customers, error: customerError} = await supabase.from("customer").select("*");
            if (customerError) {
                throw customerError;
            }

            const { data: orders, error: ordersError } = await supabase
                .from("orders")
                .select("customer_id, total_amount, status");
            if (ordersError) {
                throw ordersError;
            }

            const statsMap = new Map<number, { total_orders: number; total_spent: number }>();
            (orders ?? []).forEach((order: any) => {
                const customerId = order.customer_id;
                if (!customerId) return;
                const entry = statsMap.get(customerId) || { total_orders: 0, total_spent: 0 };
                entry.total_orders += 1;
                if (order.total_amount) {
                    entry.total_spent += Number(order.total_amount) || 0;
                }
                statsMap.set(customerId, entry);
            });

            const enrichedCustomers = (customers ?? []).map((customer: any) => {
                const stats = statsMap.get(customer.customer_id) || { total_orders: 0, total_spent: 0 };
                return {
                    ...customer,
                    total_orders: stats.total_orders,
                    total_spent: stats.total_spent,
                };
            });

            return res.json(enrichedCustomers);
        } catch (error) {
            console.error("Dashboard error:", error);
            return res.status(500).json({
                error: "Lỗi server khi lấy thống kê",
            });
        }
    })
} 
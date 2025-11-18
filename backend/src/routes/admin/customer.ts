import { Request, Response, Router } from "express";
import { supabase } from "../../config/supabase";

export function registerGetCustomers (router: Router) {
    router.get('/customer', async (req: Request, res: Response) => {
        try {
            const { data: customers, error: customerError} = await supabase.from("customer").select("*");
            if (customerError) {
                throw customerError;
            }

            return res.json(customers);
        } catch (error) {
            console.error("Dashboard error:", error);
            return res.status(500).json({
                error: "Lỗi server khi lấy thống kê",
            });
        }
    })
} 
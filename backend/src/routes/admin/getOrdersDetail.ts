import { Router, Request, Response } from "express";
import { supabase } from "../../config/supabase";

export function registerGetOrdersDetail(router: Router) {
    router.get("/getOrdersDetail", async (req: Request, res: Response) => {
        const orderId = req.query.order_id;
        if (!orderId || typeof orderId !== 'string') {
            return res.status(400).json({ error: "Thiếu orderId hoặc sai định dạng" });
        }
        try {
            const { data: orderDetails, error } = await supabase
            .from('orderdetail')
            .select('*')
            .eq('order_id', parseInt(orderId));

            if (error) {
                console.error('Supabase error:', error);
            }
            return res.json(orderDetails);
        } catch (error) {
            console.error('Server error:', error);
        }
    });
}
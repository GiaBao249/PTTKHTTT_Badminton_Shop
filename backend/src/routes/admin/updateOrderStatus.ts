import { Router, Request, Response } from "express";
import { supabase } from "../../config/supabase";

export function registerUpdateOrderStatus (router: Router) {
    router.patch("/updateOrderStatus",  async (req: Request, res: Response) => {
        const { order_id, status } = req.body;

        if (!order_id) {
            return res.status(400).json({ error: "Thiếu order_id" });
        }
        if (!status) {
            return res.status(400).json({ error: "Thiếu status" });
        }
        try {
            const { data: updatedOrder, error } = await supabase
                .from('orders')
                .update({ 
                    status: status,
                })
                .eq('order_id', order_id)
                .select();
            
            if (error) {
                console.error('Supabase error:', error);
                return res.status(500).json({ error: "Lỗi khi cập nhật trạng thái đơn hàng" });
            }

            if (!updatedOrder || updatedOrder.length === 0) {
                return res.status(404).json({ error: "Không tìm thấy đơn hàng" });
            }

            console.log('✅ Order status updated:', updatedOrder[0]);
            return res.json({ 
                success: true, 
                message: "Cập nhật trạng thái thành công",
                order: updatedOrder[0]
            });
        } catch (error) {
            console.error('Server error:', error);
            return res.status(500).json({ error: "Lỗi máy chủ" });
        }
    });
}
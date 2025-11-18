import { Request, Response, Router } from "express";
import { supabase } from "../../config/supabase";

export function registerGetProductItem (router: Router) {
    router.get('/getProductsItem', async (req: Request, res: Response) => {
        try {
            const { data: productsItem, error} = await supabase.from("product_item").select("*");
            if (error) {
                throw error;
            }

            return res.json(productsItem);
        } catch (error) {
            console.error("Dashboard error:", error);
            return res.status(500).json({
                error: "Lỗi server khi lấy san pham",
            });
        }
    })
} 
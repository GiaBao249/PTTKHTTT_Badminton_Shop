import { Request, Response, Router } from "express";
import { supabase } from "../../config/supabase";

export function registerGetProduct (router: Router) {
    router.get('/getProducts', async (req: Request, res: Response) => {
        try {
            const { data: products, error} = await supabase.from("product").select("*");
            if (error) {
                throw error;
            }

            return res.json(products);
        } catch (error) {
            console.error("Dashboard error:", error);
            return res.status(500).json({
                error: "Lỗi server khi lấy san pham",
            });
        }
    })
} 
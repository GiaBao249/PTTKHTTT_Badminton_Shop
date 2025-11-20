import { Request, Response, Router } from "express";
import { supabase } from "../../config/supabase"

export function registerCreateProduct(router : Router) {
    router.post('/createProducts', async(req: Request, res: Response) => {
        try {
            const { product } = req.body;
            if (!product) {
                return res.status(400).json({ error: "Du lieu thieu" });
            }

            const { data: newProduct, error} = await supabase
                .from("product")
                .insert([{ product: product }])
                .select();
            if (error) {
                throw error;
            }
            res.status(201).json(newProduct[0]);
        } catch (error) {
            console.error("Dashboard error:", error);
            return res.status(500).json({
                error: "Khong the tao san pham moi.",
            });
        }
    })
}
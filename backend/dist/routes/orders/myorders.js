"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerMyOrdersRoutes = registerMyOrdersRoutes;
const supabase_1 = require("../../config/supabase");
const authRequired_1 = require("../../middleware/authRequired");
function registerMyOrdersRoutes(router) {
    router.get("/customer/:id", authRequired_1.authRequired, async (req, res) => {
        const idParam = req.params.id;
        if (!idParam) {
            return res.status(400).json({ error: "Customer ID is required" });
        }
        const customerId = parseInt(idParam, 10);
        if (isNaN(customerId)) {
            return res.status(400).json({ error: "Invalid customer ID" });
        }
        const user = req.user;
        if (user.role === "user" && user.id !== customerId) {
            return res.status(403).json({ error: "không có quyền truy cập" });
        }
        try {
            const { data: myOrder, error: myOrderError } = await supabase_1.supabase
                .from("orders")
                .select("*")
                .eq("customer_id", customerId);
            if (myOrderError || !myOrder) {
                throw myOrderError;
            }
            if (!myOrder) {
                return res.json([]);
            }
            if (myOrder.length === 0) {
                return res.json([]);
            }
            const fullIdToMyOrder = myOrder.map((o) => o.order_id);
            const { data: orderDetail, error: orderDetailError } = await supabase_1.supabase
                .from("orderdetail")
                .select(`order_id , product_item_id , quantity`)
                .in("order_id", fullIdToMyOrder);
            if (orderDetailError) {
                return res.status(500).json({
                    error: orderDetailError.message || "Lỗi khi lấy chi tiết đơn hàng",
                });
            }
            const fullIdToMyProduct = orderDetail.map((o) => o.product_item_id);
            const { data: listProduct, error: errorListProduct } = await supabase_1.supabase
                .from("product_item")
                .select(`product_item_id , product_id,  product:product_id(
              product_id,
              product_name,
              category:category_id(
                category_id,
                category_name
              )
            )`)
                .in("product_item_id", fullIdToMyProduct);
            if (errorListProduct) {
                throw errorListProduct;
            }
            const ordersWithDetails = myOrder.map((order) => {
                const detail = orderDetail?.filter((od) => od.order_id === order.order_id) || [];
                const detailsWithProducts = detail.map((detail) => {
                    const productInfo = listProduct?.find((p) => p.product_item_id === detail.product_item_id) || null;
                    return {
                        ...detail,
                        product: productInfo,
                    };
                });
                return {
                    ...order,
                    order_detail: detail,
                    infoProduct: detailsWithProducts,
                };
            });
            return res.json(ordersWithDetails);
        }
        catch (error) {
            console.error("Lỗi khi lấy đơn hàng:", error);
            return res.status(500).json({ error: "Lỗi server" });
        }
    });
}
//# sourceMappingURL=myorders.js.map
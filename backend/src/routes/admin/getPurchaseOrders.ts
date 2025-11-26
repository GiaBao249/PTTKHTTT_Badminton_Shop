import { Request, Response, Router } from "express";
import { supabase } from "../../config/supabase";
import { checkPermission } from "../../middleware/checkPermission";

export function registerGetPurchaseOrders(router: Router) {
  router.get("/getPurchaseOrders", checkPermission("purchase_order:read"), async (req: Request, res: Response) => {
    try {
      const { data: purchaseOrders, error: poError } = await supabase
        .from("purchaseorders")
        .select(
          "purchaseorder_id, supplier_id, employee_id, purchaseorder_date"
        )
        .order("purchaseorder_id", { ascending: false });

      if (poError) {
        console.error("Lỗi khi lấy phiếu nhập:", poError);
        throw poError;
      }

      if (!purchaseOrders || purchaseOrders.length === 0) {
        return res.json([]);
      }

      const supplierIds = [
        ...new Set(
          purchaseOrders.map((po: any) => po.supplier_id).filter(Boolean)
        ),
      ];
      const employeeIds = [
        ...new Set(
          purchaseOrders.map((po: any) => po.employee_id).filter(Boolean)
        ),
      ];

      const { data: suppliers, error: suppliersError } =
        supplierIds.length > 0
          ? await supabase
              .from("suppliers")
              .select("supplier_id, supplier_name")
              .in("supplier_id", supplierIds)
          : { data: [], error: null };

      if (suppliersError) {
        console.warn("Lỗi khi lấy nhà cung cấp:", suppliersError);
      }

      const { data: employees, error: employeesError } =
        employeeIds.length > 0
          ? await supabase
              .from("employees")
              .select("employ_id, name")
              .in("employ_id", employeeIds)
          : { data: [], error: null };

      if (employeesError) {
        console.warn("Error fetching employees:", employeesError);
      }

      const result = purchaseOrders.map((po: any) => {
        const employee = employees?.find((e: any) => e.employ_id === po.employee_id);
        return {
          ...po,
          supplier:
            suppliers?.find((s: any) => s.supplier_id === po.supplier_id) || null,
          employee: employee ? {
            ...employee,
            employee_id: employee.employ_id, // Map for frontend compatibility
          } : null,
        };
      });

      res.json(result);
    } catch (error: any) {
      console.error("Lỗi khi lấy phiếu nhập:", error);
      res
        .status(500)
        .json({ error: error.message || "Lỗi khi lấy danh sách phiếu nhập" });
    }
  });
}

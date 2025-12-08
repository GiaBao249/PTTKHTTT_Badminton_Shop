"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SupplierRepository = void 0;
const supabase_1 = require("../config/supabase");
class SupplierRepository {
    async findAll() {
        const { data, error } = await supabase_1.supabase
            .from("suppliers")
            .select("*")
            .order("supplier_id", { ascending: true });
        if (error)
            throw error;
        return data ?? [];
    }
    async findById(supplierId) {
        const { data, error } = await supabase_1.supabase
            .from("*")
            .select()
            .eq("supplier_id", supplierId)
            .single();
        if (error)
            throw error;
        return data;
    }
    async findByIds(supplierId) {
        if (supplierId.length === 0)
            return [];
        const { data, error } = await supabase_1.supabase
            .from("supplier")
            .select("*")
            .in("supplier_id", supplierId);
        if (error)
            throw error;
        return data ?? [];
    }
}
exports.SupplierRepository = SupplierRepository;
//# sourceMappingURL=SupplierRepository.js.map
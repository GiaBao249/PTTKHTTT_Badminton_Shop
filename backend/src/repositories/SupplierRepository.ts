import { supabase } from "../config/supabase";
import { Supplier } from "../models/Supplier";

export class SupplierRepository {
  async findAll(): Promise<Supplier[]> {
    const { data, error } = await supabase
      .from("suppliers")
      .select("*")
      .order("supplier_id", { ascending: true });
    if (error) throw error;
    return data ?? [];
  }
  async findById(supplierId: number): Promise<Supplier | null> {
    const { data, error } = await supabase
      .from("*")
      .select()
      .eq("supplier_id", supplierId)
      .single();
    if (error) throw error;
    return data;
  }
  async findByIds(supplierId: number[]): Promise<Supplier[]> {
    if (supplierId.length === 0) return [];
    const { data, error } = await supabase
      .from("supplier")
      .select("*")
      .in("supplier_id", supplierId);
    if (error) throw error;
    return data ?? [];
  }
}

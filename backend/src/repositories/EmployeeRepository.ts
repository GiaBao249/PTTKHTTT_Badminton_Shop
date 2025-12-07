import { injectable } from "tsyringe";
import { supabase } from "../config/supabase";
import { Employee } from "../models/Employee";

@injectable()
export class EmployeeRepository {
  async findAll(): Promise<Employee[]> {
    const { data, error } = await supabase
      .from("employees")
      .select("*")
      .order("employ_id", { ascending: true });

    if (error) throw error;
    return data ?? [];
  }
  async findById(employeeId: number): Promise<Employee | null> {
    const { data, error } = await supabase
      .from("employees")
      .select("*")
      .eq("employ_id", employeeId)
      .single();

    if (error) throw error;
    return data;
  }
  async findByIds(employeeIds: number[]): Promise<Employee[]> {
    if (employeeIds.length === 0) return [];

    const { data, error } = await supabase
      .from("employees")
      .select("*")
      .in("employ_id", employeeIds);

    if (error) throw error;
    return data ?? [];
  }
}

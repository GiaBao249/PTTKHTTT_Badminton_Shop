import { injectable } from "tsyringe";
import { supabase } from "../config/supabase";
import { AdminAccount } from "../models/AdminAccount";

@injectable()
export class AdminAccountRepository {
  async findAll(): Promise<AdminAccount[]> {
    const { data, error } = await supabase
      .from("adminaccounts")
      .select(
        `
        id,
        username,
        employee_id,
        employees (
          name
        )
      `
      )
      .order("id", { ascending: true });

    if (error) throw error;
    return data ?? [];
  }

  async findById(accountId: number): Promise<AdminAccount | null> {
    const { data, error } = await supabase
      .from("adminaccounts")
      .select(
        `
        id,
        username,
        employee_id,
        employees (
          name
        )
      `
      )
      .eq("id", accountId)
      .single();

    if (error) throw error;
    return data;
  }
}

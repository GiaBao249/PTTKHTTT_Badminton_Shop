import e from "express";
import { supabase } from "../config/supabase";
import { Category } from "../models/Category";
import { injectable } from "tsyringe";

@injectable()
export class CategoryRepository {
  async findAll(): Promise<Category[]> {
    const { data, error } = await supabase
      .from("category")
      .select("*")
      .order("category_id", { ascending: true });
    if (error) throw error;
    return data ?? [];
  }
  async findById(categoryId: number): Promise<Category | null> {
    const { data, error } = await supabase
      .from("category")
      .select("*")
      .eq("category_id", categoryId)
      .single();

    if (error) throw error;
    return data;
  }
  async findByIds(categoryIds: number[]): Promise<Category[]> {
    const { data, error } = await supabase
      .from("category")
      .select("*")
      .in("category_id", categoryIds);
    if (error) throw error;
    return data ?? [];
  }
  async create(categoryData: Partial<Category>): Promise<Category> {
    const { data, error } = await supabase
      .from("category")
      .insert([categoryData])
      .select()
      .single();
    if (error) throw error;
    if (!data) throw new Error("Failed to create category");
    return data;
  }
  async update(
    categoryId: number,
    updateData: Partial<Category>
  ): Promise<Category> {
    const { data, error } = await supabase
      .from("category")
      .update(updateData)
      .eq("category_id", categoryId)
      .single();
    if (error) throw error;
    if (!data) throw new Error("Category not found");
    return data;
  }
  async delete(CategoryId: number): Promise<void> {
    const { error } = await supabase
      .from("category")
      .delete()
      .eq("category_id", CategoryId);
    if (error) throw error;
  }
}

"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoryRepository = void 0;
const supabase_1 = require("../config/supabase");
const tsyringe_1 = require("tsyringe");
let CategoryRepository = class CategoryRepository {
    async findAll() {
        const { data, error } = await supabase_1.supabase
            .from("category")
            .select("*")
            .order("category_id", { ascending: true });
        if (error)
            throw error;
        return data ?? [];
    }
    async findById(categoryId) {
        const { data, error } = await supabase_1.supabase
            .from("category")
            .select("*")
            .eq("category_id", categoryId)
            .single();
        if (error)
            throw error;
        return data;
    }
    async findByIds(categoryIds) {
        const { data, error } = await supabase_1.supabase
            .from("category")
            .select("*")
            .in("category_id", categoryIds);
        if (error)
            throw error;
        return data ?? [];
    }
    async create(categoryData) {
        const { data, error } = await supabase_1.supabase
            .from("category")
            .insert([categoryData])
            .select()
            .single();
        if (error)
            throw error;
        if (!data)
            throw new Error("Failed to create category");
        return data;
    }
    async update(categoryId, updateData) {
        const { data, error } = await supabase_1.supabase
            .from("category")
            .update(updateData)
            .eq("category_id", categoryId)
            .single();
        if (error)
            throw error;
        if (!data)
            throw new Error("Category not found");
        return data;
    }
    async delete(CategoryId) {
        const { error } = await supabase_1.supabase
            .from("category")
            .delete()
            .eq("category_id", CategoryId);
        if (error)
            throw error;
    }
};
exports.CategoryRepository = CategoryRepository;
exports.CategoryRepository = CategoryRepository = __decorate([
    (0, tsyringe_1.injectable)()
], CategoryRepository);
//# sourceMappingURL=CategoryRepository.js.map
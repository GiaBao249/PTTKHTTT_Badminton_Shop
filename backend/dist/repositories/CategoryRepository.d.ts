import { Category } from "../models/Category";
export declare class CategoryRepository {
    findAll(): Promise<Category[]>;
    findById(categoryId: number): Promise<Category | null>;
    findByIds(categoryIds: number[]): Promise<Category[]>;
    create(categoryData: Partial<Category>): Promise<Category>;
    update(categoryId: number, updateData: Partial<Category>): Promise<Category>;
    delete(CategoryId: number): Promise<void>;
}
//# sourceMappingURL=CategoryRepository.d.ts.map
import { CategoryRepository } from "../repositories/CategoryRepository";
import { Category, CreateCategoryDto, UpdateCategoryDto } from "../models/Category";
export declare class CategoryService {
    private categoryRepo;
    constructor(categoryRepo: CategoryRepository);
    getAllCategories(): Promise<Category[]>;
    getCategoryById(categoryId: number): Promise<Category>;
    createCategory(dto: CreateCategoryDto): Promise<Category>;
    updateCategory(categoryId: number, dto: UpdateCategoryDto): Promise<Category>;
    deleteCategory(categoryId: number): Promise<void>;
}
//# sourceMappingURL=CategoryService.d.ts.map
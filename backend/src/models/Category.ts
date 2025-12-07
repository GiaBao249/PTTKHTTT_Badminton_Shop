export interface Category {
  category_id: number;
  category_name: string;
}

export interface CreateCategoryDto {
  category_name: string;
}

export interface UpdateCategoryDto {
  category_name: string;
}

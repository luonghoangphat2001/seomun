export interface CategoryName {
  ko: string;
  en: string;
}

export interface Category {
  id: number;
  name: CategoryName;
  name_en: string;
  slug: string;
  parent_id: number;
  description: string;
  image: string;
  icon: string;
  sort_order: number;
  is_active: boolean;
  is_best: boolean;
  created_at: string;
  updated_at: string;
  children: Category[];
  code: string;
}

export interface CategoryRESP {
  categories: Category[];
}

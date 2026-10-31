import { CartItemInputOptionsRESP, CartItemOptionRESP } from '@/apis/cart/cart.response';

export type SavedOptionRESP = {
  id: number;
  product_id: number;
  product_name: string;
  product_slug: string;
  order_name: string;
  notes?: string;
  quantity: number;
  number_of_cases: number;
  options: CartItemOptionRESP[];
  input_options: CartItemInputOptionsRESP | null;
  saved_at: string;
  expires_at: string;
};

export type SavedOptionListRESP = {
  saved_options: SavedOptionRESP[];
};

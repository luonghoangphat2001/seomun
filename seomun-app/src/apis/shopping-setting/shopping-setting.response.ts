export type ShoppingSetting = {
  id: number;
  title: string;
  content: string;
  type: string;
  created_at: string;
  updated_at: string;
};

export type ShoppingSettingRESP = {
  shopping_settings: ShoppingSetting[];
};

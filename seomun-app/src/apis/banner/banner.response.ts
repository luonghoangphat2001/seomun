export interface Banner {
  id: number;
  name: string;
  image_path: string;
  image_url: string;
  image_path_mobile: string;
  image_url_mobile: string;
  link_url: string;
  exposure_location: string;
  sort_order: number;
}

export interface BannerRESP {
  banners: Banner[];
}

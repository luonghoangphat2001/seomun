export type Popup = {
  id: number;
  name: string;
  content: string | null;
  image_path: string;
  image_url: string;
  exposure_location: string;
  exposure_target: string[];
  width: number;
  height: number;
  size_settings: {
    width: number;
    height: number;
  };
  exposure_start_date: string | null;
  exposure_end_date: string | null;
  created_at: string;
  updated_at: string;
};

export type PopupListRESP = {
  popups: Popup[];
};

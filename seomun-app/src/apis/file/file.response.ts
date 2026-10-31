export type FileRESP = {
  id: number;
  name: string;
  path: string;
  url: string;
  type: string;
  mime_type: string;
  size: number;
  created_by: string;
  created_at: string;
  updated_at: string;
};

export type FileRespsonse = {
  file: FileRESP;
};

export type GuideRESP = {
  id: number;
  title: string;
  content: string;
  type: string;
  attachments: {
    key: string;
    url: string;
    name: string;
    size: number;
  }[];
  published_at: string;
  created_at: string;
};

export type GuideListRESP = {
  guide_contents: GuideRESP[];
};

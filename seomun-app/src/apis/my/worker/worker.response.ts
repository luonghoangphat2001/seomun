export type WorkerRESP = {
  id: number;
  name: string;
  mobile: string;
  created_at: string;
  updated_at: string;
};

export type WorkerResponse = {
  workers: WorkerRESP[];
};

export type WorkerDetailResponse = {
  worker: WorkerRESP;
};

import { z } from 'zod';

const envSchema = z.object({
  VITE_API_ENDPOINT: z.string().optional(),
  VITE_API_URL: z.string().optional(),
  VITE_APP_NAME: z.string().default('Print-ly'),
});

export const env = envSchema.parse({
  VITE_API_ENDPOINT: import.meta.env.VITE_API_ENDPOINT,
  VITE_API_URL: import.meta.env.VITE_API_URL,
  VITE_APP_NAME: import.meta.env.VITE_APP_NAME,
});

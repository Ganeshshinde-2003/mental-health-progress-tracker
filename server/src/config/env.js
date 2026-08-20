import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  PORT: z.coerce.number().default(4000),
  // Comma-separated list of allowed frontend origins (e.g. local dev +
  // Vercel preview/prod URLs). Kept as one env var so deploy configs don't
  // need a new variable name per environment.
  CLIENT_URL: z
    .string()
    .min(1)
    .transform((val) => val.split(',').map((s) => s.trim()))
    .refine((urls) => urls.every((u) => z.string().url().safeParse(u).success), {
      message: 'CLIENT_URL must be a comma-separated list of valid URLs',
    }),
  TURSO_DATABASE_URL: z.string().min(1),
  TURSO_AUTH_TOKEN: z.string().min(1),
  FIREBASE_PROJECT_ID: z.string().min(1),
  FIREBASE_CLIENT_EMAIL: z.string().email(),
  FIREBASE_PRIVATE_KEY: z.string().min(1),
  GEMINI_API_KEY: z.string().min(1),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment configuration:', parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;

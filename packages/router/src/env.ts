import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string(),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  throw new Error(JSON.stringify(parsedEnv.error.flatten()));
}

export const env = parsedEnv.data;

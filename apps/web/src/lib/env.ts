import z from "zod";

const envSchema = z.object({
  production: z.boolean().default(false),
});

const parsedEnv = envSchema.safeParse(typeof process !== "undefined" ? process.env : {});

if (!parsedEnv.success) {
  throw new Error(parsedEnv.error.errors.flat().join("\n"));
}

export const env = parsedEnv.data;

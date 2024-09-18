import z from "zod";

const envSchema = z.object({
  PORT: z.string().default("3000"),
  DATABASE_URL: z.string(),
});

const env = envSchema.safeParse(process.env);

if (!env.success) {
  console.error(env.error.flatten());
  process.exit(1);
}

export default env.data;

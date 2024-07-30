import z from "zod";

const envSchema = z.object({
  PORT: z.number().default(3000),
});

const env = envSchema.safeParse(process.env);

if (!env.success) {
  console.error(env.error.flatten());
  process.exit(1);
}

export default env.data;

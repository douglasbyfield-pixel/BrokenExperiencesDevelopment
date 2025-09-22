import { createEnv } from "@t3-oss/env-core";
import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

export const env = createEnv({
	server: {
        PORT: z.coerce.number().default(3000),
        SUPABASE_URL: z.string().url(),
        SUPABASE_SERVICE_ROLE_KEY: z.string(),
	},
	runtimeEnv: {
        PORT: process.env.PORT,
        SUPABASE_URL: process.env.SUPABASE_URL,
        SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
	},
});

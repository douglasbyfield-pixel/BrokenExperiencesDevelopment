import { createEnv } from "@t3-oss/env-core";
import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

export const env = createEnv({
	server: {
		PORT: z.coerce.number().default(3000),
	},
	runtimeEnv: {
		PORT: process.env.PORT,
	},
});

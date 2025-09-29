import { edenTreaty } from "@elysiajs/eden";
import type { App } from "@server/server";

export const eden = edenTreaty<App>(process.env.NEXT_PUBLIC_SERVER_URL ?? "");

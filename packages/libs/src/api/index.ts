import { treaty } from "@elysiajs/eden";
import type { App } from "@server/server";

export function createEdenApi(baseUrl?: string) {
	const urlToUse = baseUrl ?? process.env.NEXT_PUBLIC_SERVER_URL;
	if (!urlToUse) throw new Error("NEXT_PUBLIC_SERVER_URL is not set");
	return treaty<App>(urlToUse, {
		fetch: {
			credentials: "include",
			mode: "cors",
		}
	});
}

export const eden = createEdenApi();

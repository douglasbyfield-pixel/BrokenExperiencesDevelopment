import type { eden } from "@web/lib/eden";

export type Experience = NonNullable<
	Awaited<ReturnType<typeof eden.experience.get>>["data"]
>[number];

export type Category = NonNullable<
	Awaited<ReturnType<typeof eden.category.get>>["data"]
>;

export type CategoryOption = Exclude<
	NonNullable<Awaited<ReturnType<typeof eden.category.options.get>>["data"]>,
	{ status: number; message: string }
>;

export type Stats = NonNullable<
	Awaited<ReturnType<typeof eden.stats.get>>["data"]
>;

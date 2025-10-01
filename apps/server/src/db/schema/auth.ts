import * as p from "drizzle-orm/pg-core";

export const user = p.pgTable("user", {
	id: p.text().primaryKey(),
	name: p.text().notNull(),
	email: p.text().notNull().unique(),
	emailVerified: p.boolean().notNull().default(false),
	image: p.text(),
	createdAt: p.timestamp().notNull().defaultNow(),
	updatedAt: p.timestamp().notNull().defaultNow(),
});

export const session = p.pgTable("session", {
	id: p.text().primaryKey(),
	expiresAt: p.timestamp().notNull(),
	token: p.text().notNull().unique(),
	createdAt: p.timestamp().notNull().defaultNow(),
	updatedAt: p.timestamp().notNull().defaultNow(),
	ipAddress: p.text(),
	userAgent: p.text(),
	userId: p
		.text()
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
});

export const account = p.pgTable("account", {
	id: p.text().primaryKey(),
	accountId: p.text().notNull(),
	providerId: p.text().notNull(),
	userId: p
		.text()
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
	accessToken: p.text(),
	refreshToken: p.text(),
	idToken: p.text(),
	accessTokenExpiresAt: p.timestamp(),
	refreshTokenExpiresAt: p.timestamp(),
	scope: p.text(),
	password: p.text(),
	createdAt: p.timestamp().notNull().defaultNow(),
	updatedAt: p.timestamp().notNull().defaultNow(),
});

export const verification = p.pgTable("verification", {
	id: p.text().primaryKey(),
	identifier: p.text().notNull(),
	value: p.text().notNull(),
	expiresAt: p.timestamp().notNull(),
	createdAt: p.timestamp().defaultNow(),
	updatedAt: p.timestamp().defaultNow(),
});

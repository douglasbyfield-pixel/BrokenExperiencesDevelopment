import * as p from "drizzle-orm/pg-core";

export const user = p.pgTable("user", {
	id: p.uuid().primaryKey().defaultRandom(),
	name: p.text().notNull(),
	email: p.text().notNull().unique(),
	emailVerified: p.boolean().notNull(),
	image: p.text(),
	createdAt: p.timestamp().notNull(),
	updatedAt: p.timestamp().notNull(),
});

export const session = p.pgTable("session", {
	id: p.uuid().primaryKey().defaultRandom(),
	expiresAt: p.timestamp().notNull(),
	token: p.text().notNull().unique(),
	createdAt: p.timestamp().notNull(),
	updatedAt: p.timestamp().notNull(),
	ipAddress: p.text(),
	userAgent: p.text(),
	userId: p
		.uuid()
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
});

export const account = p.pgTable("account", {
	id: p.uuid().primaryKey().defaultRandom(),
	accountId: p.text().notNull(),
	providerId: p.text().notNull(),
	userId: p
		.uuid()
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
	accessToken: p.text(),
	refreshToken: p.text(),
	idToken: p.text(),
	accessTokenExpiresAt: p.timestamp(),
	refreshTokenExpiresAt: p.timestamp(),
	scope: p.text(),
	password: p.text(),
	createdAt: p.timestamp().notNull(),
	updatedAt: p.timestamp().notNull(),
});

export const verification = p.pgTable("verification", {
	id: p.uuid().primaryKey().defaultRandom(),
	identifier: p.text().notNull(),
	value: p.text().notNull(),
	expiresAt: p.timestamp().notNull(),
	createdAt: p.timestamp(),
	updatedAt: p.timestamp(),
});

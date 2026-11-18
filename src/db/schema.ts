import { integer, text, uuid, timestamp, jsonb, pgEnum, pgTable } from "drizzle-orm/pg-core";

export const session_table = pgTable("sessions", {
  id: uuid().primaryKey().defaultRandom(),
  sapiomUserId: text().unique(),
  sapiomCardId: text(),
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
});
export const gift_request_table = pgTable("gift_requests", {
  id: uuid().primaryKey().defaultRandom(),
  sessionId: uuid().notNull().references(() => session_table.id),
  giftInterest: text().notNull(),
  budgetCents: integer().notNull(),
  shippingInfo: jsonb().$type<{ 
    first_name: string,
    last_name: string,
    street_address: string,
    address_city: string,
    address_region: string,
    postal_code: string,
    address_country: string,
    contact: { "email": string }
  }>().notNull(),
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
});

export const transactionStatus = pgEnum("transaction_status", ["pending", "preparing", "waiting_approval", "authorized", "completed", "denied", "cancelled", "needs_revision"])

export const transaction_table = pgTable("transactions", {
  id: uuid().primaryKey().defaultRandom(),
  giftRequestId: uuid().notNull().references(() => session_table.id),
  idempotencyKey: text().notNull().unique(),
  sapiomTransactionId: text().unique(),
  status: transactionStatus().notNull().default("pending"),
  totalCents: integer(),
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp({ withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

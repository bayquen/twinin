import { integer, text, uuid, timestamp, jsonb, pgEnum, pgTable } from "drizzle-orm/pg-core";

export const session = pgTable("session", {
  id: uuid().primaryKey().defaultRandom(),
  sapiomUserId: text(),
  sapiomCardId: text(),
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
});
export const gift_request = pgTable("gift_request", {
  id: uuid().primaryKey().defaultRandom(),
  sessionId: uuid(),
  giftInterest: text(),
  budgetCents: integer(),
  shippingInfo: jsonb(),
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
});

export const transactionStatus = pgEnum("transaction_status", ["pending", "preparing", "waiting_approval", "authorized", "completed", "denied", "cancelled", "needs_revision"])

export const transaction = pgTable("transaction", {
  id: uuid().primaryKey().defaultRandom(),
  giftRequestId: uuid(),
  idempotencyKey: text(),
  sapiomTransactionId: text(),
  status: transactionStatus().notNull().default("pending"),
  totalCents: integer(),
  updatedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
});

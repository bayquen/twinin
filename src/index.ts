// import dotenv from 'dotenv';
// import { drizzle } from 'drizzle-orm/neon-http';
// import { eq } from 'drizzle-orm';
// import { session_table, gift_request_table, transaction_table } from './db/schema.js';

// // Using local env vars for now. (Production mode coming soon for v1.0)
// dotenv.config({ path: '.env.local' });

// const db = drizzle(process.env.DATABASE_URL!);

// async function main() {
//   const session: typeof session_table.$inferInsert = {
//     id: ,
//     sapiomUserId: ,
//     sapiomCardId: ,
//     createdAt: ,
//   }

//   const gift_request: typeof gift_request_table.$inferInsert = {
//     id: ,
//     sessionId: ,
//     giftInterest: ,
//     budgetCents: ,
//     shippingInfo: ,
//     createdAt: ,
//   };

//   const transaction: typeof transaction_table.$inferInsert = {
//     id: ,
//     giftRequestId: ,
//     idempotencyKey: ,
//     sapiomTransactionId: ,
//     status: ,
//     totalCents: ,
//     createdAt: ,
//     updatedAt: ,
//   }

//   await db.insert(session_table).values(session);
//   console.log('New session created!');

// //   await db
// //     .update(usersTable)
// //     .set({
// //       age: 31,
// //     })
// //     .where(eq(usersTable.email, user.email));
// //   console.log('User info updated!')

// //   await db.delete(usersTable).where(eq(usersTable.email, user.email));
// //   console.log('User deleted!')
// }

// main();

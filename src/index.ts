import dotenv from 'dotenv';
import { drizzle } from 'drizzle-orm/neon-http';
import { eq } from 'drizzle-orm';
import { session, gift_request, transaction } from './db/schema.js';

// Using local env vars for now. (Production mode coming soon for v1.0)
dotenv.config({ path: '.env.local' });

const db = drizzle(process.env.DATABASE_URL!);

async function main() {
  const user: typeof session.$inferInsert = {
    name: 'John',
    age: 30,
    email: 'john@example.com',
  };

  await db.insert(usersTable).values(user);
  console.log('New user created!')

  const users = await db.select().from(usersTable);
  console.log('Getting all users from the database: ', users)

  await db
    .update(usersTable)
    .set({
      age: 31,
    })
    .where(eq(usersTable.email, user.email));
  console.log('User info updated!')

  await db.delete(usersTable).where(eq(usersTable.email, user.email));
  console.log('User deleted!')
}

main();

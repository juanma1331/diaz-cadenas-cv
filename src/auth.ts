import { Lucia } from "lucia";
import { db, USERS, SESSIONS } from "astro:db";
import { DrizzleSQLiteAdapter } from "@lucia-auth/adapter-drizzle";

declare module "lucia" {
  interface Register {
    Lucia: typeof lucia;
    DatabaseUserAttributes: DatabaseUserAttributes;
  }
}

interface DatabaseUserAttributes {
  username: string;
}

const adapter = new DrizzleSQLiteAdapter(db, SESSIONS, USERS);

export const lucia = new Lucia(adapter, {
  sessionCookie: {
    attributes: {
      // set to `true` when using HTTPS
      secure: import.meta.env.PROD,
    },
  },
  getUserAttributes: (attributes) => ({
    username: attributes.username,
  }),
});

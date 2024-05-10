import { lucia } from "@/auth";
import type { APIContext } from "astro";
import { db, eq, USERS } from "astro:db";
import { generateIdFromEntropySize } from "lucia";
import { Argon2id } from "oslo/password";

export async function POST(context: APIContext): Promise<Response> {
  const formData = await context.request.formData();
  const username = formData.get("username");
  if (
    typeof username !== "string" ||
    username.length < 3 ||
    username.length > 31 ||
    !/^[a-z0-9_-]+$/.test(username)
  ) {
    return new Response("Invalid username", {
      status: 400,
    });
  }
  const password = formData.get("password");
  if (
    typeof password !== "string" ||
    password.length < 6 ||
    password.length > 255
  ) {
    return new Response("Invalid password", {
      status: 400,
    });
  }

  // const existingUser = (
  //   await db.select().from(USERS).where(eq(USERS.username, username))
  // ).at(0);

  // NOTE:
  // Returning immediately allows malicious actors to figure out valid usernames from response times,
  // allowing them to only focus on guessing passwords in brute-force attacks.
  // As a preventive measure, you may want to hash passwords even for invalid usernames.

  const randomPassword = await new Argon2id().hash(
    generateIdFromEntropySize(10)
  );

  // const verifiedPassowrd = await new Argon2id().verify(
  //   existingUser ? existingUser.password : randomPassword,
  //   password
  // );

  // if (!verifiedPassowrd || !existingUser) {
  //   return new Response("Incorrect username or password", { status: 400 });
  // }

  // const session = await lucia.createSession(existingUser.id, {});
  // const sessionCookie = lucia.createSessionCookie(session.id);
  // context.cookies.set(
  //   sessionCookie.name,
  //   sessionCookie.value,
  //   sessionCookie.attributes
  // );

  return context.redirect("/cvs");
}

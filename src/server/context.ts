import type { inferAsyncReturnType } from "@trpc/server";
import type { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import { db, CVS, ATTACHMENTS } from "astro:db";
import type { Session } from "lucia";

interface CreateInnerContextOptions
  extends Partial<FetchCreateContextFnOptions> {
  session: Session | null;
  db: typeof db;
  CVS: typeof CVS;
  ATTACHMENTS: typeof ATTACHMENTS;
}

export async function createContextInner(opts?: CreateInnerContextOptions) {
  return {
    db,
    CVS,
    ATTACHMENTS,
    session: opts?.session,
  };
}

export async function createContext(opts: FetchCreateContextFnOptions) {
  const contextInner = await createContextInner();

  return {
    ...contextInner,
  };
}
export type Context = inferAsyncReturnType<typeof createContextInner>;

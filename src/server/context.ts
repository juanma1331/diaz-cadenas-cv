import type { inferAsyncReturnType } from "@trpc/server";
import type { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import type { Session } from "lucia";

interface CreateInnerContextOptions
  extends Partial<FetchCreateContextFnOptions> {
  session: Session | null;
}

export async function createContextInner(opts?: CreateInnerContextOptions) {
  return {
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

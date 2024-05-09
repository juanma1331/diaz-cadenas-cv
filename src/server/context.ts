import type { inferAsyncReturnType } from "@trpc/server";
import type { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import { ATTACHMENTS, CVS, db } from "astro:db";

interface CreateInnerContextOptions
  extends Partial<FetchCreateContextFnOptions> {
  locals: App.Locals;
}

export async function createContextInner(opts: CreateInnerContextOptions) {
  return {
    locals: opts.locals,
    db,
    CVS,
    ATTACHMENTS,
  };
}

export async function createContext(
  opts: FetchCreateContextFnOptions & { locals: App.Locals }
) {
  const contextInner = await createContextInner(opts);

  return {
    ...contextInner,
  };
}
export type Context = inferAsyncReturnType<typeof createContextInner>;

import { z } from "zod";
import { publicProcedure } from "../utils";
import { db, CVS, eq } from "astro:db";
import { TRPCError } from "@trpc/server";

export const inputSchema = z.object({
  id: z.string(),
  newStatus: z
    .number()
    .min(1, { message: "Invalid Status" })
    .max(4, { message: "Invalid Status" }),
});

export const changeStatusProcedure = publicProcedure
  .input(inputSchema)
  .mutation(async ({ input }) => {
    const { id, newStatus } = input;
    try {
      await db.update(CVS).set({ status: newStatus }).where(eq(CVS.id, id));
    } catch (e) {
      throw new TRPCError({ code: "BAD_REQUEST" });
    }
  });

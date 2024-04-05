import { z } from "zod";
import { publicProcedure } from "../utils";
import { db, CVS, eq, ATTACHMENTS } from "astro:db";
import { TRPCError } from "@trpc/server";
import { UTApi } from "uploadthing/server";

export const inputSchema = z.object({
  id: z.string(),
});

export const deleteCVProcedure = publicProcedure
  .input(inputSchema)
  .mutation(async ({ input }) => {
    const { id } = input;
    try {
      // Get CVS attachments
      const attachments = await db
        .select()
        .from(ATTACHMENTS)
        .where(eq(ATTACHMENTS.cvId, id));

      const utapi = new UTApi({ apiKey: import.meta.env.UPLOADTHING_SECRET });
      // delete attachments from storage
      await utapi.deleteFiles(attachments.map((a) => a.key));

      const queries = [];
      // delete attachments from db
      for (let a of attachments) {
        queries.push(db.delete(ATTACHMENTS).where(eq(ATTACHMENTS.id, a.id)));
      }
      // delete cv from db
      queries.push(db.delete(CVS).where(eq(CVS.id, id)));

      // @ts-ignore TODO: Requires a tuple with at least 1 element
      await db.batch(queries);
    } catch (e) {
      console.log(e);
      throw new TRPCError({ code: "BAD_REQUEST" });
    }
  });

import { z } from "zod";
import { publicProcedure } from "../utils";
import { db, CVS, eq, ATTACHMENTS } from "astro:db";
import { TRPCError } from "@trpc/server";
import { UTApi } from "uploadthing/server";

export const inputSchema = z.object({
  ids: z.array(z.string()),
});

export const outputSchema = z.object({
  affectedRows: z.number(),
});

export const deleteCVProcedure = publicProcedure
  .input(inputSchema)
  .output(outputSchema)
  .mutation(async ({ input }) => {
    try {
      const { ids } = input;
      const queries = [];
      const utapi = new UTApi({ apiKey: import.meta.env.UPLOADTHING_SECRET });

      const attachmentsToDelete = [];

      for (const id of ids) {
        const attachments = await db
          .select()
          .from(ATTACHMENTS)
          .where(eq(ATTACHMENTS.cvId, id));

        for (let a of attachments) {
          queries.push(db.delete(ATTACHMENTS).where(eq(ATTACHMENTS.id, a.id)));
        }

        queries.push(db.delete(CVS).where(eq(CVS.id, id)));

        attachmentsToDelete.push(...attachments.map((a) => a.key));
      }

      // @ts-ignore
      await db.batch(queries);
      await utapi.deleteFiles(attachmentsToDelete);

      return {
        affectedRows: ids.length,
      };
    } catch (e) {
      throw new TRPCError({ code: "BAD_REQUEST" });
    }
  });

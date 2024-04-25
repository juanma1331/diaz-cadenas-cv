import { z } from "zod";
import { publicProcedure } from "../utils";
import { db, CVS, eq, ATTACHMENTS } from "astro:db";
import { TRPCError } from "@trpc/server";
import { UTApi } from "uploadthing/server";

export const inputItem = z.object({
  id: z.string(),
  name: z.string(),
});

export const inputSchema = inputItem.or(z.array(inputItem));

export const outputItem = z.object({
  name: z.string(),
});

export const outputSchema = outputItem.or(z.array(outputItem));

export const deleteCVProcedure = publicProcedure
  .input(inputSchema)
  .output(outputSchema)
  .mutation(async ({ input }) => {
    try {
      const queries = [];
      const results = [];
      const utapi = new UTApi({ apiKey: import.meta.env.UPLOADTHING_SECRET });

      // Handle both single item and array of items
      const inputs = Array.isArray(input) ? input : [input];

      for (const item of inputs) {
        const { id, name } = item;

        const attachments = await db
          .select()
          .from(ATTACHMENTS)
          .where(eq(ATTACHMENTS.cvId, id));

        // delete attachments from storage
        await utapi.deleteFiles(attachments.map((a) => a.key));

        // Collect all database operations

        for (let a of attachments) {
          queries.push(db.delete(ATTACHMENTS).where(eq(ATTACHMENTS.id, a.id)));
        }

        queries.push(db.delete(CVS).where(eq(CVS.id, id)));

        // Collect result for each processed item
        results.push({ name });
      }

      // Execute all db queries in batch
      // @ts-ignore
      await db.batch(queries);

      // Return single item or array of results based on input type
      return Array.isArray(input) ? results : results[0];
    } catch (e) {
      console.log(e);
      throw new TRPCError({ code: "BAD_REQUEST" });
    }
  });

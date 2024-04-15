import { z } from "zod";
import { publicProcedure } from "../utils";
import { db, CVS, ATTACHMENTS } from "astro:db";
import { sum } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const outputSchema = z.object({
  storageInUse: z.number(),
});

export const getStorageInUseProcedure = publicProcedure
  .output(outputSchema)
  .query(async () => {
    try {
      // Get CVS attachments
      const sizeSum = await db
        .select({ value: sum(ATTACHMENTS.size) })
        .from(ATTACHMENTS);

      const sumString = sizeSum[0].value;

      if (!sumString) throw new TRPCError({ code: "BAD_REQUEST" });

      const storageInKB = Number(sumString);

      return {
        storageInUse: storageInKB,
      };
    } catch (e) {
      throw new TRPCError({ code: "BAD_REQUEST" });
    }
  });

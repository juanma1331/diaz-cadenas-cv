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

      const currentSum = Number(sumString);

      return {
        // Return in GB, file sizes are being stored in KB
        storageInUse: Math.round(currentSum / 1024 / 1024),
      };
    } catch (e) {
      throw new TRPCError({ code: "BAD_REQUEST" });
    }
  });

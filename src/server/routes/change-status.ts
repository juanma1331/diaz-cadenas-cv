import { z } from "zod";
import { adminProcedure } from "../utils";
import { db, CVS, eq } from "astro:db";
import { TRPCError } from "@trpc/server";
import type { BatchItem } from "drizzle-orm/batch";
import { statusMap } from "@/utils/shared";

export const statusSchema = z
  .number()
  .min(1, { message: "Invalid Status" })
  .max(4, { message: "Invalid Status" });

export const inputSchema = z.object({
  ids: z.array(z.string()),
  newStatus: statusSchema,
});

export const outputItem = z.object({
  name: z.string(),
  newStatus: statusSchema,
});

const outputSchema = z.object({
  affectedRows: z.number(),
  newStatus: z.string(),
});

export const changeStatusProcedure = adminProcedure
  .input(inputSchema)
  .output(outputSchema)
  .mutation(async ({ input }) => {
    try {
      const { ids, newStatus } = input;

      const queries: BatchItem<"sqlite">[] = [];
      ids.forEach((id) =>
        queries.push(
          db.update(CVS).set({ status: newStatus }).where(eq(CVS.id, id))
        )
      );

      //@ts-ignore TODO: Fix type
      await db.batch(queries);

      return {
        newStatus: statusMap(newStatus),
        affectedRows: ids.length,
      };
    } catch (e) {
      throw new TRPCError({ code: "BAD_REQUEST" });
    }
  });

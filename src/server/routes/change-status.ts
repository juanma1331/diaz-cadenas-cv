import { z } from "zod";
import { publicProcedure } from "../utils";
import { db, CVS, eq } from "astro:db";
import { TRPCError } from "@trpc/server";
import type { BatchItem } from "drizzle-orm/batch";

export const statusSchema = z
  .number()
  .min(1, { message: "Invalid Status" })
  .max(4, { message: "Invalid Status" });

export const inputItem = z.object({
  id: z.string(),
  name: z.string(),
  newStatus: statusSchema,
});

export const inputSchema = inputItem.or(z.array(inputItem));

export const outputItem = z.object({
  name: z.string(),
  newStatus: statusSchema,
});

const outputSchema = outputItem.or(z.array(outputItem));

export const changeStatusProcedure = publicProcedure
  .input(inputSchema)
  .output(outputSchema)
  .mutation(async ({ input }) => {
    try {
      if (!Array.isArray(input)) {
        const { id, name, newStatus } = input;
        await db.update(CVS).set({ status: newStatus }).where(eq(CVS.id, id));
        return {
          name,
          newStatus,
        };
      }

      const queries: BatchItem<"sqlite">[] = [];
      input.forEach((i) =>
        queries.push(
          db.update(CVS).set({ status: i.newStatus }).where(eq(CVS.id, i.id))
        )
      );

      //@ts-ignore TODO: Fix type
      await db.batch(queries);

      return input.map((i) => ({
        name: i.name,
        newStatus: i.newStatus,
      }));
    } catch (e) {
      throw new TRPCError({ code: "BAD_REQUEST" });
    }
  });

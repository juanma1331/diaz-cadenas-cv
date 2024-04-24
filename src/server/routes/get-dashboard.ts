import { z } from "zod";
import { publicProcedure } from "../utils";
import { db, CVS, ATTACHMENTS, gte, and, lte } from "astro:db";
import { sum, countDistinct } from "drizzle-orm";
import {
  startOfDay,
  startOfWeek,
  startOfMonth,
  endOfDay,
  endOfWeek,
  endOfMonth,
} from "date-fns";
import { TRPCError } from "@trpc/server";

export const inputSchema = z.object({
  date: z.string(),
});

export const outputSchema = z.object({
  storageInUse: z.number(),
  byPosition: z.object({
    keys: z.array(z.string()),
    values: z.array(z.number()),
  }),
  byPlace: z.object({
    keys: z.array(z.string()),
    values: z.array(z.number()),
  }),
  byStatus: z.object({
    keys: z.array(z.number()),
    values: z.array(z.number()),
  }),
  totalToday: z.number(),
  totalThisWeek: z.number(),
  totalThisMonth: z.number(),
  total: z.number(),
});

export const getDashboardDataProcedure = publicProcedure
  .input(inputSchema)
  .output(outputSchema)
  .query(async ({ input }) => {
    try {
      // By Position
      const positionCounts = await db
        .select({
          position: CVS.position,
          count: countDistinct(CVS.id),
        })
        .from(CVS)
        .groupBy(CVS.position);

      const byPosition = {
        keys: positionCounts.map((row) => row.position),
        values: positionCounts.map((row) => row.count),
      };

      // By Place
      const placeCounts = await db
        .select({
          place: CVS.place,
          count: countDistinct(CVS.id),
        })
        .from(CVS)
        .groupBy(CVS.place);

      const byPlace = {
        keys: placeCounts.map((row) => row.place),
        values: placeCounts.map((row) => row.count),
      };

      // By Status
      const statusCounts = await db
        .select({
          status: CVS.status,
          count: countDistinct(CVS.id),
        })
        .from(CVS)
        .groupBy(CVS.status);

      const byStatus = {
        keys: statusCounts.map((row) => row.status),
        values: statusCounts.map((row) => row.count),
      };

      // Storage in use
      const sizeSum = await db
        .select({ value: sum(ATTACHMENTS.size) })
        .from(ATTACHMENTS);

      const sumString = sizeSum[0].value;
      if (!sumString) throw new Error("sumString is null");

      const storageInBytes = Number(sumString);

      // Recieved cvs count
      const today = startOfDay(input.date);
      const thisWeek = startOfWeek(input.date);
      const thisMonth = startOfMonth(input.date);
      const todayEnd = endOfDay(input.date);
      const thisWeekEnd = endOfWeek(input.date);
      const thisMonthEnd = endOfMonth(input.date);

      const total = await db.select({ count: countDistinct(CVS.id) }).from(CVS);

      const totalToday = await db
        .select({ count: countDistinct(CVS.id) })
        .from(CVS)
        .where(and(gte(CVS.createdAt, today), lte(CVS.createdAt, todayEnd)));

      const totalThisWeek = await db
        .select({ count: countDistinct(CVS.id) })
        .from(CVS)
        .where(
          and(gte(CVS.createdAt, thisWeek), lte(CVS.createdAt, thisWeekEnd))
        );

      const totalThisMonth = await db
        .select({ count: countDistinct(CVS.id) })
        .from(CVS)
        .where(
          and(gte(CVS.createdAt, thisMonth), lte(CVS.createdAt, thisMonthEnd))
        );

      return {
        byPosition,
        byPlace,
        byStatus,
        storageInUse: inGB(storageInBytes),
        totalToday: totalToday[0].count,
        totalThisWeek: totalThisWeek[0].count,
        totalThisMonth: totalThisMonth[0].count,
        total: total[0].count,
      };
    } catch (e) {
      throw new TRPCError({ code: "BAD_REQUEST" });
    }
  });

function inGB(storageInBytes: number) {
  return Math.round(storageInBytes / 1024 / 1024 / 1024);
}

import { z } from "zod";
import { publicProcedure } from "../utils";
import {
  inArray,
  db,
  like,
  desc as descFun,
  CVS,
  ATTACHMENTS,
  asc,
  and,
  gte,
  lt,
} from "astro:db";
import { count, type SQLWrapper } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const filterSchema = z.object({
  id: z.enum(["place", "position", "status"]),
  value: z.string().or(z.number()),
});

export const dateFilterSchema = z
  .object({
    type: z.literal("single"),
    date: z.string(),
  })
  .optional()
  .or(
    z
      .object({
        type: z.literal("range"),
        from: z.string(),
        to: z.string(),
      })
      .optional()
  );

export const sortSchema = z.object({
  id: z.enum(["name", "email", "createdAt"]),
  desc: z.boolean(),
});

export const inputSchema = z.object({
  filters: z.array(filterSchema).optional(),
  dateFilters: dateFilterSchema,
  search: z
    .object({
      id: z.enum(["name", "email"]),
      value: z.string(),
    })
    .optional(),
  sorting: z.array(sortSchema).max(1, { message: "Only one sorting" }),
  pagination: z.object({
    page: z.number().default(1),
    limit: z.number().default(10),
  }),
});

export const cvSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  status: z.number(),
  place: z.string(),
  position: z.string(),
  createdAt: z.string(),
  attachments: z.array(
    z.object({
      name: z.string(),
      url: z.string(),
      type: z.string(),
    })
  ),
});

export const outputSchema = z.object({
  cvs: z.array(cvSchema),
  pages: z.array(z.number()),
});

export const getAllCVSProcedure = publicProcedure
  .input(inputSchema)
  .output(outputSchema)
  .query(async ({ input }) => {
    const { pagination, sorting, filters, dateFilters, search } = input;
    console.log(input);
    let cvsQuery = db.select().from(CVS).$dynamic();
    let totalPagesQuery = db.select({ count: count() }).from(CVS).$dynamic();

    // Filtering
    if (filters) {
      const filterConditions: (SQLWrapper | undefined)[] = [];

      filters.forEach((filter) => {
        const { id, value } = filter;
        switch (id) {
          case "place":
            filterConditions.push(like(CVS.place, `%${value}%`));
            break;
          case "position":
            filterConditions.push(like(CVS.position, `%${value}%`));
            break;
          case "status":
            filterConditions.push(like(CVS.status, `${value}`));
            break;
          default:
            throw new TRPCError({ code: "BAD_REQUEST" });
        }
      });

      if (filterConditions.length > 0) {
        const filterCondition = and(...filterConditions);
        cvsQuery = cvsQuery.where(filterCondition);
        totalPagesQuery = totalPagesQuery.where(filterCondition);
      }
    }

    // Date Filtering
    if (dateFilters) {
      const { type } = dateFilters;

      switch (type) {
        case "single":
          const { date } = dateFilters;
          const singleDate = new Date(date);
          const nextDay = new Date(singleDate.getTime() + 86400000); // Add a day in miliseconds
          cvsQuery = cvsQuery.where(
            and(gte(CVS.createdAt, singleDate), lt(CVS.createdAt, nextDay))
          );
          totalPagesQuery = totalPagesQuery.where(
            and(gte(CVS.createdAt, singleDate), lt(CVS.createdAt, nextDay))
          );
          break;
        case "range": {
          const { from, to } = dateFilters;
          const fromDate = new Date(from);
          const toDate = new Date(to);
          cvsQuery = cvsQuery.where(
            and(gte(CVS.createdAt, fromDate), lt(CVS.createdAt, toDate))
          );
          totalPagesQuery = totalPagesQuery.where(
            and(gte(CVS.createdAt, fromDate), lt(CVS.createdAt, toDate))
          );
          break;
        }
        default:
          throw new TRPCError({ code: "BAD_REQUEST" });
      }
    }

    // Search
    if (search) {
      const { id, value } = search;
      switch (id) {
        case "name":
          cvsQuery = cvsQuery.where(like(CVS.name, `%${value}%`));
          totalPagesQuery = totalPagesQuery.where(like(CVS.name, `%${value}%`));
          break;
        case "email":
          cvsQuery = cvsQuery.where(like(CVS.email, `%${value}%`));
          totalPagesQuery = totalPagesQuery.where(
            like(CVS.email, `%${value}%`)
          );
          break;
        default:
          throw new TRPCError({ code: "BAD_REQUEST" });
      }
    }

    // Sorting
    if (!sorting.length) {
      cvsQuery.orderBy(descFun(CVS.createdAt));
      totalPagesQuery.orderBy(descFun(CVS.createdAt));
    } else {
      const { id, desc } = sorting[0];
      switch (id) {
        case "name":
          cvsQuery.orderBy(desc ? descFun(CVS.name) : asc(CVS.name));
          totalPagesQuery.orderBy(desc ? descFun(CVS.name) : asc(CVS.name));
          break;
        case "email":
          cvsQuery.orderBy(desc ? descFun(CVS.email) : asc(CVS.email));
          totalPagesQuery.orderBy(desc ? descFun(CVS.email) : asc(CVS.email));
          break;
        case "createdAt":
          cvsQuery.orderBy(desc ? descFun(CVS.createdAt) : asc(CVS.createdAt));
          totalPagesQuery.orderBy(
            desc ? descFun(CVS.createdAt) : asc(CVS.createdAt)
          );
          break;
        default:
          throw new TRPCError({ code: "BAD_REQUEST" });
      }
    }

    // Pagination
    const { page, limit } = pagination;
    const offset = (page - 1) * limit;
    cvsQuery.offset(offset).limit(pagination.limit);

    // Select cvs attachments
    const cvsStartTime = Date.now();
    const cvsResults = await cvsQuery.all();
    const cvsEndTime = Date.now();
    console.log(`CVs query took ${cvsEndTime - cvsStartTime} ms`);
    const cvsIDs = cvsResults.map((cv) => cv.id);

    const attachmentsStartTime = Date.now();
    const attachmentsResults =
      cvsIDs.length > 0
        ? await db
            .select()
            .from(ATTACHMENTS)
            .where(inArray(ATTACHMENTS.cvId, cvsIDs))
        : [];

    const attachmentsEndTime = Date.now();
    console.log(
      `Attachments query took ${attachmentsEndTime - attachmentsStartTime} ms`
    );

    type Result = z.infer<typeof outputSchema>;
    const cvs: Result["cvs"] = cvsResults.map((cv) => {
      const attachments = attachmentsResults.filter(
        (attachment) => attachment.cvId === cv.id
      );

      return {
        id: cv.id,
        name: cv.name,
        email: cv.email,
        status: cv.status,
        place: cv.place,
        position: cv.position,
        createdAt: cv.createdAt.toISOString(),
        attachments: attachments.map((attachment) => ({
          name: attachment.name,
          url: attachment.url,
          type: attachment.type,
        })),
      };
    });

    const rowsCount = (await totalPagesQuery.all())[0].count;
    const totalPages = Math.ceil(rowsCount / pagination.limit);
    const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

    return {
      pages,
      cvs,
    };
  });

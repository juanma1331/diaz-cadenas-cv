import { z } from "zod";
import { publicProcedure } from "../utils";
import { inArray, type db, like, asc, desc } from "astro:db";
import { count } from "drizzle-orm";

export const inputSchema = z.object({
  filter: z
    .object({
      field: z.string(),
      value: z.string(),
    })
    .optional(),
  sorting: z
    .object({
      field: z.string(),
      direction: z.string(),
    })
    .optional(),
  pagination: z.object({
    page: z.number().default(1),
    limit: z.number().default(10),
  }),
});

export const cvSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  status: z.string(),
  place: z.string(),
  position: z.string(),
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

export const getAllCVSServerProcedure = publicProcedure
  .input(inputSchema)
  .output(outputSchema)
  .query(async ({ input, ctx }) => {
    const startTime = Date.now();
    const { filter, sorting, pagination } = input;

    const offset = (pagination.page - 1) * pagination.limit;

    const pagesCountStartTime = Date.now();
    const pagesCount = (
      await ctx.db.select({ count: count() }).from(ctx.CVS)
    )[0].count;
    const pagesCountEndTime = Date.now();
    console.log(
      `Pages count query took ${
        (pagesCountEndTime - pagesCountStartTime) / 1000
      }sec`
    );
    const pages = Array.from(
      { length: Math.ceil(pagesCount / pagination.limit) },
      (_, i) => i + 1
    );

    if (pages.length === 0) {
      return {
        cvs: [],
        pages: [],
      };
    }

    const cvsStartTime = Date.now();
    const cvsQuery = ctx.db.select().from(ctx.CVS);

    // Pagination
    cvsQuery.offset(offset).limit(pagination.limit);

    // Filtering
    if (filter) {
      const { field, value } = filter;
      switch (field) {
        case "name":
          cvsQuery.where(like(ctx.CVS.name, value));
          break;
        case "email":
          cvsQuery.where(like(ctx.CVS.email, value));
          break;
        case "place":
          cvsQuery.where(like(ctx.CVS.place, value));
          break;
        case "position":
          cvsQuery.where(like(ctx.CVS.position, value));
          break;
        case "status":
          cvsQuery.where(like(ctx.CVS.status, value));
          break;
        default:
          throw new Error(`Unknown filter field: ${field}`);
      }
    }

    // Sorting
    if (sorting) {
      const { field, direction } = sorting;
      switch (field) {
        case "name":
          cvsQuery.orderBy(
            direction === "asc" ? asc(ctx.CVS.name) : desc(ctx.CVS.name)
          );
          break;
        case "email":
          cvsQuery.orderBy(
            direction === "asc" ? asc(ctx.CVS.email) : desc(ctx.CVS.email)
          );
          break;
        default:
          throw new Error(`Unknown sorting field: ${field}`);
      }
    }

    const cvsResults = await cvsQuery.all();
    const cvsEndTime = Date.now();
    console.log(`CVs query took ${(cvsEndTime - cvsStartTime) / 1000}sec`);
    const cvsIDs = cvsResults.map((cv) => cv.id);

    const attachmentsStartTime = Date.now();
    const attachmentsResults = await ctx.db
      .select()
      .from(ctx.ATTACHMENTS)
      .where(inArray(ctx.ATTACHMENTS.cvId, cvsIDs));

    const attachmentsEndTime = Date.now();
    console.log(
      `Attachments query took ${
        (attachmentsEndTime - attachmentsStartTime) / 1000
      }sec`
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
        attachments: attachments.map((attachment) => ({
          name: attachment.name,
          url: attachment.url,
          type: attachment.type,
        })),
      };
    });

    const result: Result = {
      cvs,
      pages,
    };

    console.log(result);

    return result;
  });

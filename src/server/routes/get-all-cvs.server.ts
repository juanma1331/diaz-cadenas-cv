import { z } from "zod";
import { publicProcedure } from "../utils";
import { inArray, db, like, asc, desc, CVS, ATTACHMENTS } from "astro:db";
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
    .optional()
    .default({ field: "createdAt", direction: "desc" }),
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

export const getAllCVSServerProcedure = publicProcedure
  .input(inputSchema)
  .output(outputSchema)
  .query(async ({ input }) => {
    const { filter, sorting, pagination } = input;

    const offset = (pagination.page - 1) * pagination.limit;

    const pagesCountStartTime = Date.now();
    const pagesCount = (await db.select({ count: count() }).from(CVS))[0].count;
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
    const cvsQuery = db.select().from(CVS);

    // Pagination
    cvsQuery.offset(offset).limit(pagination.limit);

    // Filtering
    if (filter) {
      const { field, value } = filter;
      switch (field) {
        case "name":
          cvsQuery.where(like(CVS.name, value));
          break;
        case "email":
          cvsQuery.where(like(CVS.email, value));
          break;
        case "place":
          cvsQuery.where(like(CVS.place, value));
          break;
        case "position":
          cvsQuery.where(like(CVS.position, value));
          break;
        case "status":
          cvsQuery.where(like(CVS.status, value));
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
            direction === "asc" ? asc(CVS.name) : desc(CVS.name)
          );
          break;
        case "email":
          cvsQuery.orderBy(
            direction === "asc" ? asc(CVS.email) : desc(CVS.email)
          );
          break;
        case "createdAt":
          cvsQuery.orderBy(
            direction === "asc" ? asc(CVS.createdAt) : desc(CVS.createdAt)
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
    const attachmentsResults = await db
      .select()
      .from(ATTACHMENTS)
      .where(inArray(ATTACHMENTS.cvId, cvsIDs));

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

      console.log(typeof cv.createdAt);

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

    const result: Result = {
      cvs,
      pages,
    };

    console.log(result);

    return result;
  });

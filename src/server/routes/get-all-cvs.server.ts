import { z } from "zod";
import { publicProcedure } from "../utils";
import { inArray, db, like, desc, CVS, ATTACHMENTS, lt } from "astro:db";
import { count } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const filterSchema = z.object({
  id: z.enum(["place", "position", "status"]),
  value: z.string(),
});

export const inputSchema = z.object({
  filters: z.array(filterSchema).optional(),
  search: z
    .object({
      id: z.enum(["name", "email"]),
      value: z.string(),
    })
    .optional(),
  pagination: z.object({
    cursor: z.string().optional(),
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
  cursor: z.string().optional(),
  pages: z.array(z.number()),
});

export const getAllCVSServerProcedure = publicProcedure
  .input(inputSchema)
  .output(outputSchema)
  .query(async ({ input }) => {
    const { filters, search, pagination } = input;
    console.log(input);

    const cvsQuery = db.select().from(CVS).orderBy(desc(CVS.createdAt));
    const totalPagesQuery = db
      .select({ count: count() })
      .from(CVS)
      .orderBy(CVS.createdAt);

    // Filtering
    if (filters) {
      for (let filter of filters) {
        const { id, value } = filter;
        switch (id) {
          case "place":
            cvsQuery.where(like(CVS.place, value));
            totalPagesQuery.where(like(CVS.place, value));
            break;
          case "position":
            cvsQuery.where(like(CVS.position, value));
            totalPagesQuery.where(like(CVS.position, value));
            break;
          case "status":
            cvsQuery.where(like(CVS.status, value));
            totalPagesQuery.where(like(CVS.status, value));
            break;
          default:
            throw new TRPCError({ code: "BAD_REQUEST" });
        }
      }
    }

    if (search) {
      const { id, value } = search;
      switch (id) {
        case "name":
          cvsQuery.where(like(CVS.name, `%${value}%`));
          totalPagesQuery.where(like(CVS.name, `%${value}%`));
          break;
        case "email":
          cvsQuery.where(like(CVS.email, `%${value}%`));
          totalPagesQuery.where(like(CVS.email, `%${value}%`));
          break;
        default:
          throw new TRPCError({ code: "BAD_REQUEST" });
      }
    }

    // Pagination
    if (pagination.cursor) {
      const cursor = new Date(pagination.cursor);
      cvsQuery.where(lt(CVS.createdAt, cursor));
    }
    cvsQuery.limit(pagination.limit + 1); // Pick an extra item to check if there are more rows

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

    const totalPagesStartTime = Date.now();
    const rowsCount = (await totalPagesQuery.all())[0].count;
    const totalPagesEndTime = Date.now();
    console.log(
      `TotalPages query took ${totalPagesStartTime - totalPagesEndTime} ms`
    );
    const totalPages = Math.ceil(rowsCount / pagination.limit);
    const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

    if (cvs.length > 0) {
      const hasRowsLeft = cvs.length === pagination.limit + 1;
      const newCursor = hasRowsLeft
        ? cvs[cvs.length - 2].createdAt
        : cvs[cvs.length - 1].createdAt;

      if (hasRowsLeft) {
        cvs.pop(); // Delete the extra row
      }

      const result: Result = {
        pages,
        cvs,
        cursor: hasRowsLeft ? newCursor : undefined,
      };

      return result;
    } else {
      return {
        pages: [],
        cvs,
        cursor: undefined,
      };
    }
  });

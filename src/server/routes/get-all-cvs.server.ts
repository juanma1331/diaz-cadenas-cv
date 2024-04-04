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
} from "astro:db";
import { count } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const filterSchema = z.object({
  id: z.enum(["place", "position", "status"]),
  value: z.string(),
});

export const sortSchema = z.object({
  id: z.enum(["name", "email", "createdAt"]),
  desc: z.boolean(),
});

export const inputSchema = z.object({
  filters: z.array(filterSchema).optional(),
  search: z
    .object({
      id: z.enum(["name", "email"]),
      value: z.string(),
    })
    .optional(),
  sorting: z.array(sortSchema).nonempty(),
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
    const { filters, search, pagination, sorting } = input;
    console.log(input);

    const cvsQuery = db.select().from(CVS);
    const totalPagesQuery = db.select({ count: count() }).from(CVS);

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

    // Sorting
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

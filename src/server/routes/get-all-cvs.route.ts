import { z } from "zod";
import { publicProcedure } from "../utils";
import { asc, desc, eq } from "astro:db";

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
});

export const getAllCVSProcedure = publicProcedure
  .output(outputSchema)
  .query(async ({ ctx }) => {
    const startTime = Date.now();
    const queryResult = await ctx.db
      .select({
        cvs: ctx.CVS,
        attachment: ctx.ATTACHMENTS,
      })
      .from(ctx.CVS)
      .orderBy(desc(ctx.CVS.createdAt))
      .innerJoin(ctx.ATTACHMENTS, eq(ctx.ATTACHMENTS.cvId, ctx.CVS.id));
    const endTime = Date.now();
    console.log(`Query took ${endTime - startTime}ms`);

    // TODO: Add types
    const cvs = queryResult.reduce((acc: any, row) => {
      const { cvs, attachment } = row;

      if (!acc[cvs.id]) {
        acc[cvs.id] = {
          ...cvs,
          attachments: [],
        };
      }

      acc[cvs.id].attachments.push(attachment);

      return acc;
    }, {});

    return {
      cvs: Object.values(cvs),
    };
  });

import { z } from "zod";
import { publicProcedure } from "../utils";
import { asc, desc, eq, CVS, ATTACHMENTS } from "astro:db";

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
  storageUsed: z.number(),
});

type ProcessedResult = typeof CVS.$inferSelect & {
  attachments: (typeof ATTACHMENTS.$inferSelect)[];
};

export const getAllCVSProcedure = publicProcedure
  .output(outputSchema)
  .query(async ({ ctx }) => {
    const queryResult = await ctx.db
      .select({
        cvs: CVS,
        attachment: ATTACHMENTS,
      })
      .from(CVS)
      .orderBy(desc(CVS.createdAt))
      .innerJoin(ATTACHMENTS, eq(ATTACHMENTS.cvId, CVS.id));

    const processed: Record<string, ProcessedResult> = queryResult.reduce(
      (acc: any, row) => {
        const { cvs, attachment } = row;

        if (!acc[cvs.id]) {
          acc[cvs.id] = {
            ...cvs,
            attachments: [],
          };
        }

        acc[cvs.id].attachments.push(attachment);

        return acc;
      },
      {}
    );

    const cvs = Object.values(processed);
    const storageUsed = calculateTotalSpaceUsed(cvs);

    console.log("storageUsed", storageUsed);

    return {
      cvs,
      storageUsed,
    };
  });

export function calculateTotalSpaceUsed(cvs: ProcessedResult[]) {
  const sum = cvs.reduce((acc, cv) => {
    const totalSize = cv.attachments.reduce(
      (acc: number, attachment: ProcessedResult["attachments"][number]) => {
        console.log("attachment.size", attachment.size);
        return acc + attachment.size;
      },
      0
    );

    return acc + totalSize;
  }, 0);

  // Size is stored in db in kb using an integer
  return Math.round(sum / 1024 / 1024);
}

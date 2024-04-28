import { z } from "zod";
import { generateId } from "lucia";
import { publicProcedure } from "../utils";
import { PLACES, POSITIONS } from "@/constants";

export const nameSchema = z.string().min(2, {
  message: "Al menos 2 caracteres",
});
export const emailSchema = z.string().email({
  message: "Introduce un email válido",
});

export const placeSchema = z.enum(PLACES);

export const positionSchema = z.enum(POSITIONS);

const uploadedFileSchema = z.object({
  name: z.string(),
  url: z.string(),
  key: z.string(),
  size: z.number(),
  type: z.string(),
});

const inputSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  place: placeSchema,
  position: positionSchema,
  attachments: z.array(uploadedFileSchema),
});

export type UploadedFile = z.infer<typeof uploadedFileSchema>;

export const insertCVProdedure = publicProcedure
  .input(inputSchema)
  .mutation(async ({ input, ctx }) => {
    const queries = [];
    const cvId = generateId(15);

    queries.push(
      ctx.db.insert(ctx.CVS).values({
        id: cvId,
        name: input.name,
        email: input.email,
        place: input.place,
        position: input.position,
        createdAt: new Date(),
      })
    );

    for (const attachment of input.attachments) {
      queries.push(
        ctx.db.insert(ctx.ATTACHMENTS).values({
          name: attachment.name,
          url: attachment.url,
          size: attachment.size,
          type: attachment.type,
          key: attachment.key,
          cvId: cvId,
        })
      );
    }

    // @ts-ignore TODO: Requires a tuple with at least 1 element
    await ctx.db.batch(queries);
  });

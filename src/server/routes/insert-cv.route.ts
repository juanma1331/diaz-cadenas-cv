import { z } from "zod";
import { generateId } from "lucia";
import { publicProcedure } from "../utils";

export const nameSchema = z.string().min(2, {
  message: "Nombre debe tener al menos 2 caracteres.",
});
export const emailSchema = z.string().email({
  message: "Email no es válido.",
});

export const placeSchema = z.enum([
  "Andújar",
  "Brenes",
  "Bollullos Par del Condado",
  "Cádiz",
  "Coria del Rio",
  "Estepa",
  "Gilena",
  "Hytasa",
  "La Carolina",
  "Lantejuela",
  "Moguer",
  "Osuna",
  "Sanlúcar de Barrameda",
  "Sevilla",
  "Utrera",
]);

export const positionSchema = z.enum([
  "Carnicería",
  "Charcutería",
  "Pescadería",
  "Frutería",
  "Panadería",
  "Pastelería",
  "Cajero",
  "Reponedor",
  "Limpieza",
]);

const uploadedFileSchema = z.object({
  name: z.string(),
  url: z.string(),
  key: z.string(),
  size: z.number(),
  type: z.string(),
});

const insertCVSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  place: placeSchema,
  position: positionSchema,
  attachments: z.array(uploadedFileSchema),
});

export type UploadedFile = z.infer<typeof uploadedFileSchema>;

export const insertCVProdedure = publicProcedure
  .input(insertCVSchema)
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
    await db.batch(queries);
  });

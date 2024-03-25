import { z } from "zod";
import { generateId } from "lucia";
import { publicProcedure } from "../utils";
import type { db } from "astro:db";

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
    page: z.number(),
    limit: z.number(),
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
});

export const getAllCVSProcedure = publicProcedure
  .output(outputSchema)
  .query(async ({ ctx }) => {
    // Add a delay
    await new Promise((resolve) => setTimeout(resolve, 10000));

    return {
      cvs: [],
    };
  });

async function getCVSFromDB(dbClient: typeof db) {
  // Simulate a database request

  return [];
}

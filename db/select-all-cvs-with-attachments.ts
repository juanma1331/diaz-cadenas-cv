import type { CVStatus, CVWithAttachments } from "@/types";
import { db, CVS, ATTACHMENTS } from "astro:db";
import { eq, like, asc, desc } from "astro:db";

export type SelectAllCVSWithAttachmentsParams = {
  filter?: { field: string; value: string };
  sorting?: { field: string; direction: "asc" | "desc" };
  pagination: {
    page: number;
    limit: number;
  };
};

export async function selectAllCVSWithAttachments(
  params: SelectAllCVSWithAttachmentsParams
): Promise<CVWithAttachments[]> {
  const { filter, sorting, pagination } = params;

  const query = db
    .select({
      cv: CVS,
      attachment: ATTACHMENTS,
    })
    .from(CVS)
    .leftJoin(ATTACHMENTS, eq(CVS.id, ATTACHMENTS.cvId));

  if (filter) {
    const { field, value } = filter;
    switch (field) {
      case "name":
        query.where(like(CVS.name, `%${value}%`));
        break;
      case "email":
        query.where(like(CVS.email, `%${value}%`));
        break;
      case "place":
        query.where(like(CVS.place, `%${value}%`));
        break;
      case "position":
        query.where(like(CVS.position, `%${value}%`));
        break;
      case "status":
        query.where(eq(CVS.status, value as CVStatus));
        break;
      default:
        throw new Error(`Unknown filter field: ${field}`);
    }
  }

  if (sorting) {
    const { field, direction } = sorting;
    switch (field) {
      case "name":
        query.orderBy(direction === "asc" ? asc(CVS.name) : desc(CVS.name));
        break;
      case "email":
        query.orderBy(direction === "asc" ? asc(CVS.email) : desc(CVS.email));
        break;
      default:
        throw new Error(`Unknown sorting field: ${field}`);
    }
  }

  const { page, limit } = pagination;
  const offset = (page - 1) * limit;
  query.offset(offset).limit(limit);

  const rows = await query.all();

  const cvs: Record<string, CVWithAttachments> = rows.reduce(
    (acc: Record<string, CVWithAttachments>, row) => {
      const { cv, attachment } = row;
      if (!acc[cv.id]) {
        acc[cv.id] = { ...cv, status: cv.status as CVStatus, attachments: [] };
      }

      if (attachment) {
        acc[cv.id].attachments.push(attachment);
      }

      return acc;
    },
    {}
  );

  return Object.values(cvs);
}

import type { Attachment, CVStatus, CVWithAttachments } from "@/types";
import { db, CVS, ATTACHMENTS } from "astro:db";
import { eq, like, asc, desc, inArray } from "astro:db";

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

export async function selectAllCVSWithAttachments2(
  params: SelectAllCVSWithAttachmentsParams
): Promise<CVWithAttachments[]> {
  const { filter, sorting, pagination } = params;

  // Primero, determina los IDs de los CVs aplicando filtros, ordenación y paginación
  const baseQuery = db.select().from(CVS);

  // Aplicar filtros
  if (filter) {
    const { field, value } = filter;
    switch (field) {
      case "name":
        baseQuery.where(like(CVS.name, `%${value}%`));
        break;
      case "email":
        baseQuery.where(like(CVS.email, `%${value}%`));
        break;
      case "place":
        baseQuery.where(like(CVS.place, `%${value}%`));
        break;
      case "position":
        baseQuery.where(like(CVS.position, `%${value}%`));
        break;
      case "status":
        baseQuery.where(eq(CVS.status, value as CVStatus));
        break;
      default:
        throw new Error(`Unknown filter field: ${field}`);
    }
  }

  // Aplicar ordenación
  if (sorting) {
    const { field, direction } = sorting;
    switch (field) {
      case "name":
        baseQuery.orderBy(direction === "asc" ? asc(CVS.name) : desc(CVS.name));
        break;
      case "email":
        baseQuery.orderBy(
          direction === "asc" ? asc(CVS.email) : desc(CVS.email)
        );
        break;
      default:
        throw new Error(`Unknown sorting field: ${field}`);
    }
  }

  // Aplicar paginación
  const { page, limit } = pagination;
  const offset = (page - 1) * limit;
  baseQuery.offset(offset).limit(limit);

  const cvIds = (await baseQuery.all()).map((cv) => cv.id as string);

  console.log("cvIds", cvIds.length);

  // Si no se encontraron CVs, retorna un arreglo vacío
  if (cvIds.length === 0) return [];

  // Segundo, obtén los detalles de los CVs
  const cvsDetails = await db
    .select()
    .from(CVS)
    .where(inArray(CVS.id, cvIds))
    .all();

  // Tercero, obtén todos los adjuntos para los IDs de CVs seleccionados
  const attachments = await db
    .select()
    .from(ATTACHMENTS)
    .where(inArray(ATTACHMENTS.cvId, cvIds))
    .all();

  // Agrupa los adjuntos por cvId
  type AttachmentsByCvId = Record<string, Attachment[]>;
  const attachmentsByCvId: AttachmentsByCvId = attachments.reduce(
    (acc: AttachmentsByCvId, attachment) => {
      if (!acc[attachment.cvId]) {
        acc[attachment.cvId] = [];
      }
      acc[attachment.cvId].push(attachment);
      return acc;
    },
    {}
  );

  // Construye el resultado final, adjuntando los adjuntos a sus respectivos CVs
  return cvsDetails.map((cv) => ({
    ...cv,
    status: cv.status as CVStatus,
    attachments: attachmentsByCvId[cv.id] || [],
  }));
}

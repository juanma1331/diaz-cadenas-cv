import { db, CVS, ATTACHMENTS } from "astro:db";
import { eq } from "astro:db";

export type SelectCVSParams = {
  filter?: {field: string, value: string};
  sorting?: {field: string, direction: "asc" | "desc"};
  pagination: {
    page: number;
    pageSize: number;
  }
}

export async function selectCVS(params: SelectCVSParams) {
    const rows = await db
    .select({
      cv: CVS,
      attachment: ATTACHMENTS,
    })
    .from(CVS)
    .leftJoin(ATTACHMENTS, eq(CVS.id, ATTACHMENTS.cvId))
    .all();
  
  // TODO: Add types
  const cvs = rows.reduce((acc: any, row) => {
    const { cv, attachment } = row;
    if (!acc[cv.id]) {
      acc[cv.id] = { ...cv, attachments: [] };
    }
  
    if (attachment) {
      acc[cv.id].attachments.push(attachment);
    }
  
    return acc;
  }, {});
  
  // TODO: Add types
  const tableData = Object.values(cvs).map((cv: any) => {
    return {
      id: cv.id,
      name: cv.name,
      email: cv.email,
      place: cv.place,
      position: cv.position,
      status: cv.status,
      attachments: cv.attachments.map((attachment: any) => {
        return {
          type: attachment.type,
          url: attachment.url,
          name: attachment.name,
        };
      }),
    };
  });

  return tableData;
}
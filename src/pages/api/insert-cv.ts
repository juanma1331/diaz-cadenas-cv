import type { APIRoute } from "astro";
import {db, CVS, ATTACHMENTS, } from "astro:db";
import {generateId} from "lucia"

export type UploadedFile = {
    name: string;
    url: string;
    key: string;
    size: number;
    type: string;
}

export type InsertCVParams = {
    name: string;
    email: string;
    place: string;
    position: string;
    attachments: UploadedFile[];
}

export const POST: APIRoute = async ({request}) => {

    const insertParams = await request.json() as InsertCVParams;

    // We should validate the insertParams here
   
    const queries = []
    const cvId = generateId(15)

    queries.push(db.insert(CVS).values({
        id: cvId,
        name: insertParams.name,
        email: insertParams.email,
        place: insertParams.place,
        position: insertParams.position
    }))

    for (const attachment of insertParams.attachments) {
        queries.push(db.insert(ATTACHMENTS).values({
            name: attachment.name,
            url: attachment.url,
            size: attachment.size,
            type: attachment.type,
            key: attachment.key,
            cvId: cvId
        }))
    }

    // @ts-ignore TODO: fix this
    await db.batch(queries)

    return new Response(null, {status: 200})
}
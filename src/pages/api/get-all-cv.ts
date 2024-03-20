import type { APIRoute } from "astro";
import {db, CVS, ATTACHMENTS, eq } from "astro:db";

const GET: APIRoute = async (req) => {
    const data = await db.select()
    .from(CVS)
    .innerJoin(ATTACHMENTS, eq(CVS.id, ATTACHMENTS.cvId))
    return new Response(null, {status: 200})
};
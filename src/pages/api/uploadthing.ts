import { createRouteHandler } from "uploadthing/server";

import { uploadRouter } from "../../server/uploadthing";
import type { APIContext, APIRoute } from "astro";

export async function GET({ request, locals }: APIContext) {
  const { env, ctx } = locals.runtime;

  const handlers = createRouteHandler({
    router: uploadRouter,
    config: {
      /**
       * Since workers doesn't have envs on `process`. We need to pass
       * secret and isDev flag manually.
       */
      uploadthingSecret: env.UPLOADTHING_SECRET,
      isDev: env.ENVIRONMENT === "development",
      /*
       * Cloudflare Workers doesn't support the cache option
       * so we need to remove it from the request init.
       */
      fetch: (url, init) => {
        if (init && "cache" in init) delete init.cache;
        return fetch(url, init);
      },
    },
  });

  if (request.method !== "GET") {
    return new Response("Method not allowed", { status: 405 });
  }

  return await handlers[request.method](request);
}

export async function POST({ request, locals }: APIContext) {
  const { env, ctx } = locals.runtime;

  const handlers = createRouteHandler({
    router: uploadRouter,
    config: {
      /**
       * Since workers doesn't have envs on `process`. We need to pass
       * secret and isDev flag manually.
       */
      uploadthingSecret: env.UPLOADTHING_SECRET,
      isDev: env.ENVIRONMENT === "development",
      /*
       * Cloudflare Workers doesn't support the cache option
       * so we need to remove it from the request init.
       */
      fetch: (url, init) => {
        if (init && "cache" in init) delete init.cache;
        return fetch(url, init);
      },
    },
  });

  if (request.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const response = await handlers[request.method](request);
  if ("cleanup" in response && response.cleanup) {
    /**
     * UploadThing dev server leaves some promises hanging around that we
     * need to wait for to prevent the worker from exiting prematurely.
     */
    ctx.waitUntil(response.cleanup);
  }
  return response;
}

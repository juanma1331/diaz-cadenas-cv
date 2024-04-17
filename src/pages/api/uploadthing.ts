import { uploadRouter } from "@/server/uploadthing";
import { createRouteHandler } from "uploadthing/server";

export const { GET, POST } = createRouteHandler({
  router: uploadRouter,
  config: {
    uploadthingSecret: import.meta.env.UPLOADTHING_SECRET,
  },
});

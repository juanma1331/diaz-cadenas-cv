globalThis.process ??= {}; globalThis.process.env ??= {};
import { t as createUploadthing, u as createRouteHandler } from './_trpc__GIzfMcGy.mjs';

const f = createUploadthing({
  /**
   * Log out more information about the error, but don't return it to the client
   * @see https://docs.uploadthing.com/errors#error-formatting
   */
  errorFormatter: (err) => {
    console.log("Error uploading file", err.message);
    console.log("  - Above error caused by:", err.cause);
    return { message: err.message };
  }
});
const uploadRouter = {
  pdfAndVideo: f({
    pdf: {
      maxFileSize: "4MB",
      maxFileCount: 4
    },
    video: {
      maxFileSize: "64MB",
      maxFileCount: 1
    }
  }).middleware(({ req }) => {
    return { foo: "bar" };
  }).onUploadComplete((data) => {
    return {
      url: data.file.url,
      key: data.file.key,
      name: data.file.name,
      size: data.file.size,
      type: data.file.type
    };
  })
};

const { GET, POST } = createRouteHandler({
  router: uploadRouter,
  config: {
    uploadthingSecret: "sk_live_41657a9ccbef098cf6fbd0e2bd8ee6171bcfa90d890a19945436aff2c7f4d6d0"
  }
});

export { GET, POST };

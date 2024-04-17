				import worker, * as OTHER_EXPORTS from "/Users/manuel/Desktop/juanma/diaz-cadenas-cvs/.wrangler/tmp/pages-LqK7iw/mtepxwk37p.js";
				import * as __MIDDLEWARE_0__ from "/Users/manuel/Desktop/juanma/diaz-cadenas-cvs/node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts";
import * as __MIDDLEWARE_1__ from "/Users/manuel/Desktop/juanma/diaz-cadenas-cvs/node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts";
				
				worker.middleware = [
					__MIDDLEWARE_0__.default,__MIDDLEWARE_1__.default,
					...(worker.middleware ?? []),
				].filter(Boolean);
				
				export * from "/Users/manuel/Desktop/juanma/diaz-cadenas-cvs/.wrangler/tmp/pages-LqK7iw/mtepxwk37p.js";
				export default worker;
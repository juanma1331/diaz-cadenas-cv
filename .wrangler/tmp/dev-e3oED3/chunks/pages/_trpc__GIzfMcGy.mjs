globalThis.process ??= {}; globalThis.process.env ??= {};
import { r as red, c as cyan } from '../astro_BO0wYrHs.mjs';

/**
 * @internal
 */ function invert(obj) {
    const newObj = Object.create(null);
    for(const key in obj){
        const v = obj[key];
        newObj[v] = key;
    }
    return newObj;
}

// reference: https://www.jsonrpc.org/specification
/**
 * JSON-RPC 2.0 Error codes
 *
 * `-32000` to `-32099` are reserved for implementation-defined server-errors.
 * For tRPC we're copying the last digits of HTTP 4XX errors.
 */ const TRPC_ERROR_CODES_BY_KEY = {
    /**
   * Invalid JSON was received by the server.
   * An error occurred on the server while parsing the JSON text.
   */ PARSE_ERROR: -32700,
    /**
   * The JSON sent is not a valid Request object.
   */ BAD_REQUEST: -32600,
    // Internal JSON-RPC error
    INTERNAL_SERVER_ERROR: -32603,
    NOT_IMPLEMENTED: -32603,
    // Implementation specific errors
    UNAUTHORIZED: -32001,
    FORBIDDEN: -32003,
    NOT_FOUND: -32004,
    METHOD_NOT_SUPPORTED: -32005,
    TIMEOUT: -32008,
    CONFLICT: -32009,
    PRECONDITION_FAILED: -32012,
    PAYLOAD_TOO_LARGE: -32013,
    UNPROCESSABLE_CONTENT: -32022,
    TOO_MANY_REQUESTS: -32029,
    CLIENT_CLOSED_REQUEST: -32099
};
invert(TRPC_ERROR_CODES_BY_KEY);

const TRPC_ERROR_CODES_BY_NUMBER = invert(TRPC_ERROR_CODES_BY_KEY);
const JSONRPC2_TO_HTTP_CODE = {
    PARSE_ERROR: 400,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    NOT_FOUND: 404,
    FORBIDDEN: 403,
    METHOD_NOT_SUPPORTED: 405,
    TIMEOUT: 408,
    CONFLICT: 409,
    PRECONDITION_FAILED: 412,
    PAYLOAD_TOO_LARGE: 413,
    UNPROCESSABLE_CONTENT: 422,
    TOO_MANY_REQUESTS: 429,
    CLIENT_CLOSED_REQUEST: 499,
    INTERNAL_SERVER_ERROR: 500,
    NOT_IMPLEMENTED: 501
};
function getStatusCodeFromKey(code) {
    return JSONRPC2_TO_HTTP_CODE[code] ?? 500;
}
function getHTTPStatusCode(json) {
    const arr = Array.isArray(json) ? json : [
        json
    ];
    const httpStatuses = new Set(arr.map((res)=>{
        if ('error' in res) {
            const data = res.error.data;
            if (typeof data.httpStatus === 'number') {
                return data.httpStatus;
            }
            const code = TRPC_ERROR_CODES_BY_NUMBER[res.error.code];
            return getStatusCodeFromKey(code);
        }
        return 200;
    }));
    if (httpStatuses.size !== 1) {
        return 207;
    }
    const httpStatus = httpStatuses.values().next().value;
    return httpStatus;
}
function getHTTPStatusCodeFromError(error) {
    return getStatusCodeFromKey(error.code);
}

const noop = ()=>{
// noop
};
function createInnerProxy(callback, path) {
    const proxy = new Proxy(noop, {
        get (_obj, key) {
            if (typeof key !== 'string' || key === 'then') {
                // special case for if the proxy is accidentally treated
                // like a PromiseLike (like in `Promise.resolve(proxy)`)
                return undefined;
            }
            return createInnerProxy(callback, [
                ...path,
                key
            ]);
        },
        apply (_1, _2, args) {
            const isApply = path[path.length - 1] === 'apply';
            return callback({
                args: isApply ? args.length >= 2 ? args[1] : [] : args,
                path: isApply ? path.slice(0, -1) : path
            });
        }
    });
    return proxy;
}
/**
 * Creates a proxy that calls the callback with the path and arguments
 *
 * @internal
 */ const createRecursiveProxy = (callback)=>createInnerProxy(callback, []);
/**
 * Used in place of `new Proxy` where each handler will map 1 level deep to another value.
 *
 * @internal
 */ const createFlatProxy = (callback)=>{
    return new Proxy(noop, {
        get (_obj, name) {
            if (typeof name !== 'string' || name === 'then') {
                // special case for if the proxy is accidentally treated
                // like a PromiseLike (like in `Promise.resolve(proxy)`)
                return undefined;
            }
            return callback(name);
        }
    });
};

/**
 * @internal
 */ function isObject$2(value) {
    // check that value is object
    return !!value && !Array.isArray(value) && typeof value === 'object';
}

class UnknownCauseError extends Error {
}
function getCauseFromUnknown(cause) {
    if (cause instanceof Error) {
        return cause;
    }
    const type = typeof cause;
    if (type === 'undefined' || type === 'function' || cause === null) {
        return undefined;
    }
    // Primitive types just get wrapped in an error
    if (type !== 'object') {
        return new Error(String(cause));
    }
    // If it's an object, we'll create a synthetic error
    if (isObject$2(cause)) {
        const err = new UnknownCauseError();
        for(const key in cause){
            err[key] = cause[key];
        }
        return err;
    }
    return undefined;
}

function getTRPCErrorFromUnknown(cause) {
    if (cause instanceof TRPCError) {
        return cause;
    }
    if (cause instanceof Error && cause.name === 'TRPCError') {
        // https://github.com/trpc/trpc/pull/4848
        return cause;
    }
    const trpcError = new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        cause
    });
    // Inherit stack from error
    if (cause instanceof Error && cause.stack) {
        trpcError.stack = cause.stack;
    }
    return trpcError;
}
class TRPCError extends Error {
    constructor(opts){
        const cause = getCauseFromUnknown(opts.cause);
        const message = opts.message ?? cause?.message ?? opts.code;
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore https://github.com/tc39/proposal-error-cause
        super(message, {
            cause
        });
        this.code = opts.code;
        this.name = 'TRPCError';
        if (!this.cause) {
            // < ES2022 / < Node 16.9.0 compatability
            this.cause = cause;
        }
    }
}

/**
 * @public
 */ /**
 * @internal
 */ function getDataTransformer(transformer) {
    if ('input' in transformer) {
        return transformer;
    }
    return {
        input: transformer,
        output: transformer
    };
}
/**
 * @internal
 */ const defaultTransformer = {
    _default: true,
    input: {
        serialize: (obj)=>obj,
        deserialize: (obj)=>obj
    },
    output: {
        serialize: (obj)=>obj,
        deserialize: (obj)=>obj
    }
};

const defaultFormatter = ({ shape  })=>{
    return shape;
};

/**
 * Create an object without inheriting anything from `Object.prototype`
 * @internal
 */ function omitPrototype(obj) {
    return Object.assign(Object.create(null), obj);
}

const procedureTypes = [
    'query',
    'mutation',
    'subscription'
];

function isRouter(procedureOrRouter) {
    return 'router' in procedureOrRouter._def;
}
const emptyRouter = {
    _ctx: null,
    _errorShape: null,
    _meta: null,
    queries: {},
    mutations: {},
    subscriptions: {},
    errorFormatter: defaultFormatter,
    transformer: defaultTransformer
};
/**
 * Reserved words that can't be used as router or procedure names
 */ const reservedWords = [
    /**
   * Then is a reserved word because otherwise we can't return a promise that returns a Proxy
   * since JS will think that `.then` is something that exists
   */ 'then'
];
/**
 * @internal
 */ function createRouterFactory(config) {
    return function createRouterInner(procedures) {
        const reservedWordsUsed = new Set(Object.keys(procedures).filter((v)=>reservedWords.includes(v)));
        if (reservedWordsUsed.size > 0) {
            throw new Error('Reserved words used in `router({})` call: ' + Array.from(reservedWordsUsed).join(', '));
        }
        const routerProcedures = omitPrototype({});
        function recursiveGetPaths(procedures, path = '') {
            for (const [key, procedureOrRouter] of Object.entries(procedures ?? {})){
                const newPath = `${path}${key}`;
                if (isRouter(procedureOrRouter)) {
                    recursiveGetPaths(procedureOrRouter._def.procedures, `${newPath}.`);
                    continue;
                }
                if (routerProcedures[newPath]) {
                    throw new Error(`Duplicate key: ${newPath}`);
                }
                routerProcedures[newPath] = procedureOrRouter;
            }
        }
        recursiveGetPaths(procedures);
        const _def = {
            _config: config,
            router: true,
            procedures: routerProcedures,
            ...emptyRouter,
            record: procedures,
            queries: Object.entries(routerProcedures).filter((pair)=>pair[1]._def.query).reduce((acc, [key, val])=>({
                    ...acc,
                    [key]: val
                }), {}),
            mutations: Object.entries(routerProcedures).filter((pair)=>pair[1]._def.mutation).reduce((acc, [key, val])=>({
                    ...acc,
                    [key]: val
                }), {}),
            subscriptions: Object.entries(routerProcedures).filter((pair)=>pair[1]._def.subscription).reduce((acc, [key, val])=>({
                    ...acc,
                    [key]: val
                }), {})
        };
        const router = {
            ...procedures,
            _def,
            createCaller (ctx) {
                return createCallerFactory()(router)(ctx);
            },
            getErrorShape (opts) {
                const { path , error  } = opts;
                const { code  } = opts.error;
                const shape = {
                    message: error.message,
                    code: TRPC_ERROR_CODES_BY_KEY[code],
                    data: {
                        code,
                        httpStatus: getHTTPStatusCodeFromError(error)
                    }
                };
                if (config.isDev && typeof opts.error.stack === 'string') {
                    shape.data.stack = opts.error.stack;
                }
                if (typeof path === 'string') {
                    shape.data.path = path;
                }
                return this._def._config.errorFormatter({
                    ...opts,
                    shape
                });
            }
        };
        return router;
    };
}
/**
 * @internal
 */ function callProcedure(opts) {
    const { type , path  } = opts;
    if (!(path in opts.procedures) || !opts.procedures[path]?._def[type]) {
        throw new TRPCError({
            code: 'NOT_FOUND',
            message: `No "${type}"-procedure on path "${path}"`
        });
    }
    const procedure = opts.procedures[path];
    return procedure(opts);
}
function createCallerFactory() {
    return function createCallerInner(router) {
        const def = router._def;
        return function createCaller(ctx) {
            const proxy = createRecursiveProxy(({ path , args  })=>{
                // interop mode
                if (path.length === 1 && procedureTypes.includes(path[0])) {
                    return callProcedure({
                        procedures: def.procedures,
                        path: args[0],
                        rawInput: args[1],
                        ctx,
                        type: path[0]
                    });
                }
                const fullPath = path.join('.');
                const procedure = def.procedures[fullPath];
                let type = 'query';
                if (procedure._def.mutation) {
                    type = 'mutation';
                } else if (procedure._def.subscription) {
                    type = 'subscription';
                }
                return procedure({
                    path: fullPath,
                    rawInput: args[0],
                    ctx,
                    type
                });
            });
            return proxy;
        };
    };
}

/**
 * The default check to see if we're in a server
 */ const isServerDefault = typeof window === 'undefined' || 'Deno' in window || globalThis.process?.env?.NODE_ENV === 'test' || !!globalThis.process?.env?.JEST_WORKER_ID || !!globalThis.process?.env?.VITEST_WORKER_ID;

/**
 * @internal
 */ function getErrorShape(opts) {
    const { path , error , config  } = opts;
    const { code  } = opts.error;
    const shape = {
        message: error.message,
        code: TRPC_ERROR_CODES_BY_KEY[code],
        data: {
            code,
            httpStatus: getHTTPStatusCodeFromError(error)
        }
    };
    if (config.isDev && typeof opts.error.stack === 'string') {
        shape.data.stack = opts.error.stack;
    }
    if (typeof path === 'string') {
        shape.data.path = path;
    }
    return config.errorFormatter({
        ...opts,
        shape
    });
}

function transformTRPCResponseItem(config, item) {
    if ('error' in item) {
        return {
            ...item,
            error: config.transformer.output.serialize(item.error)
        };
    }
    if ('data' in item.result) {
        return {
            ...item,
            result: {
                ...item.result,
                data: config.transformer.output.serialize(item.result.data)
            }
        };
    }
    return item;
}
/**
 * Takes a unserialized `TRPCResponse` and serializes it with the router's transformers
 **/ function transformTRPCResponse(config, itemOrItems) {
    return Array.isArray(itemOrItems) ? itemOrItems.map((item)=>transformTRPCResponseItem(config, item)) : transformTRPCResponseItem(config, itemOrItems);
}

function getRawProcedureInputOrThrow(opts) {
    const { req  } = opts;
    try {
        if (req.method === 'GET') {
            if (!req.query.has('input')) {
                return undefined;
            }
            const raw = req.query.get('input');
            return JSON.parse(raw);
        }
        if (!opts.preprocessedBody && typeof req.body === 'string') {
            // A mutation with no inputs will have req.body === ''
            return req.body.length === 0 ? undefined : JSON.parse(req.body);
        }
        return req.body;
    } catch (cause) {
        throw new TRPCError({
            code: 'PARSE_ERROR',
            cause
        });
    }
}
const deserializeInputValue = (rawValue, transformer)=>{
    return typeof rawValue !== 'undefined' ? transformer.input.deserialize(rawValue) : rawValue;
};
const getJsonContentTypeInputs = (opts)=>{
    const rawInput = getRawProcedureInputOrThrow(opts);
    const transformer = opts.router._def._config.transformer;
    if (!opts.isBatchCall) {
        return {
            0: deserializeInputValue(rawInput, transformer)
        };
    }
    /* istanbul ignore if  */ if (rawInput == null || typeof rawInput !== 'object' || Array.isArray(rawInput)) {
        throw new TRPCError({
            code: 'BAD_REQUEST',
            message: '"input" needs to be an object when doing a batch call'
        });
    }
    const input = {};
    for(const key in rawInput){
        const k = key;
        const rawValue = rawInput[k];
        const value = deserializeInputValue(rawValue, transformer);
        input[k] = value;
    }
    return input;
};

const HTTP_METHOD_PROCEDURE_TYPE_MAP = {
    GET: 'query',
    POST: 'mutation'
};
const fallbackContentTypeHandler = {
    getInputs: getJsonContentTypeInputs
};
function initResponse(initOpts) {
    const { ctx , paths , type , responseMeta , untransformedJSON , errors =[] ,  } = initOpts;
    let status = untransformedJSON ? getHTTPStatusCode(untransformedJSON) : 200;
    const headers = {
        'Content-Type': 'application/json'
    };
    const eagerGeneration = !untransformedJSON;
    const data = eagerGeneration ? [] : Array.isArray(untransformedJSON) ? untransformedJSON : [
        untransformedJSON
    ];
    const meta = responseMeta?.({
        ctx,
        paths,
        type,
        data,
        errors,
        eagerGeneration
    }) ?? {};
    for (const [key, value] of Object.entries(meta.headers ?? {})){
        headers[key] = value;
    }
    if (meta.status) {
        status = meta.status;
    }
    return {
        status,
        headers
    };
}
async function inputToProcedureCall(procedureOpts) {
    const { opts , ctx , type , input , path  } = procedureOpts;
    try {
        const data = await callProcedure({
            procedures: opts.router._def.procedures,
            path,
            rawInput: input,
            ctx,
            type
        });
        return {
            result: {
                data
            }
        };
    } catch (cause) {
        const error = getTRPCErrorFromUnknown(cause);
        opts.onError?.({
            error,
            path,
            input,
            ctx,
            type: type,
            req: opts.req
        });
        return {
            error: getErrorShape({
                config: opts.router._def._config,
                error,
                type,
                path,
                input,
                ctx
            })
        };
    }
}
function caughtErrorToData(cause, errorOpts) {
    const { router , req , onError  } = errorOpts.opts;
    const error = getTRPCErrorFromUnknown(cause);
    onError?.({
        error,
        path: errorOpts.path,
        input: errorOpts.input,
        ctx: errorOpts.ctx,
        type: errorOpts.type,
        req
    });
    const untransformedJSON = {
        error: getErrorShape({
            config: router._def._config,
            error,
            type: errorOpts.type,
            path: errorOpts.path,
            input: errorOpts.input,
            ctx: errorOpts.ctx
        })
    };
    const transformedJSON = transformTRPCResponse(router._def._config, untransformedJSON);
    const body = JSON.stringify(transformedJSON);
    return {
        error,
        untransformedJSON,
        body
    };
}
// implementation
async function resolveHTTPResponse(opts) {
    const { router , req , unstable_onHead , unstable_onChunk  } = opts;
    if (req.method === 'HEAD') {
        // can be used for lambda warmup
        const headResponse = {
            status: 204
        };
        unstable_onHead?.(headResponse, false);
        unstable_onChunk?.([
            -1,
            ''
        ]);
        return headResponse;
    }
    const contentTypeHandler = opts.contentTypeHandler ?? fallbackContentTypeHandler;
    const batchingEnabled = opts.batching?.enabled ?? true;
    const type = HTTP_METHOD_PROCEDURE_TYPE_MAP[req.method] ?? 'unknown';
    let ctx = undefined;
    let paths;
    const isBatchCall = !!req.query.get('batch');
    const isStreamCall = isBatchCall && unstable_onHead && unstable_onChunk && req.headers['trpc-batch-mode'] === 'stream';
    try {
        // we create context first so that (unless `createContext()` throws)
        // error handler may access context information
        //
        // this way even if the client sends malformed input that might cause an exception:
        //  - `opts.error` has value,
        //  - batching is not enabled,
        //  - `type` is unknown,
        //  - `getInputs` throws because of malformed JSON,
        // context value is still available to the error handler
        ctx = await opts.createContext();
        if (opts.error) {
            throw opts.error;
        }
        if (isBatchCall && !batchingEnabled) {
            throw new Error(`Batching is not enabled on the server`);
        }
        /* istanbul ignore if -- @preserve */ if (type === 'subscription') {
            throw new TRPCError({
                message: 'Subscriptions should use wsLink',
                code: 'METHOD_NOT_SUPPORTED'
            });
        }
        if (type === 'unknown') {
            throw new TRPCError({
                message: `Unexpected request method ${req.method}`,
                code: 'METHOD_NOT_SUPPORTED'
            });
        }
        const inputs = await contentTypeHandler.getInputs({
            isBatchCall,
            req,
            router,
            preprocessedBody: opts.preprocessedBody ?? false
        });
        paths = isBatchCall ? decodeURIComponent(opts.path).split(',') : [
            opts.path
        ];
        const promises = paths.map((path, index)=>inputToProcedureCall({
                opts,
                ctx,
                type,
                input: inputs[index],
                path
            }));
        if (!isStreamCall) {
            /**
       * Non-streaming response:
       * - await all responses in parallel, blocking on the slowest one
       * - create headers with known response body
       * - return a complete HTTPResponse
       */ const untransformedJSON = await Promise.all(promises);
            const errors = untransformedJSON.flatMap((response)=>'error' in response ? [
                    response.error
                ] : []);
            const headResponse1 = initResponse({
                ctx,
                paths,
                type,
                responseMeta: opts.responseMeta,
                untransformedJSON,
                errors
            });
            unstable_onHead?.(headResponse1, false);
            // return body stuff
            const result = isBatchCall ? untransformedJSON : untransformedJSON[0]; // eslint-disable-line @typescript-eslint/no-non-null-assertion -- `untransformedJSON` should be the length of `paths` which should be at least 1 otherwise there wouldn't be a request at all
            const transformedJSON = transformTRPCResponse(router._def._config, result);
            const body = JSON.stringify(transformedJSON);
            unstable_onChunk?.([
                -1,
                body
            ]);
            return {
                status: headResponse1.status,
                headers: headResponse1.headers,
                body
            };
        }
        /**
     * Streaming response:
     * - block on none, call `onChunk` as soon as each response is ready
     * - create headers with minimal data (cannot know the response body in advance)
     * - return void
     */ const headResponse2 = initResponse({
            ctx,
            paths,
            type,
            responseMeta: opts.responseMeta
        });
        unstable_onHead(headResponse2, true);
        const indexedPromises = new Map(promises.map((promise, index)=>[
                index,
                promise.then((r)=>[
                        index,
                        r
                    ])
            ]));
        for (const _ of paths){
            const [index, untransformedJSON1] = await Promise.race(indexedPromises.values());
            indexedPromises.delete(index);
            try {
                const transformedJSON1 = transformTRPCResponse(router._def._config, untransformedJSON1);
                const body1 = JSON.stringify(transformedJSON1);
                unstable_onChunk([
                    index,
                    body1
                ]);
            } catch (cause) {
                const path = paths[index];
                const input = inputs[index];
                const { body: body2  } = caughtErrorToData(cause, {
                    opts,
                    ctx,
                    type,
                    path,
                    input
                });
                unstable_onChunk([
                    index,
                    body2
                ]);
            }
        }
        return;
    } catch (cause1) {
        // we get here if
        // - batching is called when it's not enabled
        // - `createContext()` throws
        // - `router._def._config.transformer.output.serialize()` throws
        // - post body is too large
        // - input deserialization fails
        // - `errorFormatter` return value is malformed
        const { error , untransformedJSON: untransformedJSON2 , body: body3  } = caughtErrorToData(cause1, {
            opts,
            ctx,
            type
        });
        const headResponse3 = initResponse({
            ctx,
            paths,
            type,
            responseMeta: opts.responseMeta,
            untransformedJSON: untransformedJSON2,
            errors: [
                error
            ]
        });
        unstable_onHead?.(headResponse3, false);
        unstable_onChunk?.([
            -1,
            body3
        ]);
        return {
            status: headResponse3.status,
            headers: headResponse3.headers,
            body: body3
        };
    }
}

/**
 * Format a batch response as a line-delimited JSON stream
 * that the `unstable_httpBatchStreamLink` can parse:
 *
 * @example
 * ```ts
 * const formatter = getBatchStreamFormatter();
 * res.send(formatter(1, 'response #2'));
 * res.send(formatter(0, 'response #1'));
 * res.send(formatter.end());
 * ```
 *
 * Expected format:
 * ```json
 * {"1":"response #2"
 * ,"0":"response #1"
 * }
 * ```
 */ function getBatchStreamFormatter() {
    let first = true;
    function format(index, string) {
        const prefix = first ? '{' : ',';
        first = false;
        return `${prefix}"${index}":${string}\n`;
    }
    format.end = ()=>'}';
    return format;
}

function toURL(urlOrPathname) {
    const url = urlOrPathname.startsWith('/') ? `http://127.0.0.1${urlOrPathname}` : urlOrPathname;
    return new URL(url);
}

const trimSlashes = (path)=>{
    path = path.startsWith('/') ? path.slice(1) : path;
    path = path.endsWith('/') ? path.slice(0, -1) : path;
    return path;
};
async function fetchRequestHandler(opts) {
    const resHeaders = new Headers();
    const createContext = async ()=>{
        return opts.createContext?.({
            req: opts.req,
            resHeaders
        });
    };
    const url = toURL(opts.req.url);
    const pathname = trimSlashes(url.pathname);
    const endpoint = trimSlashes(opts.endpoint);
    const path = trimSlashes(pathname.slice(endpoint.length));
    const req = {
        query: url.searchParams,
        method: opts.req.method,
        headers: Object.fromEntries(opts.req.headers),
        body: opts.req.headers.get('content-type')?.startsWith('application/json') ? await opts.req.text() : ''
    };
    let resolve;
    const promise = new Promise((r)=>resolve = r);
    let status = 200;
    let isStream = false;
    let controller;
    let encoder;
    let formatter;
    const unstable_onHead = (head, isStreaming)=>{
        for (const [key, value] of Object.entries(head.headers ?? {})){
            /* istanbul ignore if -- @preserve */ if (typeof value === 'undefined') {
                continue;
            }
            if (typeof value === 'string') {
                resHeaders.set(key, value);
                continue;
            }
            for (const v of value){
                resHeaders.append(key, v);
            }
        }
        status = head.status;
        if (isStreaming) {
            resHeaders.set('Transfer-Encoding', 'chunked');
            resHeaders.append('Vary', 'trpc-batch-mode');
            const stream = new ReadableStream({
                start (c) {
                    controller = c;
                }
            });
            const response = new Response(stream, {
                status,
                headers: resHeaders
            });
            resolve(response);
            encoder = new TextEncoder();
            formatter = getBatchStreamFormatter();
            isStream = true;
        }
    };
    const unstable_onChunk = ([index, string])=>{
        if (index === -1) {
            // full response, no streaming
            const response = new Response(string || null, {
                status,
                headers: resHeaders
            });
            resolve(response);
        } else {
            controller.enqueue(encoder.encode(formatter(index, string)));
        }
    };
    resolveHTTPResponse({
        req,
        createContext,
        path,
        router: opts.router,
        batching: opts.batching,
        responseMeta: opts.responseMeta,
        onError (o) {
            opts?.onError?.({
                ...o,
                req: opts.req
            });
        },
        unstable_onHead,
        unstable_onChunk
    }).then(()=>{
        if (isStream) {
            controller.enqueue(encoder.encode(formatter.end()));
            controller.close();
        }
    }).catch(()=>{
        if (isStream) {
            controller.close();
        }
    });
    return promise;
}

const entityKind = Symbol.for("drizzle:entityKind");
function is(value, type) {
  if (!value || typeof value !== "object") {
    return false;
  }
  if (value instanceof type) {
    return true;
  }
  if (!Object.prototype.hasOwnProperty.call(type, entityKind)) {
    throw new Error(
      `Class "${type.name ?? "<unknown>"}" doesn't look like a Drizzle entity. If this is incorrect and the class is provided by Drizzle, please report this as a bug.`
    );
  }
  let cls = value.constructor;
  if (cls) {
    while (cls) {
      if (entityKind in cls && cls[entityKind] === type[entityKind]) {
        return true;
      }
      cls = Object.getPrototypeOf(cls);
    }
  }
  return false;
}

class Column {
  constructor(table, config) {
    this.table = table;
    this.config = config;
    this.name = config.name;
    this.notNull = config.notNull;
    this.default = config.default;
    this.defaultFn = config.defaultFn;
    this.hasDefault = config.hasDefault;
    this.primary = config.primaryKey;
    this.isUnique = config.isUnique;
    this.uniqueName = config.uniqueName;
    this.uniqueType = config.uniqueType;
    this.dataType = config.dataType;
    this.columnType = config.columnType;
  }
  static [entityKind] = "Column";
  name;
  primary;
  notNull;
  default;
  defaultFn;
  hasDefault;
  isUnique;
  uniqueName;
  uniqueType;
  dataType;
  columnType;
  enumValues = void 0;
  config;
  mapFromDriverValue(value) {
    return value;
  }
  mapToDriverValue(value) {
    return value;
  }
}

const SubqueryConfig = Symbol.for("drizzle:SubqueryConfig");
class Subquery {
  static [entityKind] = "Subquery";
  /** @internal */
  [SubqueryConfig];
  constructor(sql, selection, alias, isWith = false) {
    this[SubqueryConfig] = {
      sql,
      selection,
      alias,
      isWith
    };
  }
  // getSQL(): SQL<unknown> {
  // 	return new SQL([this]);
  // }
}
class WithSubquery extends Subquery {
  static [entityKind] = "WithSubquery";
}

const tracer = {
  startActiveSpan(name, fn) {
    {
      return fn();
    }
  }
};

const ViewBaseConfig = Symbol.for("drizzle:ViewBaseConfig");

const TableName = Symbol.for("drizzle:Name");
const Schema = Symbol.for("drizzle:Schema");
const Columns = Symbol.for("drizzle:Columns");
const OriginalName = Symbol.for("drizzle:OriginalName");
const BaseName = Symbol.for("drizzle:BaseName");
const IsAlias = Symbol.for("drizzle:IsAlias");
const ExtraConfigBuilder = Symbol.for("drizzle:ExtraConfigBuilder");
const IsDrizzleTable = Symbol.for("drizzle:IsDrizzleTable");
class Table {
  static [entityKind] = "Table";
  /** @internal */
  static Symbol = {
    Name: TableName,
    Schema,
    OriginalName,
    Columns,
    BaseName,
    IsAlias,
    ExtraConfigBuilder
  };
  /**
   * @internal
   * Can be changed if the table is aliased.
   */
  [TableName];
  /**
   * @internal
   * Used to store the original name of the table, before any aliasing.
   */
  [OriginalName];
  /** @internal */
  [Schema];
  /** @internal */
  [Columns];
  /**
   *  @internal
   * Used to store the table name before the transformation via the `tableCreator` functions.
   */
  [BaseName];
  /** @internal */
  [IsAlias] = false;
  /** @internal */
  [ExtraConfigBuilder] = void 0;
  [IsDrizzleTable] = true;
  constructor(name, schema, baseName) {
    this[TableName] = this[OriginalName] = name;
    this[Schema] = schema;
    this[BaseName] = baseName;
  }
}
function isTable(table) {
  return typeof table === "object" && table !== null && IsDrizzleTable in table;
}
function getTableName(table) {
  return table[TableName];
}

function isSQLWrapper(value) {
  return typeof value === "object" && value !== null && "getSQL" in value && typeof value.getSQL === "function";
}
function mergeQueries(queries) {
  const result = { sql: "", params: [] };
  for (const query of queries) {
    result.sql += query.sql;
    result.params.push(...query.params);
    if (query.typings?.length) {
      if (!result.typings) {
        result.typings = [];
      }
      result.typings.push(...query.typings);
    }
  }
  return result;
}
class StringChunk {
  static [entityKind] = "StringChunk";
  value;
  constructor(value) {
    this.value = Array.isArray(value) ? value : [value];
  }
  getSQL() {
    return new SQL([this]);
  }
}
class SQL {
  constructor(queryChunks) {
    this.queryChunks = queryChunks;
  }
  static [entityKind] = "SQL";
  /** @internal */
  decoder = noopDecoder;
  shouldInlineParams = false;
  append(query) {
    this.queryChunks.push(...query.queryChunks);
    return this;
  }
  toQuery(config) {
    return tracer.startActiveSpan("drizzle.buildSQL", (span) => {
      const query = this.buildQueryFromSourceParams(this.queryChunks, config);
      span?.setAttributes({
        "drizzle.query.text": query.sql,
        "drizzle.query.params": JSON.stringify(query.params)
      });
      return query;
    });
  }
  buildQueryFromSourceParams(chunks, _config) {
    const config = Object.assign({}, _config, {
      inlineParams: _config.inlineParams || this.shouldInlineParams,
      paramStartIndex: _config.paramStartIndex || { value: 0 }
    });
    const {
      escapeName,
      escapeParam,
      prepareTyping,
      inlineParams,
      paramStartIndex
    } = config;
    return mergeQueries(chunks.map((chunk) => {
      if (is(chunk, StringChunk)) {
        return { sql: chunk.value.join(""), params: [] };
      }
      if (is(chunk, Name)) {
        return { sql: escapeName(chunk.value), params: [] };
      }
      if (chunk === void 0) {
        return { sql: "", params: [] };
      }
      if (Array.isArray(chunk)) {
        const result = [new StringChunk("(")];
        for (const [i, p] of chunk.entries()) {
          result.push(p);
          if (i < chunk.length - 1) {
            result.push(new StringChunk(", "));
          }
        }
        result.push(new StringChunk(")"));
        return this.buildQueryFromSourceParams(result, config);
      }
      if (is(chunk, SQL)) {
        return this.buildQueryFromSourceParams(chunk.queryChunks, {
          ...config,
          inlineParams: inlineParams || chunk.shouldInlineParams
        });
      }
      if (is(chunk, Table)) {
        const schemaName = chunk[Table.Symbol.Schema];
        const tableName = chunk[Table.Symbol.Name];
        return {
          sql: schemaName === void 0 ? escapeName(tableName) : escapeName(schemaName) + "." + escapeName(tableName),
          params: []
        };
      }
      if (is(chunk, Column)) {
        return { sql: escapeName(chunk.table[Table.Symbol.Name]) + "." + escapeName(chunk.name), params: [] };
      }
      if (is(chunk, View)) {
        const schemaName = chunk[ViewBaseConfig].schema;
        const viewName = chunk[ViewBaseConfig].name;
        return {
          sql: schemaName === void 0 ? escapeName(viewName) : escapeName(schemaName) + "." + escapeName(viewName),
          params: []
        };
      }
      if (is(chunk, Param)) {
        const mappedValue = chunk.value === null ? null : chunk.encoder.mapToDriverValue(chunk.value);
        if (is(mappedValue, SQL)) {
          return this.buildQueryFromSourceParams([mappedValue], config);
        }
        if (inlineParams) {
          return { sql: this.mapInlineParam(mappedValue, config), params: [] };
        }
        let typings;
        if (prepareTyping !== void 0) {
          typings = [prepareTyping(chunk.encoder)];
        }
        return { sql: escapeParam(paramStartIndex.value++, mappedValue), params: [mappedValue], typings };
      }
      if (is(chunk, Placeholder)) {
        return { sql: escapeParam(paramStartIndex.value++, chunk), params: [chunk] };
      }
      if (is(chunk, SQL.Aliased) && chunk.fieldAlias !== void 0) {
        return { sql: escapeName(chunk.fieldAlias), params: [] };
      }
      if (is(chunk, Subquery)) {
        if (chunk[SubqueryConfig].isWith) {
          return { sql: escapeName(chunk[SubqueryConfig].alias), params: [] };
        }
        return this.buildQueryFromSourceParams([
          new StringChunk("("),
          chunk[SubqueryConfig].sql,
          new StringChunk(") "),
          new Name(chunk[SubqueryConfig].alias)
        ], config);
      }
      if (isSQLWrapper(chunk)) {
        return this.buildQueryFromSourceParams([
          new StringChunk("("),
          chunk.getSQL(),
          new StringChunk(")")
        ], config);
      }
      if (inlineParams) {
        return { sql: this.mapInlineParam(chunk, config), params: [] };
      }
      return { sql: escapeParam(paramStartIndex.value++, chunk), params: [chunk] };
    }));
  }
  mapInlineParam(chunk, { escapeString }) {
    if (chunk === null) {
      return "null";
    }
    if (typeof chunk === "number" || typeof chunk === "boolean") {
      return chunk.toString();
    }
    if (typeof chunk === "string") {
      return escapeString(chunk);
    }
    if (typeof chunk === "object") {
      const mappedValueAsString = chunk.toString();
      if (mappedValueAsString === "[object Object]") {
        return escapeString(JSON.stringify(chunk));
      }
      return escapeString(mappedValueAsString);
    }
    throw new Error("Unexpected param value: " + chunk);
  }
  getSQL() {
    return this;
  }
  as(alias) {
    if (alias === void 0) {
      return this;
    }
    return new SQL.Aliased(this, alias);
  }
  mapWith(decoder) {
    this.decoder = typeof decoder === "function" ? { mapFromDriverValue: decoder } : decoder;
    return this;
  }
  inlineParams() {
    this.shouldInlineParams = true;
    return this;
  }
}
class Name {
  constructor(value) {
    this.value = value;
  }
  static [entityKind] = "Name";
  brand;
  getSQL() {
    return new SQL([this]);
  }
}
function isDriverValueEncoder(value) {
  return typeof value === "object" && value !== null && "mapToDriverValue" in value && typeof value.mapToDriverValue === "function";
}
const noopDecoder = {
  mapFromDriverValue: (value) => value
};
const noopEncoder = {
  mapToDriverValue: (value) => value
};
({
  ...noopDecoder,
  ...noopEncoder
});
class Param {
  /**
   * @param value - Parameter value
   * @param encoder - Encoder to convert the value to a driver parameter
   */
  constructor(value, encoder = noopEncoder) {
    this.value = value;
    this.encoder = encoder;
  }
  static [entityKind] = "Param";
  brand;
  getSQL() {
    return new SQL([this]);
  }
}
function sql(strings, ...params) {
  const queryChunks = [];
  if (params.length > 0 || strings.length > 0 && strings[0] !== "") {
    queryChunks.push(new StringChunk(strings[0]));
  }
  for (const [paramIndex, param2] of params.entries()) {
    queryChunks.push(param2, new StringChunk(strings[paramIndex + 1]));
  }
  return new SQL(queryChunks);
}
((sql2) => {
  function empty() {
    return new SQL([]);
  }
  sql2.empty = empty;
  function fromList(list) {
    return new SQL(list);
  }
  sql2.fromList = fromList;
  function raw(str) {
    return new SQL([new StringChunk(str)]);
  }
  sql2.raw = raw;
  function join(chunks, separator) {
    const result = [];
    for (const [i, chunk] of chunks.entries()) {
      if (i > 0 && separator !== void 0) {
        result.push(separator);
      }
      result.push(chunk);
    }
    return new SQL(result);
  }
  sql2.join = join;
  function identifier(value) {
    return new Name(value);
  }
  sql2.identifier = identifier;
  function placeholder2(name2) {
    return new Placeholder(name2);
  }
  sql2.placeholder = placeholder2;
  function param2(value, encoder) {
    return new Param(value, encoder);
  }
  sql2.param = param2;
})(sql || (sql = {}));
((SQL2) => {
  class Aliased {
    constructor(sql2, fieldAlias) {
      this.sql = sql2;
      this.fieldAlias = fieldAlias;
    }
    static [entityKind] = "SQL.Aliased";
    /** @internal */
    isSelectionField = false;
    getSQL() {
      return this.sql;
    }
    /** @internal */
    clone() {
      return new Aliased(this.sql, this.fieldAlias);
    }
  }
  SQL2.Aliased = Aliased;
})(SQL || (SQL = {}));
class Placeholder {
  constructor(name2) {
    this.name = name2;
  }
  static [entityKind] = "Placeholder";
  getSQL() {
    return new SQL([this]);
  }
}
function fillPlaceholders(params, values) {
  return params.map((p) => {
    if (is(p, Placeholder)) {
      if (!(p.name in values)) {
        throw new Error(`No value for placeholder "${p.name}" was provided`);
      }
      return values[p.name];
    }
    return p;
  });
}
class View {
  static [entityKind] = "View";
  /** @internal */
  [ViewBaseConfig];
  constructor({ name: name2, schema, selectedFields, query }) {
    this[ViewBaseConfig] = {
      name: name2,
      originalName: name2,
      schema,
      selectedFields,
      query,
      isExisting: !query,
      isAlias: false
    };
  }
  getSQL() {
    return new SQL([this]);
  }
}
Column.prototype.getSQL = function() {
  return new SQL([this]);
};
Table.prototype.getSQL = function() {
  return new SQL([this]);
};
Subquery.prototype.getSQL = function() {
  return new SQL([this]);
};

class ColumnAliasProxyHandler {
  constructor(table) {
    this.table = table;
  }
  static [entityKind] = "ColumnAliasProxyHandler";
  get(columnObj, prop) {
    if (prop === "table") {
      return this.table;
    }
    return columnObj[prop];
  }
}
class TableAliasProxyHandler {
  constructor(alias, replaceOriginalName) {
    this.alias = alias;
    this.replaceOriginalName = replaceOriginalName;
  }
  static [entityKind] = "TableAliasProxyHandler";
  get(target, prop) {
    if (prop === Table.Symbol.IsAlias) {
      return true;
    }
    if (prop === Table.Symbol.Name) {
      return this.alias;
    }
    if (this.replaceOriginalName && prop === Table.Symbol.OriginalName) {
      return this.alias;
    }
    if (prop === ViewBaseConfig) {
      return {
        ...target[ViewBaseConfig],
        name: this.alias,
        isAlias: true
      };
    }
    if (prop === Table.Symbol.Columns) {
      const columns = target[Table.Symbol.Columns];
      if (!columns) {
        return columns;
      }
      const proxiedColumns = {};
      Object.keys(columns).map((key) => {
        proxiedColumns[key] = new Proxy(
          columns[key],
          new ColumnAliasProxyHandler(new Proxy(target, this))
        );
      });
      return proxiedColumns;
    }
    const value = target[prop];
    if (is(value, Column)) {
      return new Proxy(value, new ColumnAliasProxyHandler(new Proxy(target, this)));
    }
    return value;
  }
}
function aliasedTable(table, tableAlias) {
  return new Proxy(table, new TableAliasProxyHandler(tableAlias, false));
}
function aliasedTableColumn(column, tableAlias) {
  return new Proxy(
    column,
    new ColumnAliasProxyHandler(new Proxy(column.table, new TableAliasProxyHandler(tableAlias, false)))
  );
}
function mapColumnsInAliasedSQLToAlias(query, alias) {
  return new SQL.Aliased(mapColumnsInSQLToAlias(query.sql, alias), query.fieldAlias);
}
function mapColumnsInSQLToAlias(query, alias) {
  return sql.join(query.queryChunks.map((c) => {
    if (is(c, Column)) {
      return aliasedTableColumn(c, alias);
    }
    if (is(c, SQL)) {
      return mapColumnsInSQLToAlias(c, alias);
    }
    if (is(c, SQL.Aliased)) {
      return mapColumnsInAliasedSQLToAlias(c, alias);
    }
    return c;
  }));
}

class ColumnBuilder {
  static [entityKind] = "ColumnBuilder";
  config;
  constructor(name, dataType, columnType) {
    this.config = {
      name,
      notNull: false,
      default: void 0,
      hasDefault: false,
      primaryKey: false,
      isUnique: false,
      uniqueName: void 0,
      uniqueType: void 0,
      dataType,
      columnType
    };
  }
  /**
   * Changes the data type of the column. Commonly used with `json` columns. Also, useful for branded types.
   *
   * @example
   * ```ts
   * const users = pgTable('users', {
   * 	id: integer('id').$type<UserId>().primaryKey(),
   * 	details: json('details').$type<UserDetails>().notNull(),
   * });
   * ```
   */
  $type() {
    return this;
  }
  /**
   * Adds a `not null` clause to the column definition.
   *
   * Affects the `select` model of the table - columns *without* `not null` will be nullable on select.
   */
  notNull() {
    this.config.notNull = true;
    return this;
  }
  /**
   * Adds a `default <value>` clause to the column definition.
   *
   * Affects the `insert` model of the table - columns *with* `default` are optional on insert.
   *
   * If you need to set a dynamic default value, use {@link $defaultFn} instead.
   */
  default(value) {
    this.config.default = value;
    this.config.hasDefault = true;
    return this;
  }
  /**
   * Adds a dynamic default value to the column.
   * The function will be called when the row is inserted, and the returned value will be used as the column value.
   *
   * **Note:** This value does not affect the `drizzle-kit` behavior, it is only used at runtime in `drizzle-orm`.
   */
  $defaultFn(fn) {
    this.config.defaultFn = fn;
    this.config.hasDefault = true;
    return this;
  }
  /**
   * Alias for {@link $defaultFn}.
   */
  $default = this.$defaultFn;
  /**
   * Adds a `primary key` clause to the column definition. This implicitly makes the column `not null`.
   *
   * In SQLite, `integer primary key` implicitly makes the column auto-incrementing.
   */
  primaryKey() {
    this.config.primaryKey = true;
    this.config.notNull = true;
    return this;
  }
}

class DrizzleError extends Error {
  static [entityKind] = "DrizzleError";
  constructor({ message, cause }) {
    super(message);
    this.name = "DrizzleError";
    this.cause = cause;
  }
}
class TransactionRollbackError extends DrizzleError {
  static [entityKind] = "TransactionRollbackError";
  constructor() {
    super({ message: "Rollback" });
  }
}

function bindIfParam(value, column) {
  if (isDriverValueEncoder(column) && !isSQLWrapper(value) && !is(value, Param) && !is(value, Placeholder) && !is(value, Column) && !is(value, Table) && !is(value, View)) {
    return new Param(value, column);
  }
  return value;
}
const eq = (left, right) => {
  return sql`${left} = ${bindIfParam(right, left)}`;
};
const ne = (left, right) => {
  return sql`${left} <> ${bindIfParam(right, left)}`;
};
function and(...unfilteredConditions) {
  const conditions = unfilteredConditions.filter(
    (c) => c !== void 0
  );
  if (conditions.length === 0) {
    return void 0;
  }
  if (conditions.length === 1) {
    return new SQL(conditions);
  }
  return new SQL([
    new StringChunk("("),
    sql.join(conditions, new StringChunk(" and ")),
    new StringChunk(")")
  ]);
}
function or(...unfilteredConditions) {
  const conditions = unfilteredConditions.filter(
    (c) => c !== void 0
  );
  if (conditions.length === 0) {
    return void 0;
  }
  if (conditions.length === 1) {
    return new SQL(conditions);
  }
  return new SQL([
    new StringChunk("("),
    sql.join(conditions, new StringChunk(" or ")),
    new StringChunk(")")
  ]);
}
function not(condition) {
  return sql`not ${condition}`;
}
const gt = (left, right) => {
  return sql`${left} > ${bindIfParam(right, left)}`;
};
const gte = (left, right) => {
  return sql`${left} >= ${bindIfParam(right, left)}`;
};
const lt = (left, right) => {
  return sql`${left} < ${bindIfParam(right, left)}`;
};
const lte = (left, right) => {
  return sql`${left} <= ${bindIfParam(right, left)}`;
};
function inArray(column, values) {
  if (Array.isArray(values)) {
    if (values.length === 0) {
      throw new Error("inArray requires at least one value");
    }
    return sql`${column} in ${values.map((v) => bindIfParam(v, column))}`;
  }
  return sql`${column} in ${bindIfParam(values, column)}`;
}
function notInArray(column, values) {
  if (Array.isArray(values)) {
    if (values.length === 0) {
      throw new Error("notInArray requires at least one value");
    }
    return sql`${column} not in ${values.map((v) => bindIfParam(v, column))}`;
  }
  return sql`${column} not in ${bindIfParam(values, column)}`;
}
function isNull(value) {
  return sql`${value} is null`;
}
function isNotNull(value) {
  return sql`${value} is not null`;
}
function exists(subquery) {
  return sql`exists ${subquery}`;
}
function notExists(subquery) {
  return sql`not exists ${subquery}`;
}
function between(column, min, max) {
  return sql`${column} between ${bindIfParam(min, column)} and ${bindIfParam(
    max,
    column
  )}`;
}
function notBetween(column, min, max) {
  return sql`${column} not between ${bindIfParam(
    min,
    column
  )} and ${bindIfParam(max, column)}`;
}
function like(column, value) {
  return sql`${column} like ${value}`;
}
function notLike(column, value) {
  return sql`${column} not like ${value}`;
}
function ilike(column, value) {
  return sql`${column} ilike ${value}`;
}
function notIlike(column, value) {
  return sql`${column} not ilike ${value}`;
}

function asc(column) {
  return sql`${column} asc`;
}
function desc(column) {
  return sql`${column} desc`;
}

class ConsoleLogWriter {
  static [entityKind] = "ConsoleLogWriter";
  write(message) {
    console.log(message);
  }
}
class DefaultLogger {
  static [entityKind] = "DefaultLogger";
  writer;
  constructor(config) {
    this.writer = config?.writer ?? new ConsoleLogWriter();
  }
  logQuery(query, params) {
    const stringifiedParams = params.map((p) => {
      try {
        return JSON.stringify(p);
      } catch {
        return String(p);
      }
    });
    const paramsStr = stringifiedParams.length ? ` -- params: [${stringifiedParams.join(", ")}]` : "";
    this.writer.write(`Query: ${query}${paramsStr}`);
  }
}
class NoopLogger {
  static [entityKind] = "NoopLogger";
  logQuery() {
  }
}

class QueryPromise {
  static [entityKind] = "QueryPromise";
  [Symbol.toStringTag] = "QueryPromise";
  catch(onRejected) {
    return this.then(void 0, onRejected);
  }
  finally(onFinally) {
    return this.then(
      (value) => {
        onFinally?.();
        return value;
      },
      (reason) => {
        onFinally?.();
        throw reason;
      }
    );
  }
  then(onFulfilled, onRejected) {
    return this.execute().then(onFulfilled, onRejected);
  }
}

const InlineForeignKeys$1 = Symbol.for("drizzle:PgInlineForeignKeys");
class PgTable extends Table {
  static [entityKind] = "PgTable";
  /** @internal */
  static Symbol = Object.assign({}, Table.Symbol, {
    InlineForeignKeys: InlineForeignKeys$1
  });
  /**@internal */
  [InlineForeignKeys$1] = [];
  /** @internal */
  [Table.Symbol.ExtraConfigBuilder] = void 0;
}

class PrimaryKeyBuilder {
  static [entityKind] = "PgPrimaryKeyBuilder";
  /** @internal */
  columns;
  /** @internal */
  name;
  constructor(columns, name) {
    this.columns = columns;
    this.name = name;
  }
  /** @internal */
  build(table) {
    return new PrimaryKey(table, this.columns, this.name);
  }
}
class PrimaryKey {
  constructor(table, columns, name) {
    this.table = table;
    this.columns = columns;
    this.name = name;
  }
  static [entityKind] = "PgPrimaryKey";
  columns;
  name;
  getName() {
    return this.name ?? `${this.table[PgTable.Symbol.Name]}_${this.columns.map((column) => column.name).join("_")}_pk`;
  }
}

class Relation {
  constructor(sourceTable, referencedTable, relationName) {
    this.sourceTable = sourceTable;
    this.referencedTable = referencedTable;
    this.relationName = relationName;
    this.referencedTableName = referencedTable[Table.Symbol.Name];
  }
  static [entityKind] = "Relation";
  referencedTableName;
  fieldName;
}
class Relations {
  constructor(table, config) {
    this.table = table;
    this.config = config;
  }
  static [entityKind] = "Relations";
}
class One extends Relation {
  constructor(sourceTable, referencedTable, config, isNullable) {
    super(sourceTable, referencedTable, config?.relationName);
    this.config = config;
    this.isNullable = isNullable;
  }
  static [entityKind] = "One";
  withFieldName(fieldName) {
    const relation = new One(
      this.sourceTable,
      this.referencedTable,
      this.config,
      this.isNullable
    );
    relation.fieldName = fieldName;
    return relation;
  }
}
class Many extends Relation {
  constructor(sourceTable, referencedTable, config) {
    super(sourceTable, referencedTable, config?.relationName);
    this.config = config;
  }
  static [entityKind] = "Many";
  withFieldName(fieldName) {
    const relation = new Many(
      this.sourceTable,
      this.referencedTable,
      this.config
    );
    relation.fieldName = fieldName;
    return relation;
  }
}
function getOperators() {
  return {
    and,
    between,
    eq,
    exists,
    gt,
    gte,
    ilike,
    inArray,
    isNull,
    isNotNull,
    like,
    lt,
    lte,
    ne,
    not,
    notBetween,
    notExists,
    notLike,
    notIlike,
    notInArray,
    or,
    sql
  };
}
function getOrderByOperators() {
  return {
    sql,
    asc,
    desc
  };
}
function extractTablesRelationalConfig(schema, configHelpers) {
  if (Object.keys(schema).length === 1 && "default" in schema && !is(schema["default"], Table)) {
    schema = schema["default"];
  }
  const tableNamesMap = {};
  const relationsBuffer = {};
  const tablesConfig = {};
  for (const [key, value] of Object.entries(schema)) {
    if (isTable(value)) {
      const dbName = value[Table.Symbol.Name];
      const bufferedRelations = relationsBuffer[dbName];
      tableNamesMap[dbName] = key;
      tablesConfig[key] = {
        tsName: key,
        dbName: value[Table.Symbol.Name],
        schema: value[Table.Symbol.Schema],
        columns: value[Table.Symbol.Columns],
        relations: bufferedRelations?.relations ?? {},
        primaryKey: bufferedRelations?.primaryKey ?? []
      };
      for (const column of Object.values(
        value[Table.Symbol.Columns]
      )) {
        if (column.primary) {
          tablesConfig[key].primaryKey.push(column);
        }
      }
      const extraConfig = value[Table.Symbol.ExtraConfigBuilder]?.(value);
      if (extraConfig) {
        for (const configEntry of Object.values(extraConfig)) {
          if (is(configEntry, PrimaryKeyBuilder)) {
            tablesConfig[key].primaryKey.push(...configEntry.columns);
          }
        }
      }
    } else if (is(value, Relations)) {
      const dbName = value.table[Table.Symbol.Name];
      const tableName = tableNamesMap[dbName];
      const relations2 = value.config(
        configHelpers(value.table)
      );
      let primaryKey;
      for (const [relationName, relation] of Object.entries(relations2)) {
        if (tableName) {
          const tableConfig = tablesConfig[tableName];
          tableConfig.relations[relationName] = relation;
        } else {
          if (!(dbName in relationsBuffer)) {
            relationsBuffer[dbName] = {
              relations: {},
              primaryKey
            };
          }
          relationsBuffer[dbName].relations[relationName] = relation;
        }
      }
    }
  }
  return { tables: tablesConfig, tableNamesMap };
}
function createOne(sourceTable) {
  return function one(table, config) {
    return new One(
      sourceTable,
      table,
      config,
      config?.fields.reduce((res, f) => res && f.notNull, true) ?? false
    );
  };
}
function createMany(sourceTable) {
  return function many(referencedTable, config) {
    return new Many(sourceTable, referencedTable, config);
  };
}
function normalizeRelation(schema, tableNamesMap, relation) {
  if (is(relation, One) && relation.config) {
    return {
      fields: relation.config.fields,
      references: relation.config.references
    };
  }
  const referencedTableTsName = tableNamesMap[relation.referencedTable[Table.Symbol.Name]];
  if (!referencedTableTsName) {
    throw new Error(
      `Table "${relation.referencedTable[Table.Symbol.Name]}" not found in schema`
    );
  }
  const referencedTableConfig = schema[referencedTableTsName];
  if (!referencedTableConfig) {
    throw new Error(`Table "${referencedTableTsName}" not found in schema`);
  }
  const sourceTable = relation.sourceTable;
  const sourceTableTsName = tableNamesMap[sourceTable[Table.Symbol.Name]];
  if (!sourceTableTsName) {
    throw new Error(
      `Table "${sourceTable[Table.Symbol.Name]}" not found in schema`
    );
  }
  const reverseRelations = [];
  for (const referencedTableRelation of Object.values(
    referencedTableConfig.relations
  )) {
    if (relation.relationName && relation !== referencedTableRelation && referencedTableRelation.relationName === relation.relationName || !relation.relationName && referencedTableRelation.referencedTable === relation.sourceTable) {
      reverseRelations.push(referencedTableRelation);
    }
  }
  if (reverseRelations.length > 1) {
    throw relation.relationName ? new Error(
      `There are multiple relations with name "${relation.relationName}" in table "${referencedTableTsName}"`
    ) : new Error(
      `There are multiple relations between "${referencedTableTsName}" and "${relation.sourceTable[Table.Symbol.Name]}". Please specify relation name`
    );
  }
  if (reverseRelations[0] && is(reverseRelations[0], One) && reverseRelations[0].config) {
    return {
      fields: reverseRelations[0].config.references,
      references: reverseRelations[0].config.fields
    };
  }
  throw new Error(
    `There is not enough information to infer relation "${sourceTableTsName}.${relation.fieldName}"`
  );
}
function createTableRelationsHelpers(sourceTable) {
  return {
    one: createOne(sourceTable),
    many: createMany(sourceTable)
  };
}
function mapRelationalRow(tablesConfig, tableConfig, row, buildQueryResultSelection, mapColumnValue = (value) => value) {
  const result = {};
  for (const [
    selectionItemIndex,
    selectionItem
  ] of buildQueryResultSelection.entries()) {
    if (selectionItem.isJson) {
      const relation = tableConfig.relations[selectionItem.tsKey];
      const rawSubRows = row[selectionItemIndex];
      const subRows = typeof rawSubRows === "string" ? JSON.parse(rawSubRows) : rawSubRows;
      result[selectionItem.tsKey] = is(relation, One) ? subRows && mapRelationalRow(
        tablesConfig,
        tablesConfig[selectionItem.relationTableTsKey],
        subRows,
        selectionItem.selection,
        mapColumnValue
      ) : subRows.map(
        (subRow) => mapRelationalRow(
          tablesConfig,
          tablesConfig[selectionItem.relationTableTsKey],
          subRow,
          selectionItem.selection,
          mapColumnValue
        )
      );
    } else {
      const value = mapColumnValue(row[selectionItemIndex]);
      const field = selectionItem.field;
      let decoder;
      if (is(field, Column)) {
        decoder = field;
      } else if (is(field, SQL)) {
        decoder = field.decoder;
      } else {
        decoder = field.sql.decoder;
      }
      result[selectionItem.tsKey] = value === null ? null : decoder.mapFromDriverValue(value);
    }
  }
  return result;
}

function count(expression) {
  return sql`count(${expression || sql.raw("*")})`.mapWith(Number);
}
function sum(expression) {
  return sql`sum(${expression})`.mapWith(String);
}

function mapResultRow(columns, row, joinsNotNullableMap) {
  const nullifyMap = {};
  const result = columns.reduce(
    (result2, { path, field }, columnIndex) => {
      let decoder;
      if (is(field, Column)) {
        decoder = field;
      } else if (is(field, SQL)) {
        decoder = field.decoder;
      } else {
        decoder = field.sql.decoder;
      }
      let node = result2;
      for (const [pathChunkIndex, pathChunk] of path.entries()) {
        if (pathChunkIndex < path.length - 1) {
          if (!(pathChunk in node)) {
            node[pathChunk] = {};
          }
          node = node[pathChunk];
        } else {
          const rawValue = row[columnIndex];
          const value = node[pathChunk] = rawValue === null ? null : decoder.mapFromDriverValue(rawValue);
          if (joinsNotNullableMap && is(field, Column) && path.length === 2) {
            const objectName = path[0];
            if (!(objectName in nullifyMap)) {
              nullifyMap[objectName] = value === null ? getTableName(field.table) : false;
            } else if (typeof nullifyMap[objectName] === "string" && nullifyMap[objectName] !== getTableName(field.table)) {
              nullifyMap[objectName] = false;
            }
          }
        }
      }
      return result2;
    },
    {}
  );
  if (joinsNotNullableMap && Object.keys(nullifyMap).length > 0) {
    for (const [objectName, tableName] of Object.entries(nullifyMap)) {
      if (typeof tableName === "string" && !joinsNotNullableMap[tableName]) {
        result[objectName] = null;
      }
    }
  }
  return result;
}
function orderSelectedFields(fields, pathPrefix) {
  return Object.entries(fields).reduce((result, [name, field]) => {
    if (typeof name !== "string") {
      return result;
    }
    const newPath = pathPrefix ? [...pathPrefix, name] : [name];
    if (is(field, Column) || is(field, SQL) || is(field, SQL.Aliased)) {
      result.push({ path: newPath, field });
    } else if (is(field, Table)) {
      result.push(...orderSelectedFields(field[Table.Symbol.Columns], newPath));
    } else {
      result.push(...orderSelectedFields(field, newPath));
    }
    return result;
  }, []);
}
function haveSameKeys(left, right) {
  const leftKeys = Object.keys(left);
  const rightKeys = Object.keys(right);
  if (leftKeys.length !== rightKeys.length) {
    return false;
  }
  for (const [index, key] of leftKeys.entries()) {
    if (key !== rightKeys[index]) {
      return false;
    }
  }
  return true;
}
function mapUpdateSet(table, values) {
  const entries = Object.entries(values).filter(([, value]) => value !== void 0).map(([key, value]) => {
    if (is(value, SQL)) {
      return [key, value];
    } else {
      return [key, new Param(value, table[Table.Symbol.Columns][key])];
    }
  });
  if (entries.length === 0) {
    throw new Error("No values to set");
  }
  return Object.fromEntries(entries);
}
function applyMixins(baseClass, extendedClasses) {
  for (const extendedClass of extendedClasses) {
    for (const name of Object.getOwnPropertyNames(extendedClass.prototype)) {
      if (name === "constructor")
        continue;
      Object.defineProperty(
        baseClass.prototype,
        name,
        Object.getOwnPropertyDescriptor(extendedClass.prototype, name) || /* @__PURE__ */ Object.create(null)
      );
    }
  }
}
function getTableColumns(table) {
  return table[Table.Symbol.Columns];
}
function getTableLikeName(table) {
  return is(table, Subquery) ? table[SubqueryConfig].alias : is(table, View) ? table[ViewBaseConfig].name : is(table, SQL) ? void 0 : table[Table.Symbol.IsAlias] ? table[Table.Symbol.Name] : table[Table.Symbol.BaseName];
}

const InlineForeignKeys = Symbol.for("drizzle:SQLiteInlineForeignKeys");
class SQLiteTable extends Table {
  static [entityKind] = "SQLiteTable";
  /** @internal */
  static Symbol = Object.assign({}, Table.Symbol, {
    InlineForeignKeys
  });
  /** @internal */
  [Table.Symbol.Columns];
  /** @internal */
  [InlineForeignKeys] = [];
  /** @internal */
  [Table.Symbol.ExtraConfigBuilder] = void 0;
}
function sqliteTableBase(name, columns, extraConfig, schema, baseName = name) {
  const rawTable = new SQLiteTable(name, schema, baseName);
  const builtColumns = Object.fromEntries(
    Object.entries(columns).map(([name2, colBuilderBase]) => {
      const colBuilder = colBuilderBase;
      const column = colBuilder.build(rawTable);
      rawTable[InlineForeignKeys].push(...colBuilder.buildForeignKeys(column, rawTable));
      return [name2, column];
    })
  );
  const table = Object.assign(rawTable, builtColumns);
  table[Table.Symbol.Columns] = builtColumns;
  if (extraConfig) {
    table[SQLiteTable.Symbol.ExtraConfigBuilder] = extraConfig;
  }
  return table;
}
const sqliteTable = (name, columns, extraConfig) => {
  return sqliteTableBase(name, columns, extraConfig);
};

class ForeignKeyBuilder {
  static [entityKind] = "SQLiteForeignKeyBuilder";
  /** @internal */
  reference;
  /** @internal */
  _onUpdate;
  /** @internal */
  _onDelete;
  constructor(config, actions) {
    this.reference = () => {
      const { name, columns, foreignColumns } = config();
      return { name, columns, foreignTable: foreignColumns[0].table, foreignColumns };
    };
    if (actions) {
      this._onUpdate = actions.onUpdate;
      this._onDelete = actions.onDelete;
    }
  }
  onUpdate(action) {
    this._onUpdate = action;
    return this;
  }
  onDelete(action) {
    this._onDelete = action;
    return this;
  }
  /** @internal */
  build(table) {
    return new ForeignKey(table, this);
  }
}
class ForeignKey {
  constructor(table, builder) {
    this.table = table;
    this.reference = builder.reference;
    this.onUpdate = builder._onUpdate;
    this.onDelete = builder._onDelete;
  }
  static [entityKind] = "SQLiteForeignKey";
  reference;
  onUpdate;
  onDelete;
  getName() {
    const { name, columns, foreignColumns } = this.reference();
    const columnNames = columns.map((column) => column.name);
    const foreignColumnNames = foreignColumns.map((column) => column.name);
    const chunks = [
      this.table[SQLiteTable.Symbol.Name],
      ...columnNames,
      foreignColumns[0].table[SQLiteTable.Symbol.Name],
      ...foreignColumnNames
    ];
    return name ?? `${chunks.join("_")}_fk`;
  }
}

function uniqueKeyName(table, columns) {
  return `${table[SQLiteTable.Symbol.Name]}_${columns.join("_")}_unique`;
}

class SQLiteColumnBuilder extends ColumnBuilder {
  static [entityKind] = "SQLiteColumnBuilder";
  foreignKeyConfigs = [];
  references(ref, actions = {}) {
    this.foreignKeyConfigs.push({ ref, actions });
    return this;
  }
  unique(name) {
    this.config.isUnique = true;
    this.config.uniqueName = name;
    return this;
  }
  /** @internal */
  buildForeignKeys(column, table) {
    return this.foreignKeyConfigs.map(({ ref, actions }) => {
      return ((ref2, actions2) => {
        const builder = new ForeignKeyBuilder(() => {
          const foreignColumn = ref2();
          return { columns: [column], foreignColumns: [foreignColumn] };
        });
        if (actions2.onUpdate) {
          builder.onUpdate(actions2.onUpdate);
        }
        if (actions2.onDelete) {
          builder.onDelete(actions2.onDelete);
        }
        return builder.build(table);
      })(ref, actions);
    });
  }
}
class SQLiteColumn extends Column {
  constructor(table, config) {
    if (!config.uniqueName) {
      config.uniqueName = uniqueKeyName(table, [config.name]);
    }
    super(table, config);
    this.table = table;
  }
  static [entityKind] = "SQLiteColumn";
}

class SQLiteCustomColumnBuilder extends SQLiteColumnBuilder {
  static [entityKind] = "SQLiteCustomColumnBuilder";
  constructor(name, fieldConfig, customTypeParams) {
    super(name, "custom", "SQLiteCustomColumn");
    this.config.fieldConfig = fieldConfig;
    this.config.customTypeParams = customTypeParams;
  }
  /** @internal */
  build(table) {
    return new SQLiteCustomColumn(
      table,
      this.config
    );
  }
}
class SQLiteCustomColumn extends SQLiteColumn {
  static [entityKind] = "SQLiteCustomColumn";
  sqlName;
  mapTo;
  mapFrom;
  constructor(table, config) {
    super(table, config);
    this.sqlName = config.customTypeParams.dataType(config.fieldConfig);
    this.mapTo = config.customTypeParams.toDriver;
    this.mapFrom = config.customTypeParams.fromDriver;
  }
  getSQLType() {
    return this.sqlName;
  }
  mapFromDriverValue(value) {
    return typeof this.mapFrom === "function" ? this.mapFrom(value) : value;
  }
  mapToDriverValue(value) {
    return typeof this.mapTo === "function" ? this.mapTo(value) : value;
  }
}
function customType(customTypeParams) {
  return (dbName, fieldConfig) => {
    return new SQLiteCustomColumnBuilder(
      dbName,
      fieldConfig,
      customTypeParams
    );
  };
}

class SQLiteBaseIntegerBuilder extends SQLiteColumnBuilder {
  static [entityKind] = "SQLiteBaseIntegerBuilder";
  constructor(name, dataType, columnType) {
    super(name, dataType, columnType);
    this.config.autoIncrement = false;
  }
  primaryKey(config) {
    if (config?.autoIncrement) {
      this.config.autoIncrement = true;
    }
    this.config.hasDefault = true;
    return super.primaryKey();
  }
}
class SQLiteBaseInteger extends SQLiteColumn {
  static [entityKind] = "SQLiteBaseInteger";
  autoIncrement = this.config.autoIncrement;
  getSQLType() {
    return "integer";
  }
}
class SQLiteIntegerBuilder extends SQLiteBaseIntegerBuilder {
  static [entityKind] = "SQLiteIntegerBuilder";
  constructor(name) {
    super(name, "number", "SQLiteInteger");
  }
  build(table) {
    return new SQLiteInteger(
      table,
      this.config
    );
  }
}
class SQLiteInteger extends SQLiteBaseInteger {
  static [entityKind] = "SQLiteInteger";
}
class SQLiteTimestampBuilder extends SQLiteBaseIntegerBuilder {
  static [entityKind] = "SQLiteTimestampBuilder";
  constructor(name, mode) {
    super(name, "date", "SQLiteTimestamp");
    this.config.mode = mode;
  }
  /**
   * @deprecated Use `default()` with your own expression instead.
   *
   * Adds `DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer))` to the column, which is the current epoch timestamp in milliseconds.
   */
  defaultNow() {
    return this.default(sql`(cast((julianday('now') - 2440587.5)*86400000 as integer))`);
  }
  build(table) {
    return new SQLiteTimestamp(
      table,
      this.config
    );
  }
}
class SQLiteTimestamp extends SQLiteBaseInteger {
  static [entityKind] = "SQLiteTimestamp";
  mode = this.config.mode;
  mapFromDriverValue(value) {
    if (this.config.mode === "timestamp") {
      return new Date(value * 1e3);
    }
    return new Date(value);
  }
  mapToDriverValue(value) {
    const unix = value.getTime();
    if (this.config.mode === "timestamp") {
      return Math.floor(unix / 1e3);
    }
    return unix;
  }
}
class SQLiteBooleanBuilder extends SQLiteBaseIntegerBuilder {
  static [entityKind] = "SQLiteBooleanBuilder";
  constructor(name, mode) {
    super(name, "boolean", "SQLiteBoolean");
    this.config.mode = mode;
  }
  build(table) {
    return new SQLiteBoolean(
      table,
      this.config
    );
  }
}
class SQLiteBoolean extends SQLiteBaseInteger {
  static [entityKind] = "SQLiteBoolean";
  mode = this.config.mode;
  mapFromDriverValue(value) {
    return Number(value) === 1;
  }
  mapToDriverValue(value) {
    return value ? 1 : 0;
  }
}
function integer(name, config) {
  if (config?.mode === "timestamp" || config?.mode === "timestamp_ms") {
    return new SQLiteTimestampBuilder(name, config.mode);
  }
  if (config?.mode === "boolean") {
    return new SQLiteBooleanBuilder(name, config.mode);
  }
  return new SQLiteIntegerBuilder(name);
}

class SQLiteTextBuilder extends SQLiteColumnBuilder {
  static [entityKind] = "SQLiteTextBuilder";
  constructor(name, config) {
    super(name, "string", "SQLiteText");
    this.config.enumValues = config.enum;
    this.config.length = config.length;
  }
  /** @internal */
  build(table) {
    return new SQLiteText(table, this.config);
  }
}
class SQLiteText extends SQLiteColumn {
  static [entityKind] = "SQLiteText";
  enumValues = this.config.enumValues;
  length = this.config.length;
  constructor(table, config) {
    super(table, config);
  }
  getSQLType() {
    return `text${this.config.length ? `(${this.config.length})` : ""}`;
  }
}
class SQLiteTextJsonBuilder extends SQLiteColumnBuilder {
  static [entityKind] = "SQLiteTextJsonBuilder";
  constructor(name) {
    super(name, "json", "SQLiteTextJson");
  }
  /** @internal */
  build(table) {
    return new SQLiteTextJson(
      table,
      this.config
    );
  }
}
class SQLiteTextJson extends SQLiteColumn {
  static [entityKind] = "SQLiteTextJson";
  getSQLType() {
    return "text";
  }
  mapFromDriverValue(value) {
    return JSON.parse(value);
  }
  mapToDriverValue(value) {
    return JSON.stringify(value);
  }
}
function text(name, config = {}) {
  return config.mode === "json" ? new SQLiteTextJsonBuilder(name) : new SQLiteTextBuilder(name, config);
}

class SelectionProxyHandler {
  static [entityKind] = "SelectionProxyHandler";
  config;
  constructor(config) {
    this.config = { ...config };
  }
  get(subquery, prop) {
    if (prop === SubqueryConfig) {
      return {
        ...subquery[SubqueryConfig],
        selection: new Proxy(
          subquery[SubqueryConfig].selection,
          this
        )
      };
    }
    if (prop === ViewBaseConfig) {
      return {
        ...subquery[ViewBaseConfig],
        selectedFields: new Proxy(
          subquery[ViewBaseConfig].selectedFields,
          this
        )
      };
    }
    if (typeof prop === "symbol") {
      return subquery[prop];
    }
    const columns = is(subquery, Subquery) ? subquery[SubqueryConfig].selection : is(subquery, View) ? subquery[ViewBaseConfig].selectedFields : subquery;
    const value = columns[prop];
    if (is(value, SQL.Aliased)) {
      if (this.config.sqlAliasedBehavior === "sql" && !value.isSelectionField) {
        return value.sql;
      }
      const newValue = value.clone();
      newValue.isSelectionField = true;
      return newValue;
    }
    if (is(value, SQL)) {
      if (this.config.sqlBehavior === "sql") {
        return value;
      }
      throw new Error(
        `You tried to reference "${prop}" field from a subquery, which is a raw SQL field, but it doesn't have an alias declared. Please add an alias to the field using ".as('alias')" method.`
      );
    }
    if (is(value, Column)) {
      if (this.config.alias) {
        return new Proxy(
          value,
          new ColumnAliasProxyHandler(
            new Proxy(
              value.table,
              new TableAliasProxyHandler(this.config.alias, this.config.replaceOriginalName ?? false)
            )
          )
        );
      }
      return value;
    }
    if (typeof value !== "object" || value === null) {
      return value;
    }
    return new Proxy(value, new SelectionProxyHandler(this.config));
  }
}

class SQLiteDeleteBase extends QueryPromise {
  constructor(table, session, dialect, withList) {
    super();
    this.table = table;
    this.session = session;
    this.dialect = dialect;
    this.config = { table, withList };
  }
  static [entityKind] = "SQLiteDelete";
  /** @internal */
  config;
  /**
   * Adds a `where` clause to the query.
   *
   * Calling this method will delete only those rows that fulfill a specified condition.
   *
   * See docs: {@link https://orm.drizzle.team/docs/delete}
   *
   * @param where the `where` clause.
   *
   * @example
   * You can use conditional operators and `sql function` to filter the rows to be deleted.
   *
   * ```ts
   * // Delete all cars with green color
   * db.delete(cars).where(eq(cars.color, 'green'));
   * // or
   * db.delete(cars).where(sql`${cars.color} = 'green'`)
   * ```
   *
   * You can logically combine conditional operators with `and()` and `or()` operators:
   *
   * ```ts
   * // Delete all BMW cars with a green color
   * db.delete(cars).where(and(eq(cars.color, 'green'), eq(cars.brand, 'BMW')));
   *
   * // Delete all cars with the green or blue color
   * db.delete(cars).where(or(eq(cars.color, 'green'), eq(cars.color, 'blue')));
   * ```
   */
  where(where) {
    this.config.where = where;
    return this;
  }
  returning(fields = this.table[SQLiteTable.Symbol.Columns]) {
    this.config.returning = orderSelectedFields(fields);
    return this;
  }
  /** @internal */
  getSQL() {
    return this.dialect.buildDeleteQuery(this.config);
  }
  toSQL() {
    const { typings: _typings, ...rest } = this.dialect.sqlToQuery(this.getSQL());
    return rest;
  }
  /** @internal */
  _prepare(isOneTimeQuery = true) {
    return this.session[isOneTimeQuery ? "prepareOneTimeQuery" : "prepareQuery"](
      this.dialect.sqlToQuery(this.getSQL()),
      this.config.returning,
      this.config.returning ? "all" : "run"
    );
  }
  prepare() {
    return this._prepare(false);
  }
  run = (placeholderValues) => {
    return this._prepare().run(placeholderValues);
  };
  all = (placeholderValues) => {
    return this._prepare().all(placeholderValues);
  };
  get = (placeholderValues) => {
    return this._prepare().get(placeholderValues);
  };
  values = (placeholderValues) => {
    return this._prepare().values(placeholderValues);
  };
  async execute(placeholderValues) {
    return this._prepare().execute(placeholderValues);
  }
  $dynamic() {
    return this;
  }
}

class SQLiteInsertBuilder {
  constructor(table, session, dialect, withList) {
    this.table = table;
    this.session = session;
    this.dialect = dialect;
    this.withList = withList;
  }
  static [entityKind] = "SQLiteInsertBuilder";
  values(values) {
    values = Array.isArray(values) ? values : [values];
    if (values.length === 0) {
      throw new Error("values() must be called with at least one value");
    }
    const mappedValues = values.map((entry) => {
      const result = {};
      const cols = this.table[Table.Symbol.Columns];
      for (const colKey of Object.keys(entry)) {
        const colValue = entry[colKey];
        result[colKey] = is(colValue, SQL) ? colValue : new Param(colValue, cols[colKey]);
      }
      return result;
    });
    return new SQLiteInsertBase(this.table, mappedValues, this.session, this.dialect, this.withList);
  }
}
class SQLiteInsertBase extends QueryPromise {
  constructor(table, values, session, dialect, withList) {
    super();
    this.session = session;
    this.dialect = dialect;
    this.config = { table, values, withList };
  }
  static [entityKind] = "SQLiteInsert";
  /** @internal */
  config;
  returning(fields = this.config.table[SQLiteTable.Symbol.Columns]) {
    this.config.returning = orderSelectedFields(fields);
    return this;
  }
  /**
   * Adds an `on conflict do nothing` clause to the query.
   *
   * Calling this method simply avoids inserting a row as its alternative action.
   *
   * See docs: {@link https://orm.drizzle.team/docs/insert#on-conflict-do-nothing}
   *
   * @param config The `target` and `where` clauses.
   *
   * @example
   * ```ts
   * // Insert one row and cancel the insert if there's a conflict
   * await db.insert(cars)
   *   .values({ id: 1, brand: 'BMW' })
   *   .onConflictDoNothing();
   *
   * // Explicitly specify conflict target
   * await db.insert(cars)
   *   .values({ id: 1, brand: 'BMW' })
   *   .onConflictDoNothing({ target: cars.id });
   * ```
   */
  onConflictDoNothing(config = {}) {
    if (config.target === void 0) {
      this.config.onConflict = sql`do nothing`;
    } else {
      const targetSql = Array.isArray(config.target) ? sql`${config.target}` : sql`${[config.target]}`;
      const whereSql = config.where ? sql` where ${config.where}` : sql``;
      this.config.onConflict = sql`${targetSql} do nothing${whereSql}`;
    }
    return this;
  }
  /**
   * Adds an `on conflict do update` clause to the query.
   *
   * Calling this method will update the existing row that conflicts with the row proposed for insertion as its alternative action.
   *
   * See docs: {@link https://orm.drizzle.team/docs/insert#upserts-and-conflicts}
   *
   * @param config The `target`, `set` and `where` clauses.
   *
   * @example
   * ```ts
   * // Update the row if there's a conflict
   * await db.insert(cars)
   *   .values({ id: 1, brand: 'BMW' })
   *   .onConflictDoUpdate({
   *     target: cars.id,
   *     set: { brand: 'Porsche' }
   *   });
   *
   * // Upsert with 'where' clause
   * await db.insert(cars)
   *   .values({ id: 1, brand: 'BMW' })
   *   .onConflictDoUpdate({
   *     target: cars.id,
   *     set: { brand: 'newBMW' },
   *     where: sql`${cars.createdAt} > '2023-01-01'::date`,
   *   });
   * ```
   */
  onConflictDoUpdate(config) {
    const targetSql = Array.isArray(config.target) ? sql`${config.target}` : sql`${[config.target]}`;
    const whereSql = config.where ? sql` where ${config.where}` : sql``;
    const setSql = this.dialect.buildUpdateSet(this.config.table, mapUpdateSet(this.config.table, config.set));
    this.config.onConflict = sql`${targetSql} do update set ${setSql}${whereSql}`;
    return this;
  }
  /** @internal */
  getSQL() {
    return this.dialect.buildInsertQuery(this.config);
  }
  toSQL() {
    const { typings: _typings, ...rest } = this.dialect.sqlToQuery(this.getSQL());
    return rest;
  }
  /** @internal */
  _prepare(isOneTimeQuery = true) {
    return this.session[isOneTimeQuery ? "prepareOneTimeQuery" : "prepareQuery"](
      this.dialect.sqlToQuery(this.getSQL()),
      this.config.returning,
      this.config.returning ? "all" : "run"
    );
  }
  prepare() {
    return this._prepare(false);
  }
  run = (placeholderValues) => {
    return this._prepare().run(placeholderValues);
  };
  all = (placeholderValues) => {
    return this._prepare().all(placeholderValues);
  };
  get = (placeholderValues) => {
    return this._prepare().get(placeholderValues);
  };
  values = (placeholderValues) => {
    return this._prepare().values(placeholderValues);
  };
  async execute() {
    return this.config.returning ? this.all() : this.run();
  }
  $dynamic() {
    return this;
  }
}

class SQLiteViewBase extends View {
  static [entityKind] = "SQLiteViewBase";
}

class SQLiteDialect {
  static [entityKind] = "SQLiteDialect";
  escapeName(name) {
    return `"${name}"`;
  }
  escapeParam(_num) {
    return "?";
  }
  escapeString(str) {
    return `'${str.replace(/'/g, "''")}'`;
  }
  buildWithCTE(queries) {
    if (!queries?.length)
      return void 0;
    const withSqlChunks = [sql`with `];
    for (const [i, w] of queries.entries()) {
      withSqlChunks.push(sql`${sql.identifier(w[SubqueryConfig].alias)} as (${w[SubqueryConfig].sql})`);
      if (i < queries.length - 1) {
        withSqlChunks.push(sql`, `);
      }
    }
    withSqlChunks.push(sql` `);
    return sql.join(withSqlChunks);
  }
  buildDeleteQuery({ table, where, returning, withList }) {
    const withSql = this.buildWithCTE(withList);
    const returningSql = returning ? sql` returning ${this.buildSelection(returning, { isSingleTable: true })}` : void 0;
    const whereSql = where ? sql` where ${where}` : void 0;
    return sql`${withSql}delete from ${table}${whereSql}${returningSql}`;
  }
  buildUpdateSet(table, set) {
    const setEntries = Object.entries(set);
    const setSize = setEntries.length;
    return sql.join(
      setEntries.flatMap(([colName, value], i) => {
        const col = table[Table.Symbol.Columns][colName];
        const res = sql`${sql.identifier(col.name)} = ${value}`;
        if (i < setSize - 1) {
          return [res, sql.raw(", ")];
        }
        return [res];
      })
    );
  }
  buildUpdateQuery({ table, set, where, returning, withList }) {
    const withSql = this.buildWithCTE(withList);
    const setSql = this.buildUpdateSet(table, set);
    const returningSql = returning ? sql` returning ${this.buildSelection(returning, { isSingleTable: true })}` : void 0;
    const whereSql = where ? sql` where ${where}` : void 0;
    return sql`${withSql}update ${table} set ${setSql}${whereSql}${returningSql}`;
  }
  /**
   * Builds selection SQL with provided fields/expressions
   *
   * Examples:
   *
   * `select <selection> from`
   *
   * `insert ... returning <selection>`
   *
   * If `isSingleTable` is true, then columns won't be prefixed with table name
   */
  buildSelection(fields, { isSingleTable = false } = {}) {
    const columnsLen = fields.length;
    const chunks = fields.flatMap(({ field }, i) => {
      const chunk = [];
      if (is(field, SQL.Aliased) && field.isSelectionField) {
        chunk.push(sql.identifier(field.fieldAlias));
      } else if (is(field, SQL.Aliased) || is(field, SQL)) {
        const query = is(field, SQL.Aliased) ? field.sql : field;
        if (isSingleTable) {
          chunk.push(
            new SQL(
              query.queryChunks.map((c) => {
                if (is(c, Column)) {
                  return sql.identifier(c.name);
                }
                return c;
              })
            )
          );
        } else {
          chunk.push(query);
        }
        if (is(field, SQL.Aliased)) {
          chunk.push(sql` as ${sql.identifier(field.fieldAlias)}`);
        }
      } else if (is(field, Column)) {
        const tableName = field.table[Table.Symbol.Name];
        const columnName = field.name;
        if (isSingleTable) {
          chunk.push(sql.identifier(columnName));
        } else {
          chunk.push(sql`${sql.identifier(tableName)}.${sql.identifier(columnName)}`);
        }
      }
      if (i < columnsLen - 1) {
        chunk.push(sql`, `);
      }
      return chunk;
    });
    return sql.join(chunks);
  }
  buildSelectQuery({
    withList,
    fields,
    fieldsFlat,
    where,
    having,
    table,
    joins,
    orderBy,
    groupBy,
    limit,
    offset,
    distinct,
    setOperators
  }) {
    const fieldsList = fieldsFlat ?? orderSelectedFields(fields);
    for (const f of fieldsList) {
      if (is(f.field, Column) && getTableName(f.field.table) !== (is(table, Subquery) ? table[SubqueryConfig].alias : is(table, SQLiteViewBase) ? table[ViewBaseConfig].name : is(table, SQL) ? void 0 : getTableName(table)) && !((table2) => joins?.some(
        ({ alias }) => alias === (table2[Table.Symbol.IsAlias] ? getTableName(table2) : table2[Table.Symbol.BaseName])
      ))(f.field.table)) {
        const tableName = getTableName(f.field.table);
        throw new Error(
          `Your "${f.path.join("->")}" field references a column "${tableName}"."${f.field.name}", but the table "${tableName}" is not part of the query! Did you forget to join it?`
        );
      }
    }
    const isSingleTable = !joins || joins.length === 0;
    const withSql = this.buildWithCTE(withList);
    const distinctSql = distinct ? sql` distinct` : void 0;
    const selection = this.buildSelection(fieldsList, { isSingleTable });
    const tableSql = (() => {
      if (is(table, Table) && table[Table.Symbol.OriginalName] !== table[Table.Symbol.Name]) {
        return sql`${sql.identifier(table[Table.Symbol.OriginalName])} ${sql.identifier(table[Table.Symbol.Name])}`;
      }
      return table;
    })();
    const joinsArray = [];
    if (joins) {
      for (const [index, joinMeta] of joins.entries()) {
        if (index === 0) {
          joinsArray.push(sql` `);
        }
        const table2 = joinMeta.table;
        if (is(table2, SQLiteTable)) {
          const tableName = table2[SQLiteTable.Symbol.Name];
          const tableSchema = table2[SQLiteTable.Symbol.Schema];
          const origTableName = table2[SQLiteTable.Symbol.OriginalName];
          const alias = tableName === origTableName ? void 0 : joinMeta.alias;
          joinsArray.push(
            sql`${sql.raw(joinMeta.joinType)} join ${tableSchema ? sql`${sql.identifier(tableSchema)}.` : void 0}${sql.identifier(origTableName)}${alias && sql` ${sql.identifier(alias)}`} on ${joinMeta.on}`
          );
        } else {
          joinsArray.push(
            sql`${sql.raw(joinMeta.joinType)} join ${table2} on ${joinMeta.on}`
          );
        }
        if (index < joins.length - 1) {
          joinsArray.push(sql` `);
        }
      }
    }
    const joinsSql = sql.join(joinsArray);
    const whereSql = where ? sql` where ${where}` : void 0;
    const havingSql = having ? sql` having ${having}` : void 0;
    const orderByList = [];
    if (orderBy) {
      for (const [index, orderByValue] of orderBy.entries()) {
        orderByList.push(orderByValue);
        if (index < orderBy.length - 1) {
          orderByList.push(sql`, `);
        }
      }
    }
    const groupByList = [];
    if (groupBy) {
      for (const [index, groupByValue] of groupBy.entries()) {
        groupByList.push(groupByValue);
        if (index < groupBy.length - 1) {
          groupByList.push(sql`, `);
        }
      }
    }
    const groupBySql = groupByList.length > 0 ? sql` group by ${sql.join(groupByList)}` : void 0;
    const orderBySql = orderByList.length > 0 ? sql` order by ${sql.join(orderByList)}` : void 0;
    const limitSql = limit ? sql` limit ${limit}` : void 0;
    const offsetSql = offset ? sql` offset ${offset}` : void 0;
    const finalQuery = sql`${withSql}select${distinctSql} ${selection} from ${tableSql}${joinsSql}${whereSql}${groupBySql}${havingSql}${orderBySql}${limitSql}${offsetSql}`;
    if (setOperators.length > 0) {
      return this.buildSetOperations(finalQuery, setOperators);
    }
    return finalQuery;
  }
  buildSetOperations(leftSelect, setOperators) {
    const [setOperator, ...rest] = setOperators;
    if (!setOperator) {
      throw new Error("Cannot pass undefined values to any set operator");
    }
    if (rest.length === 0) {
      return this.buildSetOperationQuery({ leftSelect, setOperator });
    }
    return this.buildSetOperations(
      this.buildSetOperationQuery({ leftSelect, setOperator }),
      rest
    );
  }
  buildSetOperationQuery({
    leftSelect,
    setOperator: { type, isAll, rightSelect, limit, orderBy, offset }
  }) {
    const leftChunk = sql`${leftSelect.getSQL()} `;
    const rightChunk = sql`${rightSelect.getSQL()}`;
    let orderBySql;
    if (orderBy && orderBy.length > 0) {
      const orderByValues = [];
      for (const singleOrderBy of orderBy) {
        if (is(singleOrderBy, SQLiteColumn)) {
          orderByValues.push(sql.identifier(singleOrderBy.name));
        } else if (is(singleOrderBy, SQL)) {
          for (let i = 0; i < singleOrderBy.queryChunks.length; i++) {
            const chunk = singleOrderBy.queryChunks[i];
            if (is(chunk, SQLiteColumn)) {
              singleOrderBy.queryChunks[i] = sql.identifier(chunk.name);
            }
          }
          orderByValues.push(sql`${singleOrderBy}`);
        } else {
          orderByValues.push(sql`${singleOrderBy}`);
        }
      }
      orderBySql = sql` order by ${sql.join(orderByValues, sql`, `)}`;
    }
    const limitSql = limit ? sql` limit ${limit}` : void 0;
    const operatorChunk = sql.raw(`${type} ${isAll ? "all " : ""}`);
    const offsetSql = offset ? sql` offset ${offset}` : void 0;
    return sql`${leftChunk}${operatorChunk}${rightChunk}${orderBySql}${limitSql}${offsetSql}`;
  }
  buildInsertQuery({ table, values, onConflict, returning, withList }) {
    const valuesSqlList = [];
    const columns = table[Table.Symbol.Columns];
    const colEntries = Object.entries(columns);
    const insertOrder = colEntries.map(([, column]) => sql.identifier(column.name));
    for (const [valueIndex, value] of values.entries()) {
      const valueList = [];
      for (const [fieldName, col] of colEntries) {
        const colValue = value[fieldName];
        if (colValue === void 0 || is(colValue, Param) && colValue.value === void 0) {
          let defaultValue;
          if (col.default !== null && col.default !== void 0) {
            defaultValue = is(col.default, SQL) ? col.default : sql.param(col.default, col);
          } else if (col.defaultFn !== void 0) {
            const defaultFnResult = col.defaultFn();
            defaultValue = is(defaultFnResult, SQL) ? defaultFnResult : sql.param(defaultFnResult, col);
          } else {
            defaultValue = sql`null`;
          }
          valueList.push(defaultValue);
        } else {
          valueList.push(colValue);
        }
      }
      valuesSqlList.push(valueList);
      if (valueIndex < values.length - 1) {
        valuesSqlList.push(sql`, `);
      }
    }
    const withSql = this.buildWithCTE(withList);
    const valuesSql = sql.join(valuesSqlList);
    const returningSql = returning ? sql` returning ${this.buildSelection(returning, { isSingleTable: true })}` : void 0;
    const onConflictSql = onConflict ? sql` on conflict ${onConflict}` : void 0;
    return sql`${withSql}insert into ${table} ${insertOrder} values ${valuesSql}${onConflictSql}${returningSql}`;
  }
  sqlToQuery(sql2) {
    return sql2.toQuery({
      escapeName: this.escapeName,
      escapeParam: this.escapeParam,
      escapeString: this.escapeString
    });
  }
  buildRelationalQuery({
    fullSchema,
    schema,
    tableNamesMap,
    table,
    tableConfig,
    queryConfig: config,
    tableAlias,
    nestedQueryRelation,
    joinOn
  }) {
    let selection = [];
    let limit, offset, orderBy = [], where;
    const joins = [];
    if (config === true) {
      const selectionEntries = Object.entries(tableConfig.columns);
      selection = selectionEntries.map(([key, value]) => ({
        dbKey: value.name,
        tsKey: key,
        field: aliasedTableColumn(value, tableAlias),
        relationTableTsKey: void 0,
        isJson: false,
        selection: []
      }));
    } else {
      const aliasedColumns = Object.fromEntries(
        Object.entries(tableConfig.columns).map(([key, value]) => [key, aliasedTableColumn(value, tableAlias)])
      );
      if (config.where) {
        const whereSql = typeof config.where === "function" ? config.where(aliasedColumns, getOperators()) : config.where;
        where = whereSql && mapColumnsInSQLToAlias(whereSql, tableAlias);
      }
      const fieldsSelection = [];
      let selectedColumns = [];
      if (config.columns) {
        let isIncludeMode = false;
        for (const [field, value] of Object.entries(config.columns)) {
          if (value === void 0) {
            continue;
          }
          if (field in tableConfig.columns) {
            if (!isIncludeMode && value === true) {
              isIncludeMode = true;
            }
            selectedColumns.push(field);
          }
        }
        if (selectedColumns.length > 0) {
          selectedColumns = isIncludeMode ? selectedColumns.filter((c) => config.columns?.[c] === true) : Object.keys(tableConfig.columns).filter((key) => !selectedColumns.includes(key));
        }
      } else {
        selectedColumns = Object.keys(tableConfig.columns);
      }
      for (const field of selectedColumns) {
        const column = tableConfig.columns[field];
        fieldsSelection.push({ tsKey: field, value: column });
      }
      let selectedRelations = [];
      if (config.with) {
        selectedRelations = Object.entries(config.with).filter((entry) => !!entry[1]).map(([tsKey, queryConfig]) => ({ tsKey, queryConfig, relation: tableConfig.relations[tsKey] }));
      }
      let extras;
      if (config.extras) {
        extras = typeof config.extras === "function" ? config.extras(aliasedColumns, { sql }) : config.extras;
        for (const [tsKey, value] of Object.entries(extras)) {
          fieldsSelection.push({
            tsKey,
            value: mapColumnsInAliasedSQLToAlias(value, tableAlias)
          });
        }
      }
      for (const { tsKey, value } of fieldsSelection) {
        selection.push({
          dbKey: is(value, SQL.Aliased) ? value.fieldAlias : tableConfig.columns[tsKey].name,
          tsKey,
          field: is(value, Column) ? aliasedTableColumn(value, tableAlias) : value,
          relationTableTsKey: void 0,
          isJson: false,
          selection: []
        });
      }
      let orderByOrig = typeof config.orderBy === "function" ? config.orderBy(aliasedColumns, getOrderByOperators()) : config.orderBy ?? [];
      if (!Array.isArray(orderByOrig)) {
        orderByOrig = [orderByOrig];
      }
      orderBy = orderByOrig.map((orderByValue) => {
        if (is(orderByValue, Column)) {
          return aliasedTableColumn(orderByValue, tableAlias);
        }
        return mapColumnsInSQLToAlias(orderByValue, tableAlias);
      });
      limit = config.limit;
      offset = config.offset;
      for (const {
        tsKey: selectedRelationTsKey,
        queryConfig: selectedRelationConfigValue,
        relation
      } of selectedRelations) {
        const normalizedRelation = normalizeRelation(schema, tableNamesMap, relation);
        const relationTableName = relation.referencedTable[Table.Symbol.Name];
        const relationTableTsName = tableNamesMap[relationTableName];
        const relationTableAlias = `${tableAlias}_${selectedRelationTsKey}`;
        const joinOn2 = and(
          ...normalizedRelation.fields.map(
            (field2, i) => eq(
              aliasedTableColumn(normalizedRelation.references[i], relationTableAlias),
              aliasedTableColumn(field2, tableAlias)
            )
          )
        );
        const builtRelation = this.buildRelationalQuery({
          fullSchema,
          schema,
          tableNamesMap,
          table: fullSchema[relationTableTsName],
          tableConfig: schema[relationTableTsName],
          queryConfig: is(relation, One) ? selectedRelationConfigValue === true ? { limit: 1 } : { ...selectedRelationConfigValue, limit: 1 } : selectedRelationConfigValue,
          tableAlias: relationTableAlias,
          joinOn: joinOn2,
          nestedQueryRelation: relation
        });
        const field = sql`(${builtRelation.sql})`.as(selectedRelationTsKey);
        selection.push({
          dbKey: selectedRelationTsKey,
          tsKey: selectedRelationTsKey,
          field,
          relationTableTsKey: relationTableTsName,
          isJson: true,
          selection: builtRelation.selection
        });
      }
    }
    if (selection.length === 0) {
      throw new DrizzleError({
        message: `No fields selected for table "${tableConfig.tsName}" ("${tableAlias}"). You need to have at least one item in "columns", "with" or "extras". If you need to select all columns, omit the "columns" key or set it to undefined.`
      });
    }
    let result;
    where = and(joinOn, where);
    if (nestedQueryRelation) {
      let field = sql`json_array(${sql.join(
        selection.map(
          ({ field: field2 }) => is(field2, SQLiteColumn) ? sql.identifier(field2.name) : is(field2, SQL.Aliased) ? field2.sql : field2
        ),
        sql`, `
      )})`;
      if (is(nestedQueryRelation, Many)) {
        field = sql`coalesce(json_group_array(${field}), json_array())`;
      }
      const nestedSelection = [{
        dbKey: "data",
        tsKey: "data",
        field: field.as("data"),
        isJson: true,
        relationTableTsKey: tableConfig.tsName,
        selection
      }];
      const needsSubquery = limit !== void 0 || offset !== void 0 || orderBy.length > 0;
      if (needsSubquery) {
        result = this.buildSelectQuery({
          table: aliasedTable(table, tableAlias),
          fields: {},
          fieldsFlat: [
            {
              path: [],
              field: sql.raw("*")
            }
          ],
          where,
          limit,
          offset,
          orderBy,
          setOperators: []
        });
        where = void 0;
        limit = void 0;
        offset = void 0;
        orderBy = void 0;
      } else {
        result = aliasedTable(table, tableAlias);
      }
      result = this.buildSelectQuery({
        table: is(result, SQLiteTable) ? result : new Subquery(result, {}, tableAlias),
        fields: {},
        fieldsFlat: nestedSelection.map(({ field: field2 }) => ({
          path: [],
          field: is(field2, Column) ? aliasedTableColumn(field2, tableAlias) : field2
        })),
        joins,
        where,
        limit,
        offset,
        orderBy,
        setOperators: []
      });
    } else {
      result = this.buildSelectQuery({
        table: aliasedTable(table, tableAlias),
        fields: {},
        fieldsFlat: selection.map(({ field }) => ({
          path: [],
          field: is(field, Column) ? aliasedTableColumn(field, tableAlias) : field
        })),
        joins,
        where,
        limit,
        offset,
        orderBy,
        setOperators: []
      });
    }
    return {
      tableTsKey: tableConfig.tsName,
      sql: result,
      selection
    };
  }
}
class SQLiteSyncDialect extends SQLiteDialect {
  static [entityKind] = "SQLiteSyncDialect";
  migrate(migrations, session, config) {
    const migrationsTable = config === void 0 ? "__drizzle_migrations" : typeof config === "string" ? "__drizzle_migrations" : config.migrationsTable ?? "__drizzle_migrations";
    const migrationTableCreate = sql`
			CREATE TABLE IF NOT EXISTS ${sql.identifier(migrationsTable)} (
				id SERIAL PRIMARY KEY,
				hash text NOT NULL,
				created_at numeric
			)
		`;
    session.run(migrationTableCreate);
    const dbMigrations = session.values(
      sql`SELECT id, hash, created_at FROM ${sql.identifier(migrationsTable)} ORDER BY created_at DESC LIMIT 1`
    );
    const lastDbMigration = dbMigrations[0] ?? void 0;
    session.run(sql`BEGIN`);
    try {
      for (const migration of migrations) {
        if (!lastDbMigration || Number(lastDbMigration[2]) < migration.folderMillis) {
          for (const stmt of migration.sql) {
            session.run(sql.raw(stmt));
          }
          session.run(
            sql`INSERT INTO ${sql.identifier(migrationsTable)} ("hash", "created_at") VALUES(${migration.hash}, ${migration.folderMillis})`
          );
        }
      }
      session.run(sql`COMMIT`);
    } catch (e) {
      session.run(sql`ROLLBACK`);
      throw e;
    }
  }
}
class SQLiteAsyncDialect extends SQLiteDialect {
  static [entityKind] = "SQLiteAsyncDialect";
  async migrate(migrations, session, config) {
    const migrationsTable = typeof config === "string" ? "__drizzle_migrations" : config.migrationsTable ?? "__drizzle_migrations";
    const migrationTableCreate = sql`
			CREATE TABLE IF NOT EXISTS ${sql.identifier(migrationsTable)} (
				id SERIAL PRIMARY KEY,
				hash text NOT NULL,
				created_at numeric
			)
		`;
    await session.run(migrationTableCreate);
    const dbMigrations = await session.values(
      sql`SELECT id, hash, created_at FROM ${sql.identifier(migrationsTable)} ORDER BY created_at DESC LIMIT 1`
    );
    const lastDbMigration = dbMigrations[0] ?? void 0;
    await session.transaction(async (tx) => {
      for (const migration of migrations) {
        if (!lastDbMigration || Number(lastDbMigration[2]) < migration.folderMillis) {
          for (const stmt of migration.sql) {
            await tx.run(sql.raw(stmt));
          }
          await tx.run(
            sql`INSERT INTO ${sql.identifier(migrationsTable)} ("hash", "created_at") VALUES(${migration.hash}, ${migration.folderMillis})`
          );
        }
      }
    });
  }
}

class TypedQueryBuilder {
  static [entityKind] = "TypedQueryBuilder";
  /** @internal */
  getSelectedFields() {
    return this._.selectedFields;
  }
}

class SQLiteSelectBuilder {
  static [entityKind] = "SQLiteSelectBuilder";
  fields;
  session;
  dialect;
  withList;
  distinct;
  constructor(config) {
    this.fields = config.fields;
    this.session = config.session;
    this.dialect = config.dialect;
    this.withList = config.withList;
    this.distinct = config.distinct;
  }
  from(source) {
    const isPartialSelect = !!this.fields;
    let fields;
    if (this.fields) {
      fields = this.fields;
    } else if (is(source, Subquery)) {
      fields = Object.fromEntries(
        Object.keys(source[SubqueryConfig].selection).map((key) => [key, source[key]])
      );
    } else if (is(source, SQLiteViewBase)) {
      fields = source[ViewBaseConfig].selectedFields;
    } else if (is(source, SQL)) {
      fields = {};
    } else {
      fields = getTableColumns(source);
    }
    return new SQLiteSelectBase({
      table: source,
      fields,
      isPartialSelect,
      session: this.session,
      dialect: this.dialect,
      withList: this.withList,
      distinct: this.distinct
    });
  }
}
class SQLiteSelectQueryBuilderBase extends TypedQueryBuilder {
  static [entityKind] = "SQLiteSelectQueryBuilder";
  _;
  /** @internal */
  config;
  joinsNotNullableMap;
  tableName;
  isPartialSelect;
  session;
  dialect;
  constructor({ table, fields, isPartialSelect, session, dialect, withList, distinct }) {
    super();
    this.config = {
      withList,
      table,
      fields: { ...fields },
      distinct,
      setOperators: []
    };
    this.isPartialSelect = isPartialSelect;
    this.session = session;
    this.dialect = dialect;
    this._ = {
      selectedFields: fields
    };
    this.tableName = getTableLikeName(table);
    this.joinsNotNullableMap = typeof this.tableName === "string" ? { [this.tableName]: true } : {};
  }
  createJoin(joinType) {
    return (table, on) => {
      const baseTableName = this.tableName;
      const tableName = getTableLikeName(table);
      if (typeof tableName === "string" && this.config.joins?.some((join) => join.alias === tableName)) {
        throw new Error(`Alias "${tableName}" is already used in this query`);
      }
      if (!this.isPartialSelect) {
        if (Object.keys(this.joinsNotNullableMap).length === 1 && typeof baseTableName === "string") {
          this.config.fields = {
            [baseTableName]: this.config.fields
          };
        }
        if (typeof tableName === "string" && !is(table, SQL)) {
          const selection = is(table, Subquery) ? table[SubqueryConfig].selection : is(table, View) ? table[ViewBaseConfig].selectedFields : table[Table.Symbol.Columns];
          this.config.fields[tableName] = selection;
        }
      }
      if (typeof on === "function") {
        on = on(
          new Proxy(
            this.config.fields,
            new SelectionProxyHandler({ sqlAliasedBehavior: "sql", sqlBehavior: "sql" })
          )
        );
      }
      if (!this.config.joins) {
        this.config.joins = [];
      }
      this.config.joins.push({ on, table, joinType, alias: tableName });
      if (typeof tableName === "string") {
        switch (joinType) {
          case "left": {
            this.joinsNotNullableMap[tableName] = false;
            break;
          }
          case "right": {
            this.joinsNotNullableMap = Object.fromEntries(
              Object.entries(this.joinsNotNullableMap).map(([key]) => [key, false])
            );
            this.joinsNotNullableMap[tableName] = true;
            break;
          }
          case "inner": {
            this.joinsNotNullableMap[tableName] = true;
            break;
          }
          case "full": {
            this.joinsNotNullableMap = Object.fromEntries(
              Object.entries(this.joinsNotNullableMap).map(([key]) => [key, false])
            );
            this.joinsNotNullableMap[tableName] = false;
            break;
          }
        }
      }
      return this;
    };
  }
  /**
   * Executes a `left join` operation by adding another table to the current query.
   *
   * Calling this method associates each row of the table with the corresponding row from the joined table, if a match is found. If no matching row exists, it sets all columns of the joined table to null.
   *
   * See docs: {@link https://orm.drizzle.team/docs/joins#left-join}
   *
   * @param table the table to join.
   * @param on the `on` clause.
   *
   * @example
   *
   * ```ts
   * // Select all users and their pets
   * const usersWithPets: { user: User; pets: Pet | null }[] = await db.select()
   *   .from(users)
   *   .leftJoin(pets, eq(users.id, pets.ownerId))
   *
   * // Select userId and petId
   * const usersIdsAndPetIds: { userId: number; petId: number | null }[] = await db.select({
   *   userId: users.id,
   *   petId: pets.id,
   * })
   *   .from(users)
   *   .leftJoin(pets, eq(users.id, pets.ownerId))
   * ```
   */
  leftJoin = this.createJoin("left");
  /**
   * Executes a `right join` operation by adding another table to the current query.
   *
   * Calling this method associates each row of the joined table with the corresponding row from the main table, if a match is found. If no matching row exists, it sets all columns of the main table to null.
   *
   * See docs: {@link https://orm.drizzle.team/docs/joins#right-join}
   *
   * @param table the table to join.
   * @param on the `on` clause.
   *
   * @example
   *
   * ```ts
   * // Select all users and their pets
   * const usersWithPets: { user: User | null; pets: Pet }[] = await db.select()
   *   .from(users)
   *   .rightJoin(pets, eq(users.id, pets.ownerId))
   *
   * // Select userId and petId
   * const usersIdsAndPetIds: { userId: number | null; petId: number }[] = await db.select({
   *   userId: users.id,
   *   petId: pets.id,
   * })
   *   .from(users)
   *   .rightJoin(pets, eq(users.id, pets.ownerId))
   * ```
   */
  rightJoin = this.createJoin("right");
  /**
   * Executes an `inner join` operation, creating a new table by combining rows from two tables that have matching values.
   *
   * Calling this method retrieves rows that have corresponding entries in both joined tables. Rows without matching entries in either table are excluded, resulting in a table that includes only matching pairs.
   *
   * See docs: {@link https://orm.drizzle.team/docs/joins#inner-join}
   *
   * @param table the table to join.
   * @param on the `on` clause.
   *
   * @example
   *
   * ```ts
   * // Select all users and their pets
   * const usersWithPets: { user: User; pets: Pet }[] = await db.select()
   *   .from(users)
   *   .innerJoin(pets, eq(users.id, pets.ownerId))
   *
   * // Select userId and petId
   * const usersIdsAndPetIds: { userId: number; petId: number }[] = await db.select({
   *   userId: users.id,
   *   petId: pets.id,
   * })
   *   .from(users)
   *   .innerJoin(pets, eq(users.id, pets.ownerId))
   * ```
   */
  innerJoin = this.createJoin("inner");
  /**
   * Executes a `full join` operation by combining rows from two tables into a new table.
   *
   * Calling this method retrieves all rows from both main and joined tables, merging rows with matching values and filling in `null` for non-matching columns.
   *
   * See docs: {@link https://orm.drizzle.team/docs/joins#full-join}
   *
   * @param table the table to join.
   * @param on the `on` clause.
   *
   * @example
   *
   * ```ts
   * // Select all users and their pets
   * const usersWithPets: { user: User | null; pets: Pet | null }[] = await db.select()
   *   .from(users)
   *   .fullJoin(pets, eq(users.id, pets.ownerId))
   *
   * // Select userId and petId
   * const usersIdsAndPetIds: { userId: number | null; petId: number | null }[] = await db.select({
   *   userId: users.id,
   *   petId: pets.id,
   * })
   *   .from(users)
   *   .fullJoin(pets, eq(users.id, pets.ownerId))
   * ```
   */
  fullJoin = this.createJoin("full");
  createSetOperator(type, isAll) {
    return (rightSelection) => {
      const rightSelect = typeof rightSelection === "function" ? rightSelection(getSQLiteSetOperators()) : rightSelection;
      if (!haveSameKeys(this.getSelectedFields(), rightSelect.getSelectedFields())) {
        throw new Error(
          "Set operator error (union / intersect / except): selected fields are not the same or are in a different order"
        );
      }
      this.config.setOperators.push({ type, isAll, rightSelect });
      return this;
    };
  }
  /**
   * Adds `union` set operator to the query.
   *
   * Calling this method will combine the result sets of the `select` statements and remove any duplicate rows that appear across them.
   *
   * See docs: {@link https://orm.drizzle.team/docs/set-operations#union}
   *
   * @example
   *
   * ```ts
   * // Select all unique names from customers and users tables
   * await db.select({ name: users.name })
   *   .from(users)
   *   .union(
   *     db.select({ name: customers.name }).from(customers)
   *   );
   * // or
   * import { union } from 'drizzle-orm/sqlite-core'
   *
   * await union(
   *   db.select({ name: users.name }).from(users),
   *   db.select({ name: customers.name }).from(customers)
   * );
   * ```
   */
  union = this.createSetOperator("union", false);
  /**
   * Adds `union all` set operator to the query.
   *
   * Calling this method will combine the result-set of the `select` statements and keep all duplicate rows that appear across them.
   *
   * See docs: {@link https://orm.drizzle.team/docs/set-operations#union-all}
   *
   * @example
   *
   * ```ts
   * // Select all transaction ids from both online and in-store sales
   * await db.select({ transaction: onlineSales.transactionId })
   *   .from(onlineSales)
   *   .unionAll(
   *     db.select({ transaction: inStoreSales.transactionId }).from(inStoreSales)
   *   );
   * // or
   * import { unionAll } from 'drizzle-orm/sqlite-core'
   *
   * await unionAll(
   *   db.select({ transaction: onlineSales.transactionId }).from(onlineSales),
   *   db.select({ transaction: inStoreSales.transactionId }).from(inStoreSales)
   * );
   * ```
   */
  unionAll = this.createSetOperator("union", true);
  /**
   * Adds `intersect` set operator to the query.
   *
   * Calling this method will retain only the rows that are present in both result sets and eliminate duplicates.
   *
   * See docs: {@link https://orm.drizzle.team/docs/set-operations#intersect}
   *
   * @example
   *
   * ```ts
   * // Select course names that are offered in both departments A and B
   * await db.select({ courseName: depA.courseName })
   *   .from(depA)
   *   .intersect(
   *     db.select({ courseName: depB.courseName }).from(depB)
   *   );
   * // or
   * import { intersect } from 'drizzle-orm/sqlite-core'
   *
   * await intersect(
   *   db.select({ courseName: depA.courseName }).from(depA),
   *   db.select({ courseName: depB.courseName }).from(depB)
   * );
   * ```
   */
  intersect = this.createSetOperator("intersect", false);
  /**
   * Adds `except` set operator to the query.
   *
   * Calling this method will retrieve all unique rows from the left query, except for the rows that are present in the result set of the right query.
   *
   * See docs: {@link https://orm.drizzle.team/docs/set-operations#except}
   *
   * @example
   *
   * ```ts
   * // Select all courses offered in department A but not in department B
   * await db.select({ courseName: depA.courseName })
   *   .from(depA)
   *   .except(
   *     db.select({ courseName: depB.courseName }).from(depB)
   *   );
   * // or
   * import { except } from 'drizzle-orm/sqlite-core'
   *
   * await except(
   *   db.select({ courseName: depA.courseName }).from(depA),
   *   db.select({ courseName: depB.courseName }).from(depB)
   * );
   * ```
   */
  except = this.createSetOperator("except", false);
  /** @internal */
  addSetOperators(setOperators) {
    this.config.setOperators.push(...setOperators);
    return this;
  }
  /**
   * Adds a `where` clause to the query.
   *
   * Calling this method will select only those rows that fulfill a specified condition.
   *
   * See docs: {@link https://orm.drizzle.team/docs/select#filtering}
   *
   * @param where the `where` clause.
   *
   * @example
   * You can use conditional operators and `sql function` to filter the rows to be selected.
   *
   * ```ts
   * // Select all cars with green color
   * await db.select().from(cars).where(eq(cars.color, 'green'));
   * // or
   * await db.select().from(cars).where(sql`${cars.color} = 'green'`)
   * ```
   *
   * You can logically combine conditional operators with `and()` and `or()` operators:
   *
   * ```ts
   * // Select all BMW cars with a green color
   * await db.select().from(cars).where(and(eq(cars.color, 'green'), eq(cars.brand, 'BMW')));
   *
   * // Select all cars with the green or blue color
   * await db.select().from(cars).where(or(eq(cars.color, 'green'), eq(cars.color, 'blue')));
   * ```
   */
  where(where) {
    if (typeof where === "function") {
      where = where(
        new Proxy(
          this.config.fields,
          new SelectionProxyHandler({ sqlAliasedBehavior: "sql", sqlBehavior: "sql" })
        )
      );
    }
    this.config.where = where;
    return this;
  }
  /**
   * Adds a `having` clause to the query.
   *
   * Calling this method will select only those rows that fulfill a specified condition. It is typically used with aggregate functions to filter the aggregated data based on a specified condition.
   *
   * See docs: {@link https://orm.drizzle.team/docs/select#aggregations}
   *
   * @param having the `having` clause.
   *
   * @example
   *
   * ```ts
   * // Select all brands with more than one car
   * await db.select({
   * 	brand: cars.brand,
   * 	count: sql<number>`cast(count(${cars.id}) as int)`,
   * })
   *   .from(cars)
   *   .groupBy(cars.brand)
   *   .having(({ count }) => gt(count, 1));
   * ```
   */
  having(having) {
    if (typeof having === "function") {
      having = having(
        new Proxy(
          this.config.fields,
          new SelectionProxyHandler({ sqlAliasedBehavior: "sql", sqlBehavior: "sql" })
        )
      );
    }
    this.config.having = having;
    return this;
  }
  groupBy(...columns) {
    if (typeof columns[0] === "function") {
      const groupBy = columns[0](
        new Proxy(
          this.config.fields,
          new SelectionProxyHandler({ sqlAliasedBehavior: "alias", sqlBehavior: "sql" })
        )
      );
      this.config.groupBy = Array.isArray(groupBy) ? groupBy : [groupBy];
    } else {
      this.config.groupBy = columns;
    }
    return this;
  }
  orderBy(...columns) {
    if (typeof columns[0] === "function") {
      const orderBy = columns[0](
        new Proxy(
          this.config.fields,
          new SelectionProxyHandler({ sqlAliasedBehavior: "alias", sqlBehavior: "sql" })
        )
      );
      const orderByArray = Array.isArray(orderBy) ? orderBy : [orderBy];
      if (this.config.setOperators.length > 0) {
        this.config.setOperators.at(-1).orderBy = orderByArray;
      } else {
        this.config.orderBy = orderByArray;
      }
    } else {
      const orderByArray = columns;
      if (this.config.setOperators.length > 0) {
        this.config.setOperators.at(-1).orderBy = orderByArray;
      } else {
        this.config.orderBy = orderByArray;
      }
    }
    return this;
  }
  /**
   * Adds a `limit` clause to the query.
   *
   * Calling this method will set the maximum number of rows that will be returned by this query.
   *
   * See docs: {@link https://orm.drizzle.team/docs/select#limit--offset}
   *
   * @param limit the `limit` clause.
   *
   * @example
   *
   * ```ts
   * // Get the first 10 people from this query.
   * await db.select().from(people).limit(10);
   * ```
   */
  limit(limit) {
    if (this.config.setOperators.length > 0) {
      this.config.setOperators.at(-1).limit = limit;
    } else {
      this.config.limit = limit;
    }
    return this;
  }
  /**
   * Adds an `offset` clause to the query.
   *
   * Calling this method will skip a number of rows when returning results from this query.
   *
   * See docs: {@link https://orm.drizzle.team/docs/select#limit--offset}
   *
   * @param offset the `offset` clause.
   *
   * @example
   *
   * ```ts
   * // Get the 10th-20th people from this query.
   * await db.select().from(people).offset(10).limit(10);
   * ```
   */
  offset(offset) {
    if (this.config.setOperators.length > 0) {
      this.config.setOperators.at(-1).offset = offset;
    } else {
      this.config.offset = offset;
    }
    return this;
  }
  /** @internal */
  getSQL() {
    return this.dialect.buildSelectQuery(this.config);
  }
  toSQL() {
    const { typings: _typings, ...rest } = this.dialect.sqlToQuery(this.getSQL());
    return rest;
  }
  as(alias) {
    return new Proxy(
      new Subquery(this.getSQL(), this.config.fields, alias),
      new SelectionProxyHandler({ alias, sqlAliasedBehavior: "alias", sqlBehavior: "error" })
    );
  }
  /** @internal */
  getSelectedFields() {
    return new Proxy(
      this.config.fields,
      new SelectionProxyHandler({ alias: this.tableName, sqlAliasedBehavior: "alias", sqlBehavior: "error" })
    );
  }
  $dynamic() {
    return this;
  }
}
class SQLiteSelectBase extends SQLiteSelectQueryBuilderBase {
  static [entityKind] = "SQLiteSelect";
  /** @internal */
  _prepare(isOneTimeQuery = true) {
    if (!this.session) {
      throw new Error("Cannot execute a query on a query builder. Please use a database instance instead.");
    }
    const fieldsList = orderSelectedFields(this.config.fields);
    const query = this.session[isOneTimeQuery ? "prepareOneTimeQuery" : "prepareQuery"](
      this.dialect.sqlToQuery(this.getSQL()),
      fieldsList,
      "all"
    );
    query.joinsNotNullableMap = this.joinsNotNullableMap;
    return query;
  }
  prepare() {
    return this._prepare(false);
  }
  run = (placeholderValues) => {
    return this._prepare().run(placeholderValues);
  };
  all = (placeholderValues) => {
    return this._prepare().all(placeholderValues);
  };
  get = (placeholderValues) => {
    return this._prepare().get(placeholderValues);
  };
  values = (placeholderValues) => {
    return this._prepare().values(placeholderValues);
  };
  async execute() {
    return this.all();
  }
}
applyMixins(SQLiteSelectBase, [QueryPromise]);
function createSetOperator(type, isAll) {
  return (leftSelect, rightSelect, ...restSelects) => {
    const setOperators = [rightSelect, ...restSelects].map((select) => ({
      type,
      isAll,
      rightSelect: select
    }));
    for (const setOperator of setOperators) {
      if (!haveSameKeys(leftSelect.getSelectedFields(), setOperator.rightSelect.getSelectedFields())) {
        throw new Error(
          "Set operator error (union / intersect / except): selected fields are not the same or are in a different order"
        );
      }
    }
    return leftSelect.addSetOperators(setOperators);
  };
}
const getSQLiteSetOperators = () => ({
  union,
  unionAll,
  intersect,
  except
});
const union = createSetOperator("union", false);
const unionAll = createSetOperator("union", true);
const intersect = createSetOperator("intersect", false);
const except = createSetOperator("except", false);

class QueryBuilder {
  static [entityKind] = "SQLiteQueryBuilder";
  dialect;
  $with(alias) {
    const queryBuilder = this;
    return {
      as(qb) {
        if (typeof qb === "function") {
          qb = qb(queryBuilder);
        }
        return new Proxy(
          new WithSubquery(qb.getSQL(), qb.getSelectedFields(), alias, true),
          new SelectionProxyHandler({ alias, sqlAliasedBehavior: "alias", sqlBehavior: "error" })
        );
      }
    };
  }
  with(...queries) {
    const self = this;
    function select(fields) {
      return new SQLiteSelectBuilder({
        fields: fields ?? void 0,
        session: void 0,
        dialect: self.getDialect(),
        withList: queries
      });
    }
    function selectDistinct(fields) {
      return new SQLiteSelectBuilder({
        fields: fields ?? void 0,
        session: void 0,
        dialect: self.getDialect(),
        withList: queries,
        distinct: true
      });
    }
    return { select, selectDistinct };
  }
  select(fields) {
    return new SQLiteSelectBuilder({ fields: fields ?? void 0, session: void 0, dialect: this.getDialect() });
  }
  selectDistinct(fields) {
    return new SQLiteSelectBuilder({
      fields: fields ?? void 0,
      session: void 0,
      dialect: this.getDialect(),
      distinct: true
    });
  }
  // Lazy load dialect to avoid circular dependency
  getDialect() {
    if (!this.dialect) {
      this.dialect = new SQLiteSyncDialect();
    }
    return this.dialect;
  }
}

class SQLiteUpdateBuilder {
  constructor(table, session, dialect, withList) {
    this.table = table;
    this.session = session;
    this.dialect = dialect;
    this.withList = withList;
  }
  static [entityKind] = "SQLiteUpdateBuilder";
  set(values) {
    return new SQLiteUpdateBase(
      this.table,
      mapUpdateSet(this.table, values),
      this.session,
      this.dialect,
      this.withList
    );
  }
}
class SQLiteUpdateBase extends QueryPromise {
  constructor(table, set, session, dialect, withList) {
    super();
    this.session = session;
    this.dialect = dialect;
    this.config = { set, table, withList };
  }
  static [entityKind] = "SQLiteUpdate";
  /** @internal */
  config;
  /**
   * Adds a 'where' clause to the query.
   *
   * Calling this method will update only those rows that fulfill a specified condition.
   *
   * See docs: {@link https://orm.drizzle.team/docs/update}
   *
   * @param where the 'where' clause.
   *
   * @example
   * You can use conditional operators and `sql function` to filter the rows to be updated.
   *
   * ```ts
   * // Update all cars with green color
   * db.update(cars).set({ color: 'red' })
   *   .where(eq(cars.color, 'green'));
   * // or
   * db.update(cars).set({ color: 'red' })
   *   .where(sql`${cars.color} = 'green'`)
   * ```
   *
   * You can logically combine conditional operators with `and()` and `or()` operators:
   *
   * ```ts
   * // Update all BMW cars with a green color
   * db.update(cars).set({ color: 'red' })
   *   .where(and(eq(cars.color, 'green'), eq(cars.brand, 'BMW')));
   *
   * // Update all cars with the green or blue color
   * db.update(cars).set({ color: 'red' })
   *   .where(or(eq(cars.color, 'green'), eq(cars.color, 'blue')));
   * ```
   */
  where(where) {
    this.config.where = where;
    return this;
  }
  returning(fields = this.config.table[SQLiteTable.Symbol.Columns]) {
    this.config.returning = orderSelectedFields(fields);
    return this;
  }
  /** @internal */
  getSQL() {
    return this.dialect.buildUpdateQuery(this.config);
  }
  toSQL() {
    const { typings: _typings, ...rest } = this.dialect.sqlToQuery(this.getSQL());
    return rest;
  }
  /** @internal */
  _prepare(isOneTimeQuery = true) {
    return this.session[isOneTimeQuery ? "prepareOneTimeQuery" : "prepareQuery"](
      this.dialect.sqlToQuery(this.getSQL()),
      this.config.returning,
      this.config.returning ? "all" : "run"
    );
  }
  prepare() {
    return this._prepare(false);
  }
  run = (placeholderValues) => {
    return this._prepare().run(placeholderValues);
  };
  all = (placeholderValues) => {
    return this._prepare().all(placeholderValues);
  };
  get = (placeholderValues) => {
    return this._prepare().get(placeholderValues);
  };
  values = (placeholderValues) => {
    return this._prepare().values(placeholderValues);
  };
  async execute() {
    return this.config.returning ? this.all() : this.run();
  }
  $dynamic() {
    return this;
  }
}

class RelationalQueryBuilder {
  constructor(mode, fullSchema, schema, tableNamesMap, table, tableConfig, dialect, session) {
    this.mode = mode;
    this.fullSchema = fullSchema;
    this.schema = schema;
    this.tableNamesMap = tableNamesMap;
    this.table = table;
    this.tableConfig = tableConfig;
    this.dialect = dialect;
    this.session = session;
  }
  static [entityKind] = "SQLiteAsyncRelationalQueryBuilder";
  findMany(config) {
    return this.mode === "sync" ? new SQLiteSyncRelationalQuery(
      this.fullSchema,
      this.schema,
      this.tableNamesMap,
      this.table,
      this.tableConfig,
      this.dialect,
      this.session,
      config ? config : {},
      "many"
    ) : new SQLiteRelationalQuery(
      this.fullSchema,
      this.schema,
      this.tableNamesMap,
      this.table,
      this.tableConfig,
      this.dialect,
      this.session,
      config ? config : {},
      "many"
    );
  }
  findFirst(config) {
    return this.mode === "sync" ? new SQLiteSyncRelationalQuery(
      this.fullSchema,
      this.schema,
      this.tableNamesMap,
      this.table,
      this.tableConfig,
      this.dialect,
      this.session,
      config ? { ...config, limit: 1 } : { limit: 1 },
      "first"
    ) : new SQLiteRelationalQuery(
      this.fullSchema,
      this.schema,
      this.tableNamesMap,
      this.table,
      this.tableConfig,
      this.dialect,
      this.session,
      config ? { ...config, limit: 1 } : { limit: 1 },
      "first"
    );
  }
}
class SQLiteRelationalQuery extends QueryPromise {
  constructor(fullSchema, schema, tableNamesMap, table, tableConfig, dialect, session, config, mode) {
    super();
    this.fullSchema = fullSchema;
    this.schema = schema;
    this.tableNamesMap = tableNamesMap;
    this.table = table;
    this.tableConfig = tableConfig;
    this.dialect = dialect;
    this.session = session;
    this.config = config;
    this.mode = mode;
  }
  static [entityKind] = "SQLiteAsyncRelationalQuery";
  /** @internal */
  mode;
  /** @internal */
  getSQL() {
    return this.dialect.buildRelationalQuery({
      fullSchema: this.fullSchema,
      schema: this.schema,
      tableNamesMap: this.tableNamesMap,
      table: this.table,
      tableConfig: this.tableConfig,
      queryConfig: this.config,
      tableAlias: this.tableConfig.tsName
    }).sql;
  }
  /** @internal */
  _prepare(isOneTimeQuery = false) {
    const { query, builtQuery } = this._toSQL();
    return this.session[isOneTimeQuery ? "prepareOneTimeQuery" : "prepareQuery"](
      builtQuery,
      void 0,
      this.mode === "first" ? "get" : "all",
      (rawRows, mapColumnValue) => {
        const rows = rawRows.map(
          (row) => mapRelationalRow(this.schema, this.tableConfig, row, query.selection, mapColumnValue)
        );
        if (this.mode === "first") {
          return rows[0];
        }
        return rows;
      }
    );
  }
  prepare() {
    return this._prepare(false);
  }
  _toSQL() {
    const query = this.dialect.buildRelationalQuery({
      fullSchema: this.fullSchema,
      schema: this.schema,
      tableNamesMap: this.tableNamesMap,
      table: this.table,
      tableConfig: this.tableConfig,
      queryConfig: this.config,
      tableAlias: this.tableConfig.tsName
    });
    const builtQuery = this.dialect.sqlToQuery(query.sql);
    return { query, builtQuery };
  }
  toSQL() {
    return this._toSQL().builtQuery;
  }
  /** @internal */
  executeRaw() {
    if (this.mode === "first") {
      return this._prepare(false).get();
    }
    return this._prepare(false).all();
  }
  async execute() {
    return this.executeRaw();
  }
}
class SQLiteSyncRelationalQuery extends SQLiteRelationalQuery {
  static [entityKind] = "SQLiteSyncRelationalQuery";
  sync() {
    return this.executeRaw();
  }
}

class SQLiteRaw extends QueryPromise {
  constructor(execute, getSQL, action, dialect, mapBatchResult) {
    super();
    this.execute = execute;
    this.getSQL = getSQL;
    this.dialect = dialect;
    this.mapBatchResult = mapBatchResult;
    this.config = { action };
  }
  static [entityKind] = "SQLiteRaw";
  /** @internal */
  config;
  getQuery() {
    return { ...this.dialect.sqlToQuery(this.getSQL()), method: this.config.action };
  }
  mapResult(result, isFromBatch) {
    return isFromBatch ? this.mapBatchResult(result) : result;
  }
  _prepare() {
    return this;
  }
}

class BaseSQLiteDatabase {
  constructor(resultKind, dialect, session, schema) {
    this.resultKind = resultKind;
    this.dialect = dialect;
    this.session = session;
    this._ = schema ? { schema: schema.schema, tableNamesMap: schema.tableNamesMap } : { schema: void 0, tableNamesMap: {} };
    this.query = {};
    const query = this.query;
    if (this._.schema) {
      for (const [tableName, columns] of Object.entries(this._.schema)) {
        query[tableName] = new RelationalQueryBuilder(
          resultKind,
          schema.fullSchema,
          this._.schema,
          this._.tableNamesMap,
          schema.fullSchema[tableName],
          columns,
          dialect,
          session
        );
      }
    }
  }
  static [entityKind] = "BaseSQLiteDatabase";
  query;
  /**
   * Creates a subquery that defines a temporary named result set as a CTE.
   *
   * It is useful for breaking down complex queries into simpler parts and for reusing the result set in subsequent parts of the query.
   *
   * See docs: {@link https://orm.drizzle.team/docs/select#with-clause}
   *
   * @param alias The alias for the subquery.
   *
   * Failure to provide an alias will result in a DrizzleTypeError, preventing the subquery from being referenced in other queries.
   *
   * @example
   *
   * ```ts
   * // Create a subquery with alias 'sq' and use it in the select query
   * const sq = db.$with('sq').as(db.select().from(users).where(eq(users.id, 42)));
   *
   * const result = await db.with(sq).select().from(sq);
   * ```
   *
   * To select arbitrary SQL values as fields in a CTE and reference them in other CTEs or in the main query, you need to add aliases to them:
   *
   * ```ts
   * // Select an arbitrary SQL value as a field in a CTE and reference it in the main query
   * const sq = db.$with('sq').as(db.select({
   *   name: sql<string>`upper(${users.name})`.as('name'),
   * })
   * .from(users));
   *
   * const result = await db.with(sq).select({ name: sq.name }).from(sq);
   * ```
   */
  $with(alias) {
    return {
      as(qb) {
        if (typeof qb === "function") {
          qb = qb(new QueryBuilder());
        }
        return new Proxy(
          new WithSubquery(qb.getSQL(), qb.getSelectedFields(), alias, true),
          new SelectionProxyHandler({ alias, sqlAliasedBehavior: "alias", sqlBehavior: "error" })
        );
      }
    };
  }
  /**
   * Incorporates a previously defined CTE (using `$with`) into the main query.
   *
   * This method allows the main query to reference a temporary named result set.
   *
   * See docs: {@link https://orm.drizzle.team/docs/select#with-clause}
   *
   * @param queries The CTEs to incorporate into the main query.
   *
   * @example
   *
   * ```ts
   * // Define a subquery 'sq' as a CTE using $with
   * const sq = db.$with('sq').as(db.select().from(users).where(eq(users.id, 42)));
   *
   * // Incorporate the CTE 'sq' into the main query and select from it
   * const result = await db.with(sq).select().from(sq);
   * ```
   */
  with(...queries) {
    const self = this;
    function select(fields) {
      return new SQLiteSelectBuilder({
        fields: fields ?? void 0,
        session: self.session,
        dialect: self.dialect,
        withList: queries
      });
    }
    function selectDistinct(fields) {
      return new SQLiteSelectBuilder({
        fields: fields ?? void 0,
        session: self.session,
        dialect: self.dialect,
        withList: queries,
        distinct: true
      });
    }
    function update(table) {
      return new SQLiteUpdateBuilder(table, self.session, self.dialect, queries);
    }
    function insert(into) {
      return new SQLiteInsertBuilder(into, self.session, self.dialect, queries);
    }
    function delete_(from) {
      return new SQLiteDeleteBase(from, self.session, self.dialect, queries);
    }
    return { select, selectDistinct, update, insert, delete: delete_ };
  }
  select(fields) {
    return new SQLiteSelectBuilder({ fields: fields ?? void 0, session: this.session, dialect: this.dialect });
  }
  selectDistinct(fields) {
    return new SQLiteSelectBuilder({
      fields: fields ?? void 0,
      session: this.session,
      dialect: this.dialect,
      distinct: true
    });
  }
  /**
   * Creates an update query.
   *
   * Calling this method without `.where()` clause will update all rows in a table. The `.where()` clause specifies which rows should be updated.
   *
   * Use `.set()` method to specify which values to update.
   *
   * See docs: {@link https://orm.drizzle.team/docs/update}
   *
   * @param table The table to update.
   *
   * @example
   *
   * ```ts
   * // Update all rows in the 'cars' table
   * await db.update(cars).set({ color: 'red' });
   *
   * // Update rows with filters and conditions
   * await db.update(cars).set({ color: 'red' }).where(eq(cars.brand, 'BMW'));
   *
   * // Update with returning clause
   * const updatedCar: Car[] = await db.update(cars)
   *   .set({ color: 'red' })
   *   .where(eq(cars.id, 1))
   *   .returning();
   * ```
   */
  update(table) {
    return new SQLiteUpdateBuilder(table, this.session, this.dialect);
  }
  /**
   * Creates an insert query.
   *
   * Calling this method will create new rows in a table. Use `.values()` method to specify which values to insert.
   *
   * See docs: {@link https://orm.drizzle.team/docs/insert}
   *
   * @param table The table to insert into.
   *
   * @example
   *
   * ```ts
   * // Insert one row
   * await db.insert(cars).values({ brand: 'BMW' });
   *
   * // Insert multiple rows
   * await db.insert(cars).values([{ brand: 'BMW' }, { brand: 'Porsche' }]);
   *
   * // Insert with returning clause
   * const insertedCar: Car[] = await db.insert(cars)
   *   .values({ brand: 'BMW' })
   *   .returning();
   * ```
   */
  insert(into) {
    return new SQLiteInsertBuilder(into, this.session, this.dialect);
  }
  /**
   * Creates a delete query.
   *
   * Calling this method without `.where()` clause will delete all rows in a table. The `.where()` clause specifies which rows should be deleted.
   *
   * See docs: {@link https://orm.drizzle.team/docs/delete}
   *
   * @param table The table to delete from.
   *
   * @example
   *
   * ```ts
   * // Delete all rows in the 'cars' table
   * await db.delete(cars);
   *
   * // Delete rows with filters and conditions
   * await db.delete(cars).where(eq(cars.color, 'green'));
   *
   * // Delete with returning clause
   * const deletedCar: Car[] = await db.delete(cars)
   *   .where(eq(cars.id, 1))
   *   .returning();
   * ```
   */
  delete(from) {
    return new SQLiteDeleteBase(from, this.session, this.dialect);
  }
  run(query) {
    const sql = query.getSQL();
    if (this.resultKind === "async") {
      return new SQLiteRaw(
        async () => this.session.run(sql),
        () => sql,
        "run",
        this.dialect,
        this.session.extractRawRunValueFromBatchResult.bind(this.session)
      );
    }
    return this.session.run(sql);
  }
  all(query) {
    const sql = query.getSQL();
    if (this.resultKind === "async") {
      return new SQLiteRaw(
        async () => this.session.all(sql),
        () => sql,
        "all",
        this.dialect,
        this.session.extractRawAllValueFromBatchResult.bind(this.session)
      );
    }
    return this.session.all(sql);
  }
  get(query) {
    const sql = query.getSQL();
    if (this.resultKind === "async") {
      return new SQLiteRaw(
        async () => this.session.get(sql),
        () => sql,
        "get",
        this.dialect,
        this.session.extractRawGetValueFromBatchResult.bind(this.session)
      );
    }
    return this.session.get(sql);
  }
  values(query) {
    const sql = query.getSQL();
    if (this.resultKind === "async") {
      return new SQLiteRaw(
        async () => this.session.values(sql),
        () => sql,
        "values",
        this.dialect,
        this.session.extractRawValuesValueFromBatchResult.bind(this.session)
      );
    }
    return this.session.values(sql);
  }
  transaction(transaction, config) {
    return this.session.transaction(transaction, config);
  }
}

class IndexBuilderOn {
  constructor(name, unique) {
    this.name = name;
    this.unique = unique;
  }
  static [entityKind] = "SQLiteIndexBuilderOn";
  on(...columns) {
    return new IndexBuilder(this.name, columns, this.unique);
  }
}
class IndexBuilder {
  static [entityKind] = "SQLiteIndexBuilder";
  /** @internal */
  config;
  constructor(name, columns, unique) {
    this.config = {
      name,
      columns,
      unique,
      where: void 0
    };
  }
  /**
   * Condition for partial index.
   */
  where(condition) {
    this.config.where = condition;
    return this;
  }
  /** @internal */
  build(table) {
    return new Index(this.config, table);
  }
}
class Index {
  static [entityKind] = "SQLiteIndex";
  config;
  constructor(config, table) {
    this.config = { ...config, table };
  }
}
function index(name) {
  return new IndexBuilderOn(name, false);
}

class ExecuteResultSync extends QueryPromise {
  constructor(resultCb) {
    super();
    this.resultCb = resultCb;
  }
  static [entityKind] = "ExecuteResultSync";
  async execute() {
    return this.resultCb();
  }
  sync() {
    return this.resultCb();
  }
}
class SQLitePreparedQuery {
  constructor(mode, executeMethod, query) {
    this.mode = mode;
    this.executeMethod = executeMethod;
    this.query = query;
  }
  static [entityKind] = "PreparedQuery";
  /** @internal */
  joinsNotNullableMap;
  getQuery() {
    return this.query;
  }
  mapRunResult(result, _isFromBatch) {
    return result;
  }
  mapAllResult(_result, _isFromBatch) {
    throw new Error("Not implemented");
  }
  mapGetResult(_result, _isFromBatch) {
    throw new Error("Not implemented");
  }
  execute(placeholderValues) {
    if (this.mode === "async") {
      return this[this.executeMethod](placeholderValues);
    }
    return new ExecuteResultSync(() => this[this.executeMethod](placeholderValues));
  }
  mapResult(response, isFromBatch) {
    switch (this.executeMethod) {
      case "run": {
        return this.mapRunResult(response, isFromBatch);
      }
      case "all": {
        return this.mapAllResult(response, isFromBatch);
      }
      case "get": {
        return this.mapGetResult(response, isFromBatch);
      }
    }
  }
}
class SQLiteSession {
  constructor(dialect) {
    this.dialect = dialect;
  }
  static [entityKind] = "SQLiteSession";
  prepareOneTimeQuery(query, fields, executeMethod) {
    return this.prepareQuery(query, fields, executeMethod);
  }
  run(query) {
    const staticQuery = this.dialect.sqlToQuery(query);
    try {
      return this.prepareOneTimeQuery(staticQuery, void 0, "run").run();
    } catch (err) {
      throw new DrizzleError({ cause: err, message: `Failed to run the query '${staticQuery.sql}'` });
    }
  }
  /** @internal */
  extractRawRunValueFromBatchResult(result) {
    return result;
  }
  all(query) {
    return this.prepareOneTimeQuery(this.dialect.sqlToQuery(query), void 0, "run").all();
  }
  /** @internal */
  extractRawAllValueFromBatchResult(_result) {
    throw new Error("Not implemented");
  }
  get(query) {
    return this.prepareOneTimeQuery(this.dialect.sqlToQuery(query), void 0, "run").get();
  }
  /** @internal */
  extractRawGetValueFromBatchResult(_result) {
    throw new Error("Not implemented");
  }
  values(query) {
    return this.prepareOneTimeQuery(this.dialect.sqlToQuery(query), void 0, "run").values();
  }
  /** @internal */
  extractRawValuesValueFromBatchResult(_result) {
    throw new Error("Not implemented");
  }
}
class SQLiteTransaction extends BaseSQLiteDatabase {
  constructor(resultType, dialect, session, schema, nestedIndex = 0) {
    super(resultType, dialect, session, schema);
    this.schema = schema;
    this.nestedIndex = nestedIndex;
  }
  static [entityKind] = "SQLiteTransaction";
  rollback() {
    throw new TransactionRollbackError();
  }
}

const SERIALIZED_SQL_KEY = "__serializedSQL";
function isSerializedSQL(value) {
  return typeof value === "object" && value !== null && SERIALIZED_SQL_KEY in value;
}

// queueMicrotask() ponyfill
// https://github.com/libsql/libsql-client-ts/issues/47
if (typeof queueMicrotask !== "undefined") ;
else {
    Promise.resolve();
}

class SQLiteRemoteSession extends SQLiteSession {
  constructor(client, dialect, schema, batchCLient, options = {}) {
    super(dialect);
    this.client = client;
    this.schema = schema;
    this.batchCLient = batchCLient;
    this.logger = options.logger ?? new NoopLogger();
  }
  static [entityKind] = "SQLiteRemoteSession";
  logger;
  prepareQuery(query, fields, executeMethod, customResultMapper) {
    return new RemotePreparedQuery(this.client, query, this.logger, fields, executeMethod, customResultMapper);
  }
  async batch(queries) {
    const preparedQueries = [];
    const builtQueries = [];
    for (const query of queries) {
      const preparedQuery = query._prepare();
      const builtQuery = preparedQuery.getQuery();
      preparedQueries.push(preparedQuery);
      builtQueries.push({ sql: builtQuery.sql, params: builtQuery.params, method: builtQuery.method });
    }
    const batchResults = await this.batchCLient(builtQueries);
    return batchResults.map((result, i) => preparedQueries[i].mapResult(result, true));
  }
  async transaction(transaction, config) {
    const tx = new SQLiteProxyTransaction("async", this.dialect, this, this.schema);
    await this.run(sql.raw(`begin${config?.behavior ? " " + config.behavior : ""}`));
    try {
      const result = await transaction(tx);
      await this.run(sql`commit`);
      return result;
    } catch (err) {
      await this.run(sql`rollback`);
      throw err;
    }
  }
  extractRawAllValueFromBatchResult(result) {
    return result.rows;
  }
  extractRawGetValueFromBatchResult(result) {
    return result.rows[0];
  }
  extractRawValuesValueFromBatchResult(result) {
    return result.rows;
  }
}
class SQLiteProxyTransaction extends SQLiteTransaction {
  static [entityKind] = "SQLiteProxyTransaction";
  async transaction(transaction) {
    const savepointName = `sp${this.nestedIndex}`;
    const tx = new SQLiteProxyTransaction("async", this.dialect, this.session, this.schema, this.nestedIndex + 1);
    await this.session.run(sql.raw(`savepoint ${savepointName}`));
    try {
      const result = await transaction(tx);
      await this.session.run(sql.raw(`release savepoint ${savepointName}`));
      return result;
    } catch (err) {
      await this.session.run(sql.raw(`rollback to savepoint ${savepointName}`));
      throw err;
    }
  }
}
class RemotePreparedQuery extends SQLitePreparedQuery {
  constructor(client, query, logger, fields, executeMethod, customResultMapper) {
    super("async", executeMethod, query);
    this.client = client;
    this.logger = logger;
    this.fields = fields;
    this.customResultMapper = customResultMapper;
    this.customResultMapper = customResultMapper;
    this.method = executeMethod;
  }
  static [entityKind] = "SQLiteProxyPreparedQuery";
  method;
  getQuery() {
    return { ...this.query, method: this.method };
  }
  run(placeholderValues) {
    const params = fillPlaceholders(this.query.params, placeholderValues ?? {});
    this.logger.logQuery(this.query.sql, params);
    return this.client(this.query.sql, params, "run").then((t) => t.rows);
  }
  mapAllResult(rows, isFromBatch) {
    if (isFromBatch) {
      rows = rows.rows;
    }
    if (!this.fields && !this.customResultMapper) {
      return rows;
    }
    if (this.customResultMapper) {
      return this.customResultMapper(rows);
    }
    return rows.map((row) => {
      return mapResultRow(
        this.fields,
        row,
        this.joinsNotNullableMap
      );
    });
  }
  async all(placeholderValues) {
    const { query, logger, client } = this;
    const params = fillPlaceholders(query.params, placeholderValues ?? {});
    logger.logQuery(query.sql, params);
    const { rows } = await client(query.sql, params, "all");
    return this.mapAllResult(rows);
  }
  async get(placeholderValues) {
    const { query, logger, client } = this;
    const params = fillPlaceholders(query.params, placeholderValues ?? {});
    logger.logQuery(query.sql, params);
    const clientResult = await client(query.sql, params, "get");
    return this.mapGetResult(clientResult.rows);
  }
  mapGetResult(rows, isFromBatch) {
    if (isFromBatch) {
      rows = rows.rows;
    }
    const row = rows;
    if (!this.fields && !this.customResultMapper) {
      return row;
    }
    if (!row) {
      return void 0;
    }
    if (this.customResultMapper) {
      return this.customResultMapper([rows]);
    }
    return mapResultRow(
      this.fields,
      row,
      this.joinsNotNullableMap
    );
  }
  async values(placeholderValues) {
    const params = fillPlaceholders(this.query.params, placeholderValues ?? {});
    this.logger.logQuery(this.query.sql, params);
    const clientResult = await this.client(this.query.sql, params, "values");
    return clientResult.rows;
  }
}

class SqliteRemoteDatabase extends BaseSQLiteDatabase {
  static [entityKind] = "SqliteRemoteDatabase";
  async batch(batch) {
    return this.session.batch(batch);
  }
}
function drizzle(callback, batchCallback, config) {
  const dialect = new SQLiteAsyncDialect();
  let logger;
  let _batchCallback;
  let _config = {};
  if (batchCallback) {
    if (typeof batchCallback === "function") {
      _batchCallback = batchCallback;
      _config = config ?? {};
    } else {
      _batchCallback = void 0;
      _config = batchCallback;
    }
    if (_config.logger === true) {
      logger = new DefaultLogger();
    } else if (_config.logger !== false) {
      logger = _config.logger;
    }
  }
  let schema;
  if (_config.schema) {
    const tablesConfig = extractTablesRelationalConfig(
      _config.schema,
      createTableRelationsHelpers
    );
    schema = {
      fullSchema: _config.schema,
      schema: tablesConfig.tables,
      tableNamesMap: tablesConfig.tableNamesMap
    };
  }
  const session = new SQLiteRemoteSession(callback, dialect, schema, _batchCallback, { logger });
  return new SqliteRemoteDatabase("async", dialect, session, schema);
}

var util;
(function (util) {
    util.assertEqual = (val) => val;
    function assertIs(_arg) { }
    util.assertIs = assertIs;
    function assertNever(_x) {
        throw new Error();
    }
    util.assertNever = assertNever;
    util.arrayToEnum = (items) => {
        const obj = {};
        for (const item of items) {
            obj[item] = item;
        }
        return obj;
    };
    util.getValidEnumValues = (obj) => {
        const validKeys = util.objectKeys(obj).filter((k) => typeof obj[obj[k]] !== "number");
        const filtered = {};
        for (const k of validKeys) {
            filtered[k] = obj[k];
        }
        return util.objectValues(filtered);
    };
    util.objectValues = (obj) => {
        return util.objectKeys(obj).map(function (e) {
            return obj[e];
        });
    };
    util.objectKeys = typeof Object.keys === "function" // eslint-disable-line ban/ban
        ? (obj) => Object.keys(obj) // eslint-disable-line ban/ban
        : (object) => {
            const keys = [];
            for (const key in object) {
                if (Object.prototype.hasOwnProperty.call(object, key)) {
                    keys.push(key);
                }
            }
            return keys;
        };
    util.find = (arr, checker) => {
        for (const item of arr) {
            if (checker(item))
                return item;
        }
        return undefined;
    };
    util.isInteger = typeof Number.isInteger === "function"
        ? (val) => Number.isInteger(val) // eslint-disable-line ban/ban
        : (val) => typeof val === "number" && isFinite(val) && Math.floor(val) === val;
    function joinValues(array, separator = " | ") {
        return array
            .map((val) => (typeof val === "string" ? `'${val}'` : val))
            .join(separator);
    }
    util.joinValues = joinValues;
    util.jsonStringifyReplacer = (_, value) => {
        if (typeof value === "bigint") {
            return value.toString();
        }
        return value;
    };
})(util || (util = {}));
var objectUtil;
(function (objectUtil) {
    objectUtil.mergeShapes = (first, second) => {
        return {
            ...first,
            ...second, // second overwrites first
        };
    };
})(objectUtil || (objectUtil = {}));
const ZodParsedType = util.arrayToEnum([
    "string",
    "nan",
    "number",
    "integer",
    "float",
    "boolean",
    "date",
    "bigint",
    "symbol",
    "function",
    "undefined",
    "null",
    "array",
    "object",
    "unknown",
    "promise",
    "void",
    "never",
    "map",
    "set",
]);
const getParsedType = (data) => {
    const t = typeof data;
    switch (t) {
        case "undefined":
            return ZodParsedType.undefined;
        case "string":
            return ZodParsedType.string;
        case "number":
            return isNaN(data) ? ZodParsedType.nan : ZodParsedType.number;
        case "boolean":
            return ZodParsedType.boolean;
        case "function":
            return ZodParsedType.function;
        case "bigint":
            return ZodParsedType.bigint;
        case "symbol":
            return ZodParsedType.symbol;
        case "object":
            if (Array.isArray(data)) {
                return ZodParsedType.array;
            }
            if (data === null) {
                return ZodParsedType.null;
            }
            if (data.then &&
                typeof data.then === "function" &&
                data.catch &&
                typeof data.catch === "function") {
                return ZodParsedType.promise;
            }
            if (typeof Map !== "undefined" && data instanceof Map) {
                return ZodParsedType.map;
            }
            if (typeof Set !== "undefined" && data instanceof Set) {
                return ZodParsedType.set;
            }
            if (typeof Date !== "undefined" && data instanceof Date) {
                return ZodParsedType.date;
            }
            return ZodParsedType.object;
        default:
            return ZodParsedType.unknown;
    }
};

const ZodIssueCode = util.arrayToEnum([
    "invalid_type",
    "invalid_literal",
    "custom",
    "invalid_union",
    "invalid_union_discriminator",
    "invalid_enum_value",
    "unrecognized_keys",
    "invalid_arguments",
    "invalid_return_type",
    "invalid_date",
    "invalid_string",
    "too_small",
    "too_big",
    "invalid_intersection_types",
    "not_multiple_of",
    "not_finite",
]);
const quotelessJson = (obj) => {
    const json = JSON.stringify(obj, null, 2);
    return json.replace(/"([^"]+)":/g, "$1:");
};
class ZodError extends Error {
    constructor(issues) {
        super();
        this.issues = [];
        this.addIssue = (sub) => {
            this.issues = [...this.issues, sub];
        };
        this.addIssues = (subs = []) => {
            this.issues = [...this.issues, ...subs];
        };
        const actualProto = new.target.prototype;
        if (Object.setPrototypeOf) {
            // eslint-disable-next-line ban/ban
            Object.setPrototypeOf(this, actualProto);
        }
        else {
            this.__proto__ = actualProto;
        }
        this.name = "ZodError";
        this.issues = issues;
    }
    get errors() {
        return this.issues;
    }
    format(_mapper) {
        const mapper = _mapper ||
            function (issue) {
                return issue.message;
            };
        const fieldErrors = { _errors: [] };
        const processError = (error) => {
            for (const issue of error.issues) {
                if (issue.code === "invalid_union") {
                    issue.unionErrors.map(processError);
                }
                else if (issue.code === "invalid_return_type") {
                    processError(issue.returnTypeError);
                }
                else if (issue.code === "invalid_arguments") {
                    processError(issue.argumentsError);
                }
                else if (issue.path.length === 0) {
                    fieldErrors._errors.push(mapper(issue));
                }
                else {
                    let curr = fieldErrors;
                    let i = 0;
                    while (i < issue.path.length) {
                        const el = issue.path[i];
                        const terminal = i === issue.path.length - 1;
                        if (!terminal) {
                            curr[el] = curr[el] || { _errors: [] };
                            // if (typeof el === "string") {
                            //   curr[el] = curr[el] || { _errors: [] };
                            // } else if (typeof el === "number") {
                            //   const errorArray: any = [];
                            //   errorArray._errors = [];
                            //   curr[el] = curr[el] || errorArray;
                            // }
                        }
                        else {
                            curr[el] = curr[el] || { _errors: [] };
                            curr[el]._errors.push(mapper(issue));
                        }
                        curr = curr[el];
                        i++;
                    }
                }
            }
        };
        processError(this);
        return fieldErrors;
    }
    toString() {
        return this.message;
    }
    get message() {
        return JSON.stringify(this.issues, util.jsonStringifyReplacer, 2);
    }
    get isEmpty() {
        return this.issues.length === 0;
    }
    flatten(mapper = (issue) => issue.message) {
        const fieldErrors = {};
        const formErrors = [];
        for (const sub of this.issues) {
            if (sub.path.length > 0) {
                fieldErrors[sub.path[0]] = fieldErrors[sub.path[0]] || [];
                fieldErrors[sub.path[0]].push(mapper(sub));
            }
            else {
                formErrors.push(mapper(sub));
            }
        }
        return { formErrors, fieldErrors };
    }
    get formErrors() {
        return this.flatten();
    }
}
ZodError.create = (issues) => {
    const error = new ZodError(issues);
    return error;
};

const errorMap = (issue, _ctx) => {
    let message;
    switch (issue.code) {
        case ZodIssueCode.invalid_type:
            if (issue.received === ZodParsedType.undefined) {
                message = "Required";
            }
            else {
                message = `Expected ${issue.expected}, received ${issue.received}`;
            }
            break;
        case ZodIssueCode.invalid_literal:
            message = `Invalid literal value, expected ${JSON.stringify(issue.expected, util.jsonStringifyReplacer)}`;
            break;
        case ZodIssueCode.unrecognized_keys:
            message = `Unrecognized key(s) in object: ${util.joinValues(issue.keys, ", ")}`;
            break;
        case ZodIssueCode.invalid_union:
            message = `Invalid input`;
            break;
        case ZodIssueCode.invalid_union_discriminator:
            message = `Invalid discriminator value. Expected ${util.joinValues(issue.options)}`;
            break;
        case ZodIssueCode.invalid_enum_value:
            message = `Invalid enum value. Expected ${util.joinValues(issue.options)}, received '${issue.received}'`;
            break;
        case ZodIssueCode.invalid_arguments:
            message = `Invalid function arguments`;
            break;
        case ZodIssueCode.invalid_return_type:
            message = `Invalid function return type`;
            break;
        case ZodIssueCode.invalid_date:
            message = `Invalid date`;
            break;
        case ZodIssueCode.invalid_string:
            if (typeof issue.validation === "object") {
                if ("includes" in issue.validation) {
                    message = `Invalid input: must include "${issue.validation.includes}"`;
                    if (typeof issue.validation.position === "number") {
                        message = `${message} at one or more positions greater than or equal to ${issue.validation.position}`;
                    }
                }
                else if ("startsWith" in issue.validation) {
                    message = `Invalid input: must start with "${issue.validation.startsWith}"`;
                }
                else if ("endsWith" in issue.validation) {
                    message = `Invalid input: must end with "${issue.validation.endsWith}"`;
                }
                else {
                    util.assertNever(issue.validation);
                }
            }
            else if (issue.validation !== "regex") {
                message = `Invalid ${issue.validation}`;
            }
            else {
                message = "Invalid";
            }
            break;
        case ZodIssueCode.too_small:
            if (issue.type === "array")
                message = `Array must contain ${issue.exact ? "exactly" : issue.inclusive ? `at least` : `more than`} ${issue.minimum} element(s)`;
            else if (issue.type === "string")
                message = `String must contain ${issue.exact ? "exactly" : issue.inclusive ? `at least` : `over`} ${issue.minimum} character(s)`;
            else if (issue.type === "number")
                message = `Number must be ${issue.exact
                    ? `exactly equal to `
                    : issue.inclusive
                        ? `greater than or equal to `
                        : `greater than `}${issue.minimum}`;
            else if (issue.type === "date")
                message = `Date must be ${issue.exact
                    ? `exactly equal to `
                    : issue.inclusive
                        ? `greater than or equal to `
                        : `greater than `}${new Date(Number(issue.minimum))}`;
            else
                message = "Invalid input";
            break;
        case ZodIssueCode.too_big:
            if (issue.type === "array")
                message = `Array must contain ${issue.exact ? `exactly` : issue.inclusive ? `at most` : `less than`} ${issue.maximum} element(s)`;
            else if (issue.type === "string")
                message = `String must contain ${issue.exact ? `exactly` : issue.inclusive ? `at most` : `under`} ${issue.maximum} character(s)`;
            else if (issue.type === "number")
                message = `Number must be ${issue.exact
                    ? `exactly`
                    : issue.inclusive
                        ? `less than or equal to`
                        : `less than`} ${issue.maximum}`;
            else if (issue.type === "bigint")
                message = `BigInt must be ${issue.exact
                    ? `exactly`
                    : issue.inclusive
                        ? `less than or equal to`
                        : `less than`} ${issue.maximum}`;
            else if (issue.type === "date")
                message = `Date must be ${issue.exact
                    ? `exactly`
                    : issue.inclusive
                        ? `smaller than or equal to`
                        : `smaller than`} ${new Date(Number(issue.maximum))}`;
            else
                message = "Invalid input";
            break;
        case ZodIssueCode.custom:
            message = `Invalid input`;
            break;
        case ZodIssueCode.invalid_intersection_types:
            message = `Intersection results could not be merged`;
            break;
        case ZodIssueCode.not_multiple_of:
            message = `Number must be a multiple of ${issue.multipleOf}`;
            break;
        case ZodIssueCode.not_finite:
            message = "Number must be finite";
            break;
        default:
            message = _ctx.defaultError;
            util.assertNever(issue);
    }
    return { message };
};

let overrideErrorMap = errorMap;
function setErrorMap(map) {
    overrideErrorMap = map;
}
function getErrorMap() {
    return overrideErrorMap;
}

const makeIssue = (params) => {
    const { data, path, errorMaps, issueData } = params;
    const fullPath = [...path, ...(issueData.path || [])];
    const fullIssue = {
        ...issueData,
        path: fullPath,
    };
    let errorMessage = "";
    const maps = errorMaps
        .filter((m) => !!m)
        .slice()
        .reverse();
    for (const map of maps) {
        errorMessage = map(fullIssue, { data, defaultError: errorMessage }).message;
    }
    return {
        ...issueData,
        path: fullPath,
        message: issueData.message || errorMessage,
    };
};
const EMPTY_PATH = [];
function addIssueToContext(ctx, issueData) {
    const issue = makeIssue({
        issueData: issueData,
        data: ctx.data,
        path: ctx.path,
        errorMaps: [
            ctx.common.contextualErrorMap,
            ctx.schemaErrorMap,
            getErrorMap(),
            errorMap, // then global default map
        ].filter((x) => !!x),
    });
    ctx.common.issues.push(issue);
}
class ParseStatus {
    constructor() {
        this.value = "valid";
    }
    dirty() {
        if (this.value === "valid")
            this.value = "dirty";
    }
    abort() {
        if (this.value !== "aborted")
            this.value = "aborted";
    }
    static mergeArray(status, results) {
        const arrayValue = [];
        for (const s of results) {
            if (s.status === "aborted")
                return INVALID;
            if (s.status === "dirty")
                status.dirty();
            arrayValue.push(s.value);
        }
        return { status: status.value, value: arrayValue };
    }
    static async mergeObjectAsync(status, pairs) {
        const syncPairs = [];
        for (const pair of pairs) {
            syncPairs.push({
                key: await pair.key,
                value: await pair.value,
            });
        }
        return ParseStatus.mergeObjectSync(status, syncPairs);
    }
    static mergeObjectSync(status, pairs) {
        const finalObject = {};
        for (const pair of pairs) {
            const { key, value } = pair;
            if (key.status === "aborted")
                return INVALID;
            if (value.status === "aborted")
                return INVALID;
            if (key.status === "dirty")
                status.dirty();
            if (value.status === "dirty")
                status.dirty();
            if (key.value !== "__proto__" &&
                (typeof value.value !== "undefined" || pair.alwaysSet)) {
                finalObject[key.value] = value.value;
            }
        }
        return { status: status.value, value: finalObject };
    }
}
const INVALID = Object.freeze({
    status: "aborted",
});
const DIRTY = (value) => ({ status: "dirty", value });
const OK = (value) => ({ status: "valid", value });
const isAborted = (x) => x.status === "aborted";
const isDirty = (x) => x.status === "dirty";
const isValid = (x) => x.status === "valid";
const isAsync = (x) => typeof Promise !== "undefined" && x instanceof Promise;

var errorUtil;
(function (errorUtil) {
    errorUtil.errToObj = (message) => typeof message === "string" ? { message } : message || {};
    errorUtil.toString = (message) => typeof message === "string" ? message : message === null || message === void 0 ? void 0 : message.message;
})(errorUtil || (errorUtil = {}));

class ParseInputLazyPath {
    constructor(parent, value, path, key) {
        this._cachedPath = [];
        this.parent = parent;
        this.data = value;
        this._path = path;
        this._key = key;
    }
    get path() {
        if (!this._cachedPath.length) {
            if (this._key instanceof Array) {
                this._cachedPath.push(...this._path, ...this._key);
            }
            else {
                this._cachedPath.push(...this._path, this._key);
            }
        }
        return this._cachedPath;
    }
}
const handleResult = (ctx, result) => {
    if (isValid(result)) {
        return { success: true, data: result.value };
    }
    else {
        if (!ctx.common.issues.length) {
            throw new Error("Validation failed but no issues detected.");
        }
        return {
            success: false,
            get error() {
                if (this._error)
                    return this._error;
                const error = new ZodError(ctx.common.issues);
                this._error = error;
                return this._error;
            },
        };
    }
};
function processCreateParams(params) {
    if (!params)
        return {};
    const { errorMap, invalid_type_error, required_error, description } = params;
    if (errorMap && (invalid_type_error || required_error)) {
        throw new Error(`Can't use "invalid_type_error" or "required_error" in conjunction with custom error map.`);
    }
    if (errorMap)
        return { errorMap: errorMap, description };
    const customMap = (iss, ctx) => {
        if (iss.code !== "invalid_type")
            return { message: ctx.defaultError };
        if (typeof ctx.data === "undefined") {
            return { message: required_error !== null && required_error !== void 0 ? required_error : ctx.defaultError };
        }
        return { message: invalid_type_error !== null && invalid_type_error !== void 0 ? invalid_type_error : ctx.defaultError };
    };
    return { errorMap: customMap, description };
}
class ZodType {
    constructor(def) {
        /** Alias of safeParseAsync */
        this.spa = this.safeParseAsync;
        this._def = def;
        this.parse = this.parse.bind(this);
        this.safeParse = this.safeParse.bind(this);
        this.parseAsync = this.parseAsync.bind(this);
        this.safeParseAsync = this.safeParseAsync.bind(this);
        this.spa = this.spa.bind(this);
        this.refine = this.refine.bind(this);
        this.refinement = this.refinement.bind(this);
        this.superRefine = this.superRefine.bind(this);
        this.optional = this.optional.bind(this);
        this.nullable = this.nullable.bind(this);
        this.nullish = this.nullish.bind(this);
        this.array = this.array.bind(this);
        this.promise = this.promise.bind(this);
        this.or = this.or.bind(this);
        this.and = this.and.bind(this);
        this.transform = this.transform.bind(this);
        this.brand = this.brand.bind(this);
        this.default = this.default.bind(this);
        this.catch = this.catch.bind(this);
        this.describe = this.describe.bind(this);
        this.pipe = this.pipe.bind(this);
        this.readonly = this.readonly.bind(this);
        this.isNullable = this.isNullable.bind(this);
        this.isOptional = this.isOptional.bind(this);
    }
    get description() {
        return this._def.description;
    }
    _getType(input) {
        return getParsedType(input.data);
    }
    _getOrReturnCtx(input, ctx) {
        return (ctx || {
            common: input.parent.common,
            data: input.data,
            parsedType: getParsedType(input.data),
            schemaErrorMap: this._def.errorMap,
            path: input.path,
            parent: input.parent,
        });
    }
    _processInputParams(input) {
        return {
            status: new ParseStatus(),
            ctx: {
                common: input.parent.common,
                data: input.data,
                parsedType: getParsedType(input.data),
                schemaErrorMap: this._def.errorMap,
                path: input.path,
                parent: input.parent,
            },
        };
    }
    _parseSync(input) {
        const result = this._parse(input);
        if (isAsync(result)) {
            throw new Error("Synchronous parse encountered promise.");
        }
        return result;
    }
    _parseAsync(input) {
        const result = this._parse(input);
        return Promise.resolve(result);
    }
    parse(data, params) {
        const result = this.safeParse(data, params);
        if (result.success)
            return result.data;
        throw result.error;
    }
    safeParse(data, params) {
        var _a;
        const ctx = {
            common: {
                issues: [],
                async: (_a = params === null || params === void 0 ? void 0 : params.async) !== null && _a !== void 0 ? _a : false,
                contextualErrorMap: params === null || params === void 0 ? void 0 : params.errorMap,
            },
            path: (params === null || params === void 0 ? void 0 : params.path) || [],
            schemaErrorMap: this._def.errorMap,
            parent: null,
            data,
            parsedType: getParsedType(data),
        };
        const result = this._parseSync({ data, path: ctx.path, parent: ctx });
        return handleResult(ctx, result);
    }
    async parseAsync(data, params) {
        const result = await this.safeParseAsync(data, params);
        if (result.success)
            return result.data;
        throw result.error;
    }
    async safeParseAsync(data, params) {
        const ctx = {
            common: {
                issues: [],
                contextualErrorMap: params === null || params === void 0 ? void 0 : params.errorMap,
                async: true,
            },
            path: (params === null || params === void 0 ? void 0 : params.path) || [],
            schemaErrorMap: this._def.errorMap,
            parent: null,
            data,
            parsedType: getParsedType(data),
        };
        const maybeAsyncResult = this._parse({ data, path: ctx.path, parent: ctx });
        const result = await (isAsync(maybeAsyncResult)
            ? maybeAsyncResult
            : Promise.resolve(maybeAsyncResult));
        return handleResult(ctx, result);
    }
    refine(check, message) {
        const getIssueProperties = (val) => {
            if (typeof message === "string" || typeof message === "undefined") {
                return { message };
            }
            else if (typeof message === "function") {
                return message(val);
            }
            else {
                return message;
            }
        };
        return this._refinement((val, ctx) => {
            const result = check(val);
            const setError = () => ctx.addIssue({
                code: ZodIssueCode.custom,
                ...getIssueProperties(val),
            });
            if (typeof Promise !== "undefined" && result instanceof Promise) {
                return result.then((data) => {
                    if (!data) {
                        setError();
                        return false;
                    }
                    else {
                        return true;
                    }
                });
            }
            if (!result) {
                setError();
                return false;
            }
            else {
                return true;
            }
        });
    }
    refinement(check, refinementData) {
        return this._refinement((val, ctx) => {
            if (!check(val)) {
                ctx.addIssue(typeof refinementData === "function"
                    ? refinementData(val, ctx)
                    : refinementData);
                return false;
            }
            else {
                return true;
            }
        });
    }
    _refinement(refinement) {
        return new ZodEffects({
            schema: this,
            typeName: ZodFirstPartyTypeKind.ZodEffects,
            effect: { type: "refinement", refinement },
        });
    }
    superRefine(refinement) {
        return this._refinement(refinement);
    }
    optional() {
        return ZodOptional.create(this, this._def);
    }
    nullable() {
        return ZodNullable.create(this, this._def);
    }
    nullish() {
        return this.nullable().optional();
    }
    array() {
        return ZodArray.create(this, this._def);
    }
    promise() {
        return ZodPromise.create(this, this._def);
    }
    or(option) {
        return ZodUnion.create([this, option], this._def);
    }
    and(incoming) {
        return ZodIntersection.create(this, incoming, this._def);
    }
    transform(transform) {
        return new ZodEffects({
            ...processCreateParams(this._def),
            schema: this,
            typeName: ZodFirstPartyTypeKind.ZodEffects,
            effect: { type: "transform", transform },
        });
    }
    default(def) {
        const defaultValueFunc = typeof def === "function" ? def : () => def;
        return new ZodDefault({
            ...processCreateParams(this._def),
            innerType: this,
            defaultValue: defaultValueFunc,
            typeName: ZodFirstPartyTypeKind.ZodDefault,
        });
    }
    brand() {
        return new ZodBranded({
            typeName: ZodFirstPartyTypeKind.ZodBranded,
            type: this,
            ...processCreateParams(this._def),
        });
    }
    catch(def) {
        const catchValueFunc = typeof def === "function" ? def : () => def;
        return new ZodCatch({
            ...processCreateParams(this._def),
            innerType: this,
            catchValue: catchValueFunc,
            typeName: ZodFirstPartyTypeKind.ZodCatch,
        });
    }
    describe(description) {
        const This = this.constructor;
        return new This({
            ...this._def,
            description,
        });
    }
    pipe(target) {
        return ZodPipeline.create(this, target);
    }
    readonly() {
        return ZodReadonly.create(this);
    }
    isOptional() {
        return this.safeParse(undefined).success;
    }
    isNullable() {
        return this.safeParse(null).success;
    }
}
const cuidRegex = /^c[^\s-]{8,}$/i;
const cuid2Regex = /^[a-z][a-z0-9]*$/;
const ulidRegex = /^[0-9A-HJKMNP-TV-Z]{26}$/;
// const uuidRegex =
//   /^([a-f0-9]{8}-[a-f0-9]{4}-[1-5][a-f0-9]{3}-[a-f0-9]{4}-[a-f0-9]{12}|00000000-0000-0000-0000-000000000000)$/i;
const uuidRegex = /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/i;
// from https://stackoverflow.com/a/46181/1550155
// old version: too slow, didn't support unicode
// const emailRegex = /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))$/i;
//old email regex
// const emailRegex = /^(([^<>()[\].,;:\s@"]+(\.[^<>()[\].,;:\s@"]+)*)|(".+"))@((?!-)([^<>()[\].,;:\s@"]+\.)+[^<>()[\].,;:\s@"]{1,})[^-<>()[\].,;:\s@"]$/i;
// eslint-disable-next-line
// const emailRegex =
//   /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[(((25[0-5])|(2[0-4][0-9])|(1[0-9]{2})|([0-9]{1,2}))\.){3}((25[0-5])|(2[0-4][0-9])|(1[0-9]{2})|([0-9]{1,2}))\])|(\[IPv6:(([a-f0-9]{1,4}:){7}|::([a-f0-9]{1,4}:){0,6}|([a-f0-9]{1,4}:){1}:([a-f0-9]{1,4}:){0,5}|([a-f0-9]{1,4}:){2}:([a-f0-9]{1,4}:){0,4}|([a-f0-9]{1,4}:){3}:([a-f0-9]{1,4}:){0,3}|([a-f0-9]{1,4}:){4}:([a-f0-9]{1,4}:){0,2}|([a-f0-9]{1,4}:){5}:([a-f0-9]{1,4}:){0,1})([a-f0-9]{1,4}|(((25[0-5])|(2[0-4][0-9])|(1[0-9]{2})|([0-9]{1,2}))\.){3}((25[0-5])|(2[0-4][0-9])|(1[0-9]{2})|([0-9]{1,2})))\])|([A-Za-z0-9]([A-Za-z0-9-]*[A-Za-z0-9])*(\.[A-Za-z]{2,})+))$/;
// const emailRegex =
//   /^[a-zA-Z0-9\.\!\#\$\%\&\'\*\+\/\=\?\^\_\`\{\|\}\~\-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
// const emailRegex =
//   /^(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])$/i;
const emailRegex = /^(?!\.)(?!.*\.\.)([A-Z0-9_+-\.]*)[A-Z0-9_+-]@([A-Z0-9][A-Z0-9\-]*\.)+[A-Z]{2,}$/i;
// const emailRegex =
//   /^[a-z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-z0-9-]+(?:\.[a-z0-9\-]+)*$/i;
// from https://thekevinscott.com/emojis-in-javascript/#writing-a-regular-expression
const _emojiRegex = `^(\\p{Extended_Pictographic}|\\p{Emoji_Component})+$`;
let emojiRegex;
const ipv4Regex = /^(((25[0-5])|(2[0-4][0-9])|(1[0-9]{2})|([0-9]{1,2}))\.){3}((25[0-5])|(2[0-4][0-9])|(1[0-9]{2})|([0-9]{1,2}))$/;
const ipv6Regex = /^(([a-f0-9]{1,4}:){7}|::([a-f0-9]{1,4}:){0,6}|([a-f0-9]{1,4}:){1}:([a-f0-9]{1,4}:){0,5}|([a-f0-9]{1,4}:){2}:([a-f0-9]{1,4}:){0,4}|([a-f0-9]{1,4}:){3}:([a-f0-9]{1,4}:){0,3}|([a-f0-9]{1,4}:){4}:([a-f0-9]{1,4}:){0,2}|([a-f0-9]{1,4}:){5}:([a-f0-9]{1,4}:){0,1})([a-f0-9]{1,4}|(((25[0-5])|(2[0-4][0-9])|(1[0-9]{2})|([0-9]{1,2}))\.){3}((25[0-5])|(2[0-4][0-9])|(1[0-9]{2})|([0-9]{1,2})))$/;
// Adapted from https://stackoverflow.com/a/3143231
const datetimeRegex = (args) => {
    if (args.precision) {
        if (args.offset) {
            return new RegExp(`^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}\\.\\d{${args.precision}}(([+-]\\d{2}(:?\\d{2})?)|Z)$`);
        }
        else {
            return new RegExp(`^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}\\.\\d{${args.precision}}Z$`);
        }
    }
    else if (args.precision === 0) {
        if (args.offset) {
            return new RegExp(`^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}(([+-]\\d{2}(:?\\d{2})?)|Z)$`);
        }
        else {
            return new RegExp(`^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}Z$`);
        }
    }
    else {
        if (args.offset) {
            return new RegExp(`^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}(\\.\\d+)?(([+-]\\d{2}(:?\\d{2})?)|Z)$`);
        }
        else {
            return new RegExp(`^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}(\\.\\d+)?Z$`);
        }
    }
};
function isValidIP(ip, version) {
    if ((version === "v4" || !version) && ipv4Regex.test(ip)) {
        return true;
    }
    if ((version === "v6" || !version) && ipv6Regex.test(ip)) {
        return true;
    }
    return false;
}
class ZodString extends ZodType {
    _parse(input) {
        if (this._def.coerce) {
            input.data = String(input.data);
        }
        const parsedType = this._getType(input);
        if (parsedType !== ZodParsedType.string) {
            const ctx = this._getOrReturnCtx(input);
            addIssueToContext(ctx, {
                code: ZodIssueCode.invalid_type,
                expected: ZodParsedType.string,
                received: ctx.parsedType,
            }
            //
            );
            return INVALID;
        }
        const status = new ParseStatus();
        let ctx = undefined;
        for (const check of this._def.checks) {
            if (check.kind === "min") {
                if (input.data.length < check.value) {
                    ctx = this._getOrReturnCtx(input, ctx);
                    addIssueToContext(ctx, {
                        code: ZodIssueCode.too_small,
                        minimum: check.value,
                        type: "string",
                        inclusive: true,
                        exact: false,
                        message: check.message,
                    });
                    status.dirty();
                }
            }
            else if (check.kind === "max") {
                if (input.data.length > check.value) {
                    ctx = this._getOrReturnCtx(input, ctx);
                    addIssueToContext(ctx, {
                        code: ZodIssueCode.too_big,
                        maximum: check.value,
                        type: "string",
                        inclusive: true,
                        exact: false,
                        message: check.message,
                    });
                    status.dirty();
                }
            }
            else if (check.kind === "length") {
                const tooBig = input.data.length > check.value;
                const tooSmall = input.data.length < check.value;
                if (tooBig || tooSmall) {
                    ctx = this._getOrReturnCtx(input, ctx);
                    if (tooBig) {
                        addIssueToContext(ctx, {
                            code: ZodIssueCode.too_big,
                            maximum: check.value,
                            type: "string",
                            inclusive: true,
                            exact: true,
                            message: check.message,
                        });
                    }
                    else if (tooSmall) {
                        addIssueToContext(ctx, {
                            code: ZodIssueCode.too_small,
                            minimum: check.value,
                            type: "string",
                            inclusive: true,
                            exact: true,
                            message: check.message,
                        });
                    }
                    status.dirty();
                }
            }
            else if (check.kind === "email") {
                if (!emailRegex.test(input.data)) {
                    ctx = this._getOrReturnCtx(input, ctx);
                    addIssueToContext(ctx, {
                        validation: "email",
                        code: ZodIssueCode.invalid_string,
                        message: check.message,
                    });
                    status.dirty();
                }
            }
            else if (check.kind === "emoji") {
                if (!emojiRegex) {
                    emojiRegex = new RegExp(_emojiRegex, "u");
                }
                if (!emojiRegex.test(input.data)) {
                    ctx = this._getOrReturnCtx(input, ctx);
                    addIssueToContext(ctx, {
                        validation: "emoji",
                        code: ZodIssueCode.invalid_string,
                        message: check.message,
                    });
                    status.dirty();
                }
            }
            else if (check.kind === "uuid") {
                if (!uuidRegex.test(input.data)) {
                    ctx = this._getOrReturnCtx(input, ctx);
                    addIssueToContext(ctx, {
                        validation: "uuid",
                        code: ZodIssueCode.invalid_string,
                        message: check.message,
                    });
                    status.dirty();
                }
            }
            else if (check.kind === "cuid") {
                if (!cuidRegex.test(input.data)) {
                    ctx = this._getOrReturnCtx(input, ctx);
                    addIssueToContext(ctx, {
                        validation: "cuid",
                        code: ZodIssueCode.invalid_string,
                        message: check.message,
                    });
                    status.dirty();
                }
            }
            else if (check.kind === "cuid2") {
                if (!cuid2Regex.test(input.data)) {
                    ctx = this._getOrReturnCtx(input, ctx);
                    addIssueToContext(ctx, {
                        validation: "cuid2",
                        code: ZodIssueCode.invalid_string,
                        message: check.message,
                    });
                    status.dirty();
                }
            }
            else if (check.kind === "ulid") {
                if (!ulidRegex.test(input.data)) {
                    ctx = this._getOrReturnCtx(input, ctx);
                    addIssueToContext(ctx, {
                        validation: "ulid",
                        code: ZodIssueCode.invalid_string,
                        message: check.message,
                    });
                    status.dirty();
                }
            }
            else if (check.kind === "url") {
                try {
                    new URL(input.data);
                }
                catch (_a) {
                    ctx = this._getOrReturnCtx(input, ctx);
                    addIssueToContext(ctx, {
                        validation: "url",
                        code: ZodIssueCode.invalid_string,
                        message: check.message,
                    });
                    status.dirty();
                }
            }
            else if (check.kind === "regex") {
                check.regex.lastIndex = 0;
                const testResult = check.regex.test(input.data);
                if (!testResult) {
                    ctx = this._getOrReturnCtx(input, ctx);
                    addIssueToContext(ctx, {
                        validation: "regex",
                        code: ZodIssueCode.invalid_string,
                        message: check.message,
                    });
                    status.dirty();
                }
            }
            else if (check.kind === "trim") {
                input.data = input.data.trim();
            }
            else if (check.kind === "includes") {
                if (!input.data.includes(check.value, check.position)) {
                    ctx = this._getOrReturnCtx(input, ctx);
                    addIssueToContext(ctx, {
                        code: ZodIssueCode.invalid_string,
                        validation: { includes: check.value, position: check.position },
                        message: check.message,
                    });
                    status.dirty();
                }
            }
            else if (check.kind === "toLowerCase") {
                input.data = input.data.toLowerCase();
            }
            else if (check.kind === "toUpperCase") {
                input.data = input.data.toUpperCase();
            }
            else if (check.kind === "startsWith") {
                if (!input.data.startsWith(check.value)) {
                    ctx = this._getOrReturnCtx(input, ctx);
                    addIssueToContext(ctx, {
                        code: ZodIssueCode.invalid_string,
                        validation: { startsWith: check.value },
                        message: check.message,
                    });
                    status.dirty();
                }
            }
            else if (check.kind === "endsWith") {
                if (!input.data.endsWith(check.value)) {
                    ctx = this._getOrReturnCtx(input, ctx);
                    addIssueToContext(ctx, {
                        code: ZodIssueCode.invalid_string,
                        validation: { endsWith: check.value },
                        message: check.message,
                    });
                    status.dirty();
                }
            }
            else if (check.kind === "datetime") {
                const regex = datetimeRegex(check);
                if (!regex.test(input.data)) {
                    ctx = this._getOrReturnCtx(input, ctx);
                    addIssueToContext(ctx, {
                        code: ZodIssueCode.invalid_string,
                        validation: "datetime",
                        message: check.message,
                    });
                    status.dirty();
                }
            }
            else if (check.kind === "ip") {
                if (!isValidIP(input.data, check.version)) {
                    ctx = this._getOrReturnCtx(input, ctx);
                    addIssueToContext(ctx, {
                        validation: "ip",
                        code: ZodIssueCode.invalid_string,
                        message: check.message,
                    });
                    status.dirty();
                }
            }
            else {
                util.assertNever(check);
            }
        }
        return { status: status.value, value: input.data };
    }
    _regex(regex, validation, message) {
        return this.refinement((data) => regex.test(data), {
            validation,
            code: ZodIssueCode.invalid_string,
            ...errorUtil.errToObj(message),
        });
    }
    _addCheck(check) {
        return new ZodString({
            ...this._def,
            checks: [...this._def.checks, check],
        });
    }
    email(message) {
        return this._addCheck({ kind: "email", ...errorUtil.errToObj(message) });
    }
    url(message) {
        return this._addCheck({ kind: "url", ...errorUtil.errToObj(message) });
    }
    emoji(message) {
        return this._addCheck({ kind: "emoji", ...errorUtil.errToObj(message) });
    }
    uuid(message) {
        return this._addCheck({ kind: "uuid", ...errorUtil.errToObj(message) });
    }
    cuid(message) {
        return this._addCheck({ kind: "cuid", ...errorUtil.errToObj(message) });
    }
    cuid2(message) {
        return this._addCheck({ kind: "cuid2", ...errorUtil.errToObj(message) });
    }
    ulid(message) {
        return this._addCheck({ kind: "ulid", ...errorUtil.errToObj(message) });
    }
    ip(options) {
        return this._addCheck({ kind: "ip", ...errorUtil.errToObj(options) });
    }
    datetime(options) {
        var _a;
        if (typeof options === "string") {
            return this._addCheck({
                kind: "datetime",
                precision: null,
                offset: false,
                message: options,
            });
        }
        return this._addCheck({
            kind: "datetime",
            precision: typeof (options === null || options === void 0 ? void 0 : options.precision) === "undefined" ? null : options === null || options === void 0 ? void 0 : options.precision,
            offset: (_a = options === null || options === void 0 ? void 0 : options.offset) !== null && _a !== void 0 ? _a : false,
            ...errorUtil.errToObj(options === null || options === void 0 ? void 0 : options.message),
        });
    }
    regex(regex, message) {
        return this._addCheck({
            kind: "regex",
            regex: regex,
            ...errorUtil.errToObj(message),
        });
    }
    includes(value, options) {
        return this._addCheck({
            kind: "includes",
            value: value,
            position: options === null || options === void 0 ? void 0 : options.position,
            ...errorUtil.errToObj(options === null || options === void 0 ? void 0 : options.message),
        });
    }
    startsWith(value, message) {
        return this._addCheck({
            kind: "startsWith",
            value: value,
            ...errorUtil.errToObj(message),
        });
    }
    endsWith(value, message) {
        return this._addCheck({
            kind: "endsWith",
            value: value,
            ...errorUtil.errToObj(message),
        });
    }
    min(minLength, message) {
        return this._addCheck({
            kind: "min",
            value: minLength,
            ...errorUtil.errToObj(message),
        });
    }
    max(maxLength, message) {
        return this._addCheck({
            kind: "max",
            value: maxLength,
            ...errorUtil.errToObj(message),
        });
    }
    length(len, message) {
        return this._addCheck({
            kind: "length",
            value: len,
            ...errorUtil.errToObj(message),
        });
    }
    /**
     * @deprecated Use z.string().min(1) instead.
     * @see {@link ZodString.min}
     */
    nonempty(message) {
        return this.min(1, errorUtil.errToObj(message));
    }
    trim() {
        return new ZodString({
            ...this._def,
            checks: [...this._def.checks, { kind: "trim" }],
        });
    }
    toLowerCase() {
        return new ZodString({
            ...this._def,
            checks: [...this._def.checks, { kind: "toLowerCase" }],
        });
    }
    toUpperCase() {
        return new ZodString({
            ...this._def,
            checks: [...this._def.checks, { kind: "toUpperCase" }],
        });
    }
    get isDatetime() {
        return !!this._def.checks.find((ch) => ch.kind === "datetime");
    }
    get isEmail() {
        return !!this._def.checks.find((ch) => ch.kind === "email");
    }
    get isURL() {
        return !!this._def.checks.find((ch) => ch.kind === "url");
    }
    get isEmoji() {
        return !!this._def.checks.find((ch) => ch.kind === "emoji");
    }
    get isUUID() {
        return !!this._def.checks.find((ch) => ch.kind === "uuid");
    }
    get isCUID() {
        return !!this._def.checks.find((ch) => ch.kind === "cuid");
    }
    get isCUID2() {
        return !!this._def.checks.find((ch) => ch.kind === "cuid2");
    }
    get isULID() {
        return !!this._def.checks.find((ch) => ch.kind === "ulid");
    }
    get isIP() {
        return !!this._def.checks.find((ch) => ch.kind === "ip");
    }
    get minLength() {
        let min = null;
        for (const ch of this._def.checks) {
            if (ch.kind === "min") {
                if (min === null || ch.value > min)
                    min = ch.value;
            }
        }
        return min;
    }
    get maxLength() {
        let max = null;
        for (const ch of this._def.checks) {
            if (ch.kind === "max") {
                if (max === null || ch.value < max)
                    max = ch.value;
            }
        }
        return max;
    }
}
ZodString.create = (params) => {
    var _a;
    return new ZodString({
        checks: [],
        typeName: ZodFirstPartyTypeKind.ZodString,
        coerce: (_a = params === null || params === void 0 ? void 0 : params.coerce) !== null && _a !== void 0 ? _a : false,
        ...processCreateParams(params),
    });
};
// https://stackoverflow.com/questions/3966484/why-does-modulus-operator-return-fractional-number-in-javascript/31711034#31711034
function floatSafeRemainder(val, step) {
    const valDecCount = (val.toString().split(".")[1] || "").length;
    const stepDecCount = (step.toString().split(".")[1] || "").length;
    const decCount = valDecCount > stepDecCount ? valDecCount : stepDecCount;
    const valInt = parseInt(val.toFixed(decCount).replace(".", ""));
    const stepInt = parseInt(step.toFixed(decCount).replace(".", ""));
    return (valInt % stepInt) / Math.pow(10, decCount);
}
class ZodNumber extends ZodType {
    constructor() {
        super(...arguments);
        this.min = this.gte;
        this.max = this.lte;
        this.step = this.multipleOf;
    }
    _parse(input) {
        if (this._def.coerce) {
            input.data = Number(input.data);
        }
        const parsedType = this._getType(input);
        if (parsedType !== ZodParsedType.number) {
            const ctx = this._getOrReturnCtx(input);
            addIssueToContext(ctx, {
                code: ZodIssueCode.invalid_type,
                expected: ZodParsedType.number,
                received: ctx.parsedType,
            });
            return INVALID;
        }
        let ctx = undefined;
        const status = new ParseStatus();
        for (const check of this._def.checks) {
            if (check.kind === "int") {
                if (!util.isInteger(input.data)) {
                    ctx = this._getOrReturnCtx(input, ctx);
                    addIssueToContext(ctx, {
                        code: ZodIssueCode.invalid_type,
                        expected: "integer",
                        received: "float",
                        message: check.message,
                    });
                    status.dirty();
                }
            }
            else if (check.kind === "min") {
                const tooSmall = check.inclusive
                    ? input.data < check.value
                    : input.data <= check.value;
                if (tooSmall) {
                    ctx = this._getOrReturnCtx(input, ctx);
                    addIssueToContext(ctx, {
                        code: ZodIssueCode.too_small,
                        minimum: check.value,
                        type: "number",
                        inclusive: check.inclusive,
                        exact: false,
                        message: check.message,
                    });
                    status.dirty();
                }
            }
            else if (check.kind === "max") {
                const tooBig = check.inclusive
                    ? input.data > check.value
                    : input.data >= check.value;
                if (tooBig) {
                    ctx = this._getOrReturnCtx(input, ctx);
                    addIssueToContext(ctx, {
                        code: ZodIssueCode.too_big,
                        maximum: check.value,
                        type: "number",
                        inclusive: check.inclusive,
                        exact: false,
                        message: check.message,
                    });
                    status.dirty();
                }
            }
            else if (check.kind === "multipleOf") {
                if (floatSafeRemainder(input.data, check.value) !== 0) {
                    ctx = this._getOrReturnCtx(input, ctx);
                    addIssueToContext(ctx, {
                        code: ZodIssueCode.not_multiple_of,
                        multipleOf: check.value,
                        message: check.message,
                    });
                    status.dirty();
                }
            }
            else if (check.kind === "finite") {
                if (!Number.isFinite(input.data)) {
                    ctx = this._getOrReturnCtx(input, ctx);
                    addIssueToContext(ctx, {
                        code: ZodIssueCode.not_finite,
                        message: check.message,
                    });
                    status.dirty();
                }
            }
            else {
                util.assertNever(check);
            }
        }
        return { status: status.value, value: input.data };
    }
    gte(value, message) {
        return this.setLimit("min", value, true, errorUtil.toString(message));
    }
    gt(value, message) {
        return this.setLimit("min", value, false, errorUtil.toString(message));
    }
    lte(value, message) {
        return this.setLimit("max", value, true, errorUtil.toString(message));
    }
    lt(value, message) {
        return this.setLimit("max", value, false, errorUtil.toString(message));
    }
    setLimit(kind, value, inclusive, message) {
        return new ZodNumber({
            ...this._def,
            checks: [
                ...this._def.checks,
                {
                    kind,
                    value,
                    inclusive,
                    message: errorUtil.toString(message),
                },
            ],
        });
    }
    _addCheck(check) {
        return new ZodNumber({
            ...this._def,
            checks: [...this._def.checks, check],
        });
    }
    int(message) {
        return this._addCheck({
            kind: "int",
            message: errorUtil.toString(message),
        });
    }
    positive(message) {
        return this._addCheck({
            kind: "min",
            value: 0,
            inclusive: false,
            message: errorUtil.toString(message),
        });
    }
    negative(message) {
        return this._addCheck({
            kind: "max",
            value: 0,
            inclusive: false,
            message: errorUtil.toString(message),
        });
    }
    nonpositive(message) {
        return this._addCheck({
            kind: "max",
            value: 0,
            inclusive: true,
            message: errorUtil.toString(message),
        });
    }
    nonnegative(message) {
        return this._addCheck({
            kind: "min",
            value: 0,
            inclusive: true,
            message: errorUtil.toString(message),
        });
    }
    multipleOf(value, message) {
        return this._addCheck({
            kind: "multipleOf",
            value: value,
            message: errorUtil.toString(message),
        });
    }
    finite(message) {
        return this._addCheck({
            kind: "finite",
            message: errorUtil.toString(message),
        });
    }
    safe(message) {
        return this._addCheck({
            kind: "min",
            inclusive: true,
            value: Number.MIN_SAFE_INTEGER,
            message: errorUtil.toString(message),
        })._addCheck({
            kind: "max",
            inclusive: true,
            value: Number.MAX_SAFE_INTEGER,
            message: errorUtil.toString(message),
        });
    }
    get minValue() {
        let min = null;
        for (const ch of this._def.checks) {
            if (ch.kind === "min") {
                if (min === null || ch.value > min)
                    min = ch.value;
            }
        }
        return min;
    }
    get maxValue() {
        let max = null;
        for (const ch of this._def.checks) {
            if (ch.kind === "max") {
                if (max === null || ch.value < max)
                    max = ch.value;
            }
        }
        return max;
    }
    get isInt() {
        return !!this._def.checks.find((ch) => ch.kind === "int" ||
            (ch.kind === "multipleOf" && util.isInteger(ch.value)));
    }
    get isFinite() {
        let max = null, min = null;
        for (const ch of this._def.checks) {
            if (ch.kind === "finite" ||
                ch.kind === "int" ||
                ch.kind === "multipleOf") {
                return true;
            }
            else if (ch.kind === "min") {
                if (min === null || ch.value > min)
                    min = ch.value;
            }
            else if (ch.kind === "max") {
                if (max === null || ch.value < max)
                    max = ch.value;
            }
        }
        return Number.isFinite(min) && Number.isFinite(max);
    }
}
ZodNumber.create = (params) => {
    return new ZodNumber({
        checks: [],
        typeName: ZodFirstPartyTypeKind.ZodNumber,
        coerce: (params === null || params === void 0 ? void 0 : params.coerce) || false,
        ...processCreateParams(params),
    });
};
class ZodBigInt extends ZodType {
    constructor() {
        super(...arguments);
        this.min = this.gte;
        this.max = this.lte;
    }
    _parse(input) {
        if (this._def.coerce) {
            input.data = BigInt(input.data);
        }
        const parsedType = this._getType(input);
        if (parsedType !== ZodParsedType.bigint) {
            const ctx = this._getOrReturnCtx(input);
            addIssueToContext(ctx, {
                code: ZodIssueCode.invalid_type,
                expected: ZodParsedType.bigint,
                received: ctx.parsedType,
            });
            return INVALID;
        }
        let ctx = undefined;
        const status = new ParseStatus();
        for (const check of this._def.checks) {
            if (check.kind === "min") {
                const tooSmall = check.inclusive
                    ? input.data < check.value
                    : input.data <= check.value;
                if (tooSmall) {
                    ctx = this._getOrReturnCtx(input, ctx);
                    addIssueToContext(ctx, {
                        code: ZodIssueCode.too_small,
                        type: "bigint",
                        minimum: check.value,
                        inclusive: check.inclusive,
                        message: check.message,
                    });
                    status.dirty();
                }
            }
            else if (check.kind === "max") {
                const tooBig = check.inclusive
                    ? input.data > check.value
                    : input.data >= check.value;
                if (tooBig) {
                    ctx = this._getOrReturnCtx(input, ctx);
                    addIssueToContext(ctx, {
                        code: ZodIssueCode.too_big,
                        type: "bigint",
                        maximum: check.value,
                        inclusive: check.inclusive,
                        message: check.message,
                    });
                    status.dirty();
                }
            }
            else if (check.kind === "multipleOf") {
                if (input.data % check.value !== BigInt(0)) {
                    ctx = this._getOrReturnCtx(input, ctx);
                    addIssueToContext(ctx, {
                        code: ZodIssueCode.not_multiple_of,
                        multipleOf: check.value,
                        message: check.message,
                    });
                    status.dirty();
                }
            }
            else {
                util.assertNever(check);
            }
        }
        return { status: status.value, value: input.data };
    }
    gte(value, message) {
        return this.setLimit("min", value, true, errorUtil.toString(message));
    }
    gt(value, message) {
        return this.setLimit("min", value, false, errorUtil.toString(message));
    }
    lte(value, message) {
        return this.setLimit("max", value, true, errorUtil.toString(message));
    }
    lt(value, message) {
        return this.setLimit("max", value, false, errorUtil.toString(message));
    }
    setLimit(kind, value, inclusive, message) {
        return new ZodBigInt({
            ...this._def,
            checks: [
                ...this._def.checks,
                {
                    kind,
                    value,
                    inclusive,
                    message: errorUtil.toString(message),
                },
            ],
        });
    }
    _addCheck(check) {
        return new ZodBigInt({
            ...this._def,
            checks: [...this._def.checks, check],
        });
    }
    positive(message) {
        return this._addCheck({
            kind: "min",
            value: BigInt(0),
            inclusive: false,
            message: errorUtil.toString(message),
        });
    }
    negative(message) {
        return this._addCheck({
            kind: "max",
            value: BigInt(0),
            inclusive: false,
            message: errorUtil.toString(message),
        });
    }
    nonpositive(message) {
        return this._addCheck({
            kind: "max",
            value: BigInt(0),
            inclusive: true,
            message: errorUtil.toString(message),
        });
    }
    nonnegative(message) {
        return this._addCheck({
            kind: "min",
            value: BigInt(0),
            inclusive: true,
            message: errorUtil.toString(message),
        });
    }
    multipleOf(value, message) {
        return this._addCheck({
            kind: "multipleOf",
            value,
            message: errorUtil.toString(message),
        });
    }
    get minValue() {
        let min = null;
        for (const ch of this._def.checks) {
            if (ch.kind === "min") {
                if (min === null || ch.value > min)
                    min = ch.value;
            }
        }
        return min;
    }
    get maxValue() {
        let max = null;
        for (const ch of this._def.checks) {
            if (ch.kind === "max") {
                if (max === null || ch.value < max)
                    max = ch.value;
            }
        }
        return max;
    }
}
ZodBigInt.create = (params) => {
    var _a;
    return new ZodBigInt({
        checks: [],
        typeName: ZodFirstPartyTypeKind.ZodBigInt,
        coerce: (_a = params === null || params === void 0 ? void 0 : params.coerce) !== null && _a !== void 0 ? _a : false,
        ...processCreateParams(params),
    });
};
class ZodBoolean extends ZodType {
    _parse(input) {
        if (this._def.coerce) {
            input.data = Boolean(input.data);
        }
        const parsedType = this._getType(input);
        if (parsedType !== ZodParsedType.boolean) {
            const ctx = this._getOrReturnCtx(input);
            addIssueToContext(ctx, {
                code: ZodIssueCode.invalid_type,
                expected: ZodParsedType.boolean,
                received: ctx.parsedType,
            });
            return INVALID;
        }
        return OK(input.data);
    }
}
ZodBoolean.create = (params) => {
    return new ZodBoolean({
        typeName: ZodFirstPartyTypeKind.ZodBoolean,
        coerce: (params === null || params === void 0 ? void 0 : params.coerce) || false,
        ...processCreateParams(params),
    });
};
class ZodDate extends ZodType {
    _parse(input) {
        if (this._def.coerce) {
            input.data = new Date(input.data);
        }
        const parsedType = this._getType(input);
        if (parsedType !== ZodParsedType.date) {
            const ctx = this._getOrReturnCtx(input);
            addIssueToContext(ctx, {
                code: ZodIssueCode.invalid_type,
                expected: ZodParsedType.date,
                received: ctx.parsedType,
            });
            return INVALID;
        }
        if (isNaN(input.data.getTime())) {
            const ctx = this._getOrReturnCtx(input);
            addIssueToContext(ctx, {
                code: ZodIssueCode.invalid_date,
            });
            return INVALID;
        }
        const status = new ParseStatus();
        let ctx = undefined;
        for (const check of this._def.checks) {
            if (check.kind === "min") {
                if (input.data.getTime() < check.value) {
                    ctx = this._getOrReturnCtx(input, ctx);
                    addIssueToContext(ctx, {
                        code: ZodIssueCode.too_small,
                        message: check.message,
                        inclusive: true,
                        exact: false,
                        minimum: check.value,
                        type: "date",
                    });
                    status.dirty();
                }
            }
            else if (check.kind === "max") {
                if (input.data.getTime() > check.value) {
                    ctx = this._getOrReturnCtx(input, ctx);
                    addIssueToContext(ctx, {
                        code: ZodIssueCode.too_big,
                        message: check.message,
                        inclusive: true,
                        exact: false,
                        maximum: check.value,
                        type: "date",
                    });
                    status.dirty();
                }
            }
            else {
                util.assertNever(check);
            }
        }
        return {
            status: status.value,
            value: new Date(input.data.getTime()),
        };
    }
    _addCheck(check) {
        return new ZodDate({
            ...this._def,
            checks: [...this._def.checks, check],
        });
    }
    min(minDate, message) {
        return this._addCheck({
            kind: "min",
            value: minDate.getTime(),
            message: errorUtil.toString(message),
        });
    }
    max(maxDate, message) {
        return this._addCheck({
            kind: "max",
            value: maxDate.getTime(),
            message: errorUtil.toString(message),
        });
    }
    get minDate() {
        let min = null;
        for (const ch of this._def.checks) {
            if (ch.kind === "min") {
                if (min === null || ch.value > min)
                    min = ch.value;
            }
        }
        return min != null ? new Date(min) : null;
    }
    get maxDate() {
        let max = null;
        for (const ch of this._def.checks) {
            if (ch.kind === "max") {
                if (max === null || ch.value < max)
                    max = ch.value;
            }
        }
        return max != null ? new Date(max) : null;
    }
}
ZodDate.create = (params) => {
    return new ZodDate({
        checks: [],
        coerce: (params === null || params === void 0 ? void 0 : params.coerce) || false,
        typeName: ZodFirstPartyTypeKind.ZodDate,
        ...processCreateParams(params),
    });
};
class ZodSymbol extends ZodType {
    _parse(input) {
        const parsedType = this._getType(input);
        if (parsedType !== ZodParsedType.symbol) {
            const ctx = this._getOrReturnCtx(input);
            addIssueToContext(ctx, {
                code: ZodIssueCode.invalid_type,
                expected: ZodParsedType.symbol,
                received: ctx.parsedType,
            });
            return INVALID;
        }
        return OK(input.data);
    }
}
ZodSymbol.create = (params) => {
    return new ZodSymbol({
        typeName: ZodFirstPartyTypeKind.ZodSymbol,
        ...processCreateParams(params),
    });
};
class ZodUndefined extends ZodType {
    _parse(input) {
        const parsedType = this._getType(input);
        if (parsedType !== ZodParsedType.undefined) {
            const ctx = this._getOrReturnCtx(input);
            addIssueToContext(ctx, {
                code: ZodIssueCode.invalid_type,
                expected: ZodParsedType.undefined,
                received: ctx.parsedType,
            });
            return INVALID;
        }
        return OK(input.data);
    }
}
ZodUndefined.create = (params) => {
    return new ZodUndefined({
        typeName: ZodFirstPartyTypeKind.ZodUndefined,
        ...processCreateParams(params),
    });
};
class ZodNull extends ZodType {
    _parse(input) {
        const parsedType = this._getType(input);
        if (parsedType !== ZodParsedType.null) {
            const ctx = this._getOrReturnCtx(input);
            addIssueToContext(ctx, {
                code: ZodIssueCode.invalid_type,
                expected: ZodParsedType.null,
                received: ctx.parsedType,
            });
            return INVALID;
        }
        return OK(input.data);
    }
}
ZodNull.create = (params) => {
    return new ZodNull({
        typeName: ZodFirstPartyTypeKind.ZodNull,
        ...processCreateParams(params),
    });
};
class ZodAny extends ZodType {
    constructor() {
        super(...arguments);
        // to prevent instances of other classes from extending ZodAny. this causes issues with catchall in ZodObject.
        this._any = true;
    }
    _parse(input) {
        return OK(input.data);
    }
}
ZodAny.create = (params) => {
    return new ZodAny({
        typeName: ZodFirstPartyTypeKind.ZodAny,
        ...processCreateParams(params),
    });
};
class ZodUnknown extends ZodType {
    constructor() {
        super(...arguments);
        // required
        this._unknown = true;
    }
    _parse(input) {
        return OK(input.data);
    }
}
ZodUnknown.create = (params) => {
    return new ZodUnknown({
        typeName: ZodFirstPartyTypeKind.ZodUnknown,
        ...processCreateParams(params),
    });
};
class ZodNever extends ZodType {
    _parse(input) {
        const ctx = this._getOrReturnCtx(input);
        addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_type,
            expected: ZodParsedType.never,
            received: ctx.parsedType,
        });
        return INVALID;
    }
}
ZodNever.create = (params) => {
    return new ZodNever({
        typeName: ZodFirstPartyTypeKind.ZodNever,
        ...processCreateParams(params),
    });
};
class ZodVoid extends ZodType {
    _parse(input) {
        const parsedType = this._getType(input);
        if (parsedType !== ZodParsedType.undefined) {
            const ctx = this._getOrReturnCtx(input);
            addIssueToContext(ctx, {
                code: ZodIssueCode.invalid_type,
                expected: ZodParsedType.void,
                received: ctx.parsedType,
            });
            return INVALID;
        }
        return OK(input.data);
    }
}
ZodVoid.create = (params) => {
    return new ZodVoid({
        typeName: ZodFirstPartyTypeKind.ZodVoid,
        ...processCreateParams(params),
    });
};
class ZodArray extends ZodType {
    _parse(input) {
        const { ctx, status } = this._processInputParams(input);
        const def = this._def;
        if (ctx.parsedType !== ZodParsedType.array) {
            addIssueToContext(ctx, {
                code: ZodIssueCode.invalid_type,
                expected: ZodParsedType.array,
                received: ctx.parsedType,
            });
            return INVALID;
        }
        if (def.exactLength !== null) {
            const tooBig = ctx.data.length > def.exactLength.value;
            const tooSmall = ctx.data.length < def.exactLength.value;
            if (tooBig || tooSmall) {
                addIssueToContext(ctx, {
                    code: tooBig ? ZodIssueCode.too_big : ZodIssueCode.too_small,
                    minimum: (tooSmall ? def.exactLength.value : undefined),
                    maximum: (tooBig ? def.exactLength.value : undefined),
                    type: "array",
                    inclusive: true,
                    exact: true,
                    message: def.exactLength.message,
                });
                status.dirty();
            }
        }
        if (def.minLength !== null) {
            if (ctx.data.length < def.minLength.value) {
                addIssueToContext(ctx, {
                    code: ZodIssueCode.too_small,
                    minimum: def.minLength.value,
                    type: "array",
                    inclusive: true,
                    exact: false,
                    message: def.minLength.message,
                });
                status.dirty();
            }
        }
        if (def.maxLength !== null) {
            if (ctx.data.length > def.maxLength.value) {
                addIssueToContext(ctx, {
                    code: ZodIssueCode.too_big,
                    maximum: def.maxLength.value,
                    type: "array",
                    inclusive: true,
                    exact: false,
                    message: def.maxLength.message,
                });
                status.dirty();
            }
        }
        if (ctx.common.async) {
            return Promise.all([...ctx.data].map((item, i) => {
                return def.type._parseAsync(new ParseInputLazyPath(ctx, item, ctx.path, i));
            })).then((result) => {
                return ParseStatus.mergeArray(status, result);
            });
        }
        const result = [...ctx.data].map((item, i) => {
            return def.type._parseSync(new ParseInputLazyPath(ctx, item, ctx.path, i));
        });
        return ParseStatus.mergeArray(status, result);
    }
    get element() {
        return this._def.type;
    }
    min(minLength, message) {
        return new ZodArray({
            ...this._def,
            minLength: { value: minLength, message: errorUtil.toString(message) },
        });
    }
    max(maxLength, message) {
        return new ZodArray({
            ...this._def,
            maxLength: { value: maxLength, message: errorUtil.toString(message) },
        });
    }
    length(len, message) {
        return new ZodArray({
            ...this._def,
            exactLength: { value: len, message: errorUtil.toString(message) },
        });
    }
    nonempty(message) {
        return this.min(1, message);
    }
}
ZodArray.create = (schema, params) => {
    return new ZodArray({
        type: schema,
        minLength: null,
        maxLength: null,
        exactLength: null,
        typeName: ZodFirstPartyTypeKind.ZodArray,
        ...processCreateParams(params),
    });
};
function deepPartialify(schema) {
    if (schema instanceof ZodObject) {
        const newShape = {};
        for (const key in schema.shape) {
            const fieldSchema = schema.shape[key];
            newShape[key] = ZodOptional.create(deepPartialify(fieldSchema));
        }
        return new ZodObject({
            ...schema._def,
            shape: () => newShape,
        });
    }
    else if (schema instanceof ZodArray) {
        return new ZodArray({
            ...schema._def,
            type: deepPartialify(schema.element),
        });
    }
    else if (schema instanceof ZodOptional) {
        return ZodOptional.create(deepPartialify(schema.unwrap()));
    }
    else if (schema instanceof ZodNullable) {
        return ZodNullable.create(deepPartialify(schema.unwrap()));
    }
    else if (schema instanceof ZodTuple) {
        return ZodTuple.create(schema.items.map((item) => deepPartialify(item)));
    }
    else {
        return schema;
    }
}
class ZodObject extends ZodType {
    constructor() {
        super(...arguments);
        this._cached = null;
        /**
         * @deprecated In most cases, this is no longer needed - unknown properties are now silently stripped.
         * If you want to pass through unknown properties, use `.passthrough()` instead.
         */
        this.nonstrict = this.passthrough;
        // extend<
        //   Augmentation extends ZodRawShape,
        //   NewOutput extends util.flatten<{
        //     [k in keyof Augmentation | keyof Output]: k extends keyof Augmentation
        //       ? Augmentation[k]["_output"]
        //       : k extends keyof Output
        //       ? Output[k]
        //       : never;
        //   }>,
        //   NewInput extends util.flatten<{
        //     [k in keyof Augmentation | keyof Input]: k extends keyof Augmentation
        //       ? Augmentation[k]["_input"]
        //       : k extends keyof Input
        //       ? Input[k]
        //       : never;
        //   }>
        // >(
        //   augmentation: Augmentation
        // ): ZodObject<
        //   extendShape<T, Augmentation>,
        //   UnknownKeys,
        //   Catchall,
        //   NewOutput,
        //   NewInput
        // > {
        //   return new ZodObject({
        //     ...this._def,
        //     shape: () => ({
        //       ...this._def.shape(),
        //       ...augmentation,
        //     }),
        //   }) as any;
        // }
        /**
         * @deprecated Use `.extend` instead
         *  */
        this.augment = this.extend;
    }
    _getCached() {
        if (this._cached !== null)
            return this._cached;
        const shape = this._def.shape();
        const keys = util.objectKeys(shape);
        return (this._cached = { shape, keys });
    }
    _parse(input) {
        const parsedType = this._getType(input);
        if (parsedType !== ZodParsedType.object) {
            const ctx = this._getOrReturnCtx(input);
            addIssueToContext(ctx, {
                code: ZodIssueCode.invalid_type,
                expected: ZodParsedType.object,
                received: ctx.parsedType,
            });
            return INVALID;
        }
        const { status, ctx } = this._processInputParams(input);
        const { shape, keys: shapeKeys } = this._getCached();
        const extraKeys = [];
        if (!(this._def.catchall instanceof ZodNever &&
            this._def.unknownKeys === "strip")) {
            for (const key in ctx.data) {
                if (!shapeKeys.includes(key)) {
                    extraKeys.push(key);
                }
            }
        }
        const pairs = [];
        for (const key of shapeKeys) {
            const keyValidator = shape[key];
            const value = ctx.data[key];
            pairs.push({
                key: { status: "valid", value: key },
                value: keyValidator._parse(new ParseInputLazyPath(ctx, value, ctx.path, key)),
                alwaysSet: key in ctx.data,
            });
        }
        if (this._def.catchall instanceof ZodNever) {
            const unknownKeys = this._def.unknownKeys;
            if (unknownKeys === "passthrough") {
                for (const key of extraKeys) {
                    pairs.push({
                        key: { status: "valid", value: key },
                        value: { status: "valid", value: ctx.data[key] },
                    });
                }
            }
            else if (unknownKeys === "strict") {
                if (extraKeys.length > 0) {
                    addIssueToContext(ctx, {
                        code: ZodIssueCode.unrecognized_keys,
                        keys: extraKeys,
                    });
                    status.dirty();
                }
            }
            else if (unknownKeys === "strip") ;
            else {
                throw new Error(`Internal ZodObject error: invalid unknownKeys value.`);
            }
        }
        else {
            // run catchall validation
            const catchall = this._def.catchall;
            for (const key of extraKeys) {
                const value = ctx.data[key];
                pairs.push({
                    key: { status: "valid", value: key },
                    value: catchall._parse(new ParseInputLazyPath(ctx, value, ctx.path, key) //, ctx.child(key), value, getParsedType(value)
                    ),
                    alwaysSet: key in ctx.data,
                });
            }
        }
        if (ctx.common.async) {
            return Promise.resolve()
                .then(async () => {
                const syncPairs = [];
                for (const pair of pairs) {
                    const key = await pair.key;
                    syncPairs.push({
                        key,
                        value: await pair.value,
                        alwaysSet: pair.alwaysSet,
                    });
                }
                return syncPairs;
            })
                .then((syncPairs) => {
                return ParseStatus.mergeObjectSync(status, syncPairs);
            });
        }
        else {
            return ParseStatus.mergeObjectSync(status, pairs);
        }
    }
    get shape() {
        return this._def.shape();
    }
    strict(message) {
        errorUtil.errToObj;
        return new ZodObject({
            ...this._def,
            unknownKeys: "strict",
            ...(message !== undefined
                ? {
                    errorMap: (issue, ctx) => {
                        var _a, _b, _c, _d;
                        const defaultError = (_c = (_b = (_a = this._def).errorMap) === null || _b === void 0 ? void 0 : _b.call(_a, issue, ctx).message) !== null && _c !== void 0 ? _c : ctx.defaultError;
                        if (issue.code === "unrecognized_keys")
                            return {
                                message: (_d = errorUtil.errToObj(message).message) !== null && _d !== void 0 ? _d : defaultError,
                            };
                        return {
                            message: defaultError,
                        };
                    },
                }
                : {}),
        });
    }
    strip() {
        return new ZodObject({
            ...this._def,
            unknownKeys: "strip",
        });
    }
    passthrough() {
        return new ZodObject({
            ...this._def,
            unknownKeys: "passthrough",
        });
    }
    // const AugmentFactory =
    //   <Def extends ZodObjectDef>(def: Def) =>
    //   <Augmentation extends ZodRawShape>(
    //     augmentation: Augmentation
    //   ): ZodObject<
    //     extendShape<ReturnType<Def["shape"]>, Augmentation>,
    //     Def["unknownKeys"],
    //     Def["catchall"]
    //   > => {
    //     return new ZodObject({
    //       ...def,
    //       shape: () => ({
    //         ...def.shape(),
    //         ...augmentation,
    //       }),
    //     }) as any;
    //   };
    extend(augmentation) {
        return new ZodObject({
            ...this._def,
            shape: () => ({
                ...this._def.shape(),
                ...augmentation,
            }),
        });
    }
    /**
     * Prior to zod@1.0.12 there was a bug in the
     * inferred type of merged objects. Please
     * upgrade if you are experiencing issues.
     */
    merge(merging) {
        const merged = new ZodObject({
            unknownKeys: merging._def.unknownKeys,
            catchall: merging._def.catchall,
            shape: () => ({
                ...this._def.shape(),
                ...merging._def.shape(),
            }),
            typeName: ZodFirstPartyTypeKind.ZodObject,
        });
        return merged;
    }
    // merge<
    //   Incoming extends AnyZodObject,
    //   Augmentation extends Incoming["shape"],
    //   NewOutput extends {
    //     [k in keyof Augmentation | keyof Output]: k extends keyof Augmentation
    //       ? Augmentation[k]["_output"]
    //       : k extends keyof Output
    //       ? Output[k]
    //       : never;
    //   },
    //   NewInput extends {
    //     [k in keyof Augmentation | keyof Input]: k extends keyof Augmentation
    //       ? Augmentation[k]["_input"]
    //       : k extends keyof Input
    //       ? Input[k]
    //       : never;
    //   }
    // >(
    //   merging: Incoming
    // ): ZodObject<
    //   extendShape<T, ReturnType<Incoming["_def"]["shape"]>>,
    //   Incoming["_def"]["unknownKeys"],
    //   Incoming["_def"]["catchall"],
    //   NewOutput,
    //   NewInput
    // > {
    //   const merged: any = new ZodObject({
    //     unknownKeys: merging._def.unknownKeys,
    //     catchall: merging._def.catchall,
    //     shape: () =>
    //       objectUtil.mergeShapes(this._def.shape(), merging._def.shape()),
    //     typeName: ZodFirstPartyTypeKind.ZodObject,
    //   }) as any;
    //   return merged;
    // }
    setKey(key, schema) {
        return this.augment({ [key]: schema });
    }
    // merge<Incoming extends AnyZodObject>(
    //   merging: Incoming
    // ): //ZodObject<T & Incoming["_shape"], UnknownKeys, Catchall> = (merging) => {
    // ZodObject<
    //   extendShape<T, ReturnType<Incoming["_def"]["shape"]>>,
    //   Incoming["_def"]["unknownKeys"],
    //   Incoming["_def"]["catchall"]
    // > {
    //   // const mergedShape = objectUtil.mergeShapes(
    //   //   this._def.shape(),
    //   //   merging._def.shape()
    //   // );
    //   const merged: any = new ZodObject({
    //     unknownKeys: merging._def.unknownKeys,
    //     catchall: merging._def.catchall,
    //     shape: () =>
    //       objectUtil.mergeShapes(this._def.shape(), merging._def.shape()),
    //     typeName: ZodFirstPartyTypeKind.ZodObject,
    //   }) as any;
    //   return merged;
    // }
    catchall(index) {
        return new ZodObject({
            ...this._def,
            catchall: index,
        });
    }
    pick(mask) {
        const shape = {};
        util.objectKeys(mask).forEach((key) => {
            if (mask[key] && this.shape[key]) {
                shape[key] = this.shape[key];
            }
        });
        return new ZodObject({
            ...this._def,
            shape: () => shape,
        });
    }
    omit(mask) {
        const shape = {};
        util.objectKeys(this.shape).forEach((key) => {
            if (!mask[key]) {
                shape[key] = this.shape[key];
            }
        });
        return new ZodObject({
            ...this._def,
            shape: () => shape,
        });
    }
    /**
     * @deprecated
     */
    deepPartial() {
        return deepPartialify(this);
    }
    partial(mask) {
        const newShape = {};
        util.objectKeys(this.shape).forEach((key) => {
            const fieldSchema = this.shape[key];
            if (mask && !mask[key]) {
                newShape[key] = fieldSchema;
            }
            else {
                newShape[key] = fieldSchema.optional();
            }
        });
        return new ZodObject({
            ...this._def,
            shape: () => newShape,
        });
    }
    required(mask) {
        const newShape = {};
        util.objectKeys(this.shape).forEach((key) => {
            if (mask && !mask[key]) {
                newShape[key] = this.shape[key];
            }
            else {
                const fieldSchema = this.shape[key];
                let newField = fieldSchema;
                while (newField instanceof ZodOptional) {
                    newField = newField._def.innerType;
                }
                newShape[key] = newField;
            }
        });
        return new ZodObject({
            ...this._def,
            shape: () => newShape,
        });
    }
    keyof() {
        return createZodEnum(util.objectKeys(this.shape));
    }
}
ZodObject.create = (shape, params) => {
    return new ZodObject({
        shape: () => shape,
        unknownKeys: "strip",
        catchall: ZodNever.create(),
        typeName: ZodFirstPartyTypeKind.ZodObject,
        ...processCreateParams(params),
    });
};
ZodObject.strictCreate = (shape, params) => {
    return new ZodObject({
        shape: () => shape,
        unknownKeys: "strict",
        catchall: ZodNever.create(),
        typeName: ZodFirstPartyTypeKind.ZodObject,
        ...processCreateParams(params),
    });
};
ZodObject.lazycreate = (shape, params) => {
    return new ZodObject({
        shape,
        unknownKeys: "strip",
        catchall: ZodNever.create(),
        typeName: ZodFirstPartyTypeKind.ZodObject,
        ...processCreateParams(params),
    });
};
class ZodUnion extends ZodType {
    _parse(input) {
        const { ctx } = this._processInputParams(input);
        const options = this._def.options;
        function handleResults(results) {
            // return first issue-free validation if it exists
            for (const result of results) {
                if (result.result.status === "valid") {
                    return result.result;
                }
            }
            for (const result of results) {
                if (result.result.status === "dirty") {
                    // add issues from dirty option
                    ctx.common.issues.push(...result.ctx.common.issues);
                    return result.result;
                }
            }
            // return invalid
            const unionErrors = results.map((result) => new ZodError(result.ctx.common.issues));
            addIssueToContext(ctx, {
                code: ZodIssueCode.invalid_union,
                unionErrors,
            });
            return INVALID;
        }
        if (ctx.common.async) {
            return Promise.all(options.map(async (option) => {
                const childCtx = {
                    ...ctx,
                    common: {
                        ...ctx.common,
                        issues: [],
                    },
                    parent: null,
                };
                return {
                    result: await option._parseAsync({
                        data: ctx.data,
                        path: ctx.path,
                        parent: childCtx,
                    }),
                    ctx: childCtx,
                };
            })).then(handleResults);
        }
        else {
            let dirty = undefined;
            const issues = [];
            for (const option of options) {
                const childCtx = {
                    ...ctx,
                    common: {
                        ...ctx.common,
                        issues: [],
                    },
                    parent: null,
                };
                const result = option._parseSync({
                    data: ctx.data,
                    path: ctx.path,
                    parent: childCtx,
                });
                if (result.status === "valid") {
                    return result;
                }
                else if (result.status === "dirty" && !dirty) {
                    dirty = { result, ctx: childCtx };
                }
                if (childCtx.common.issues.length) {
                    issues.push(childCtx.common.issues);
                }
            }
            if (dirty) {
                ctx.common.issues.push(...dirty.ctx.common.issues);
                return dirty.result;
            }
            const unionErrors = issues.map((issues) => new ZodError(issues));
            addIssueToContext(ctx, {
                code: ZodIssueCode.invalid_union,
                unionErrors,
            });
            return INVALID;
        }
    }
    get options() {
        return this._def.options;
    }
}
ZodUnion.create = (types, params) => {
    return new ZodUnion({
        options: types,
        typeName: ZodFirstPartyTypeKind.ZodUnion,
        ...processCreateParams(params),
    });
};
/////////////////////////////////////////////////////
/////////////////////////////////////////////////////
//////////                                 //////////
//////////      ZodDiscriminatedUnion      //////////
//////////                                 //////////
/////////////////////////////////////////////////////
/////////////////////////////////////////////////////
const getDiscriminator = (type) => {
    if (type instanceof ZodLazy) {
        return getDiscriminator(type.schema);
    }
    else if (type instanceof ZodEffects) {
        return getDiscriminator(type.innerType());
    }
    else if (type instanceof ZodLiteral) {
        return [type.value];
    }
    else if (type instanceof ZodEnum) {
        return type.options;
    }
    else if (type instanceof ZodNativeEnum) {
        // eslint-disable-next-line ban/ban
        return Object.keys(type.enum);
    }
    else if (type instanceof ZodDefault) {
        return getDiscriminator(type._def.innerType);
    }
    else if (type instanceof ZodUndefined) {
        return [undefined];
    }
    else if (type instanceof ZodNull) {
        return [null];
    }
    else {
        return null;
    }
};
class ZodDiscriminatedUnion extends ZodType {
    _parse(input) {
        const { ctx } = this._processInputParams(input);
        if (ctx.parsedType !== ZodParsedType.object) {
            addIssueToContext(ctx, {
                code: ZodIssueCode.invalid_type,
                expected: ZodParsedType.object,
                received: ctx.parsedType,
            });
            return INVALID;
        }
        const discriminator = this.discriminator;
        const discriminatorValue = ctx.data[discriminator];
        const option = this.optionsMap.get(discriminatorValue);
        if (!option) {
            addIssueToContext(ctx, {
                code: ZodIssueCode.invalid_union_discriminator,
                options: Array.from(this.optionsMap.keys()),
                path: [discriminator],
            });
            return INVALID;
        }
        if (ctx.common.async) {
            return option._parseAsync({
                data: ctx.data,
                path: ctx.path,
                parent: ctx,
            });
        }
        else {
            return option._parseSync({
                data: ctx.data,
                path: ctx.path,
                parent: ctx,
            });
        }
    }
    get discriminator() {
        return this._def.discriminator;
    }
    get options() {
        return this._def.options;
    }
    get optionsMap() {
        return this._def.optionsMap;
    }
    /**
     * The constructor of the discriminated union schema. Its behaviour is very similar to that of the normal z.union() constructor.
     * However, it only allows a union of objects, all of which need to share a discriminator property. This property must
     * have a different value for each object in the union.
     * @param discriminator the name of the discriminator property
     * @param types an array of object schemas
     * @param params
     */
    static create(discriminator, options, params) {
        // Get all the valid discriminator values
        const optionsMap = new Map();
        // try {
        for (const type of options) {
            const discriminatorValues = getDiscriminator(type.shape[discriminator]);
            if (!discriminatorValues) {
                throw new Error(`A discriminator value for key \`${discriminator}\` could not be extracted from all schema options`);
            }
            for (const value of discriminatorValues) {
                if (optionsMap.has(value)) {
                    throw new Error(`Discriminator property ${String(discriminator)} has duplicate value ${String(value)}`);
                }
                optionsMap.set(value, type);
            }
        }
        return new ZodDiscriminatedUnion({
            typeName: ZodFirstPartyTypeKind.ZodDiscriminatedUnion,
            discriminator,
            options,
            optionsMap,
            ...processCreateParams(params),
        });
    }
}
function mergeValues(a, b) {
    const aType = getParsedType(a);
    const bType = getParsedType(b);
    if (a === b) {
        return { valid: true, data: a };
    }
    else if (aType === ZodParsedType.object && bType === ZodParsedType.object) {
        const bKeys = util.objectKeys(b);
        const sharedKeys = util
            .objectKeys(a)
            .filter((key) => bKeys.indexOf(key) !== -1);
        const newObj = { ...a, ...b };
        for (const key of sharedKeys) {
            const sharedValue = mergeValues(a[key], b[key]);
            if (!sharedValue.valid) {
                return { valid: false };
            }
            newObj[key] = sharedValue.data;
        }
        return { valid: true, data: newObj };
    }
    else if (aType === ZodParsedType.array && bType === ZodParsedType.array) {
        if (a.length !== b.length) {
            return { valid: false };
        }
        const newArray = [];
        for (let index = 0; index < a.length; index++) {
            const itemA = a[index];
            const itemB = b[index];
            const sharedValue = mergeValues(itemA, itemB);
            if (!sharedValue.valid) {
                return { valid: false };
            }
            newArray.push(sharedValue.data);
        }
        return { valid: true, data: newArray };
    }
    else if (aType === ZodParsedType.date &&
        bType === ZodParsedType.date &&
        +a === +b) {
        return { valid: true, data: a };
    }
    else {
        return { valid: false };
    }
}
class ZodIntersection extends ZodType {
    _parse(input) {
        const { status, ctx } = this._processInputParams(input);
        const handleParsed = (parsedLeft, parsedRight) => {
            if (isAborted(parsedLeft) || isAborted(parsedRight)) {
                return INVALID;
            }
            const merged = mergeValues(parsedLeft.value, parsedRight.value);
            if (!merged.valid) {
                addIssueToContext(ctx, {
                    code: ZodIssueCode.invalid_intersection_types,
                });
                return INVALID;
            }
            if (isDirty(parsedLeft) || isDirty(parsedRight)) {
                status.dirty();
            }
            return { status: status.value, value: merged.data };
        };
        if (ctx.common.async) {
            return Promise.all([
                this._def.left._parseAsync({
                    data: ctx.data,
                    path: ctx.path,
                    parent: ctx,
                }),
                this._def.right._parseAsync({
                    data: ctx.data,
                    path: ctx.path,
                    parent: ctx,
                }),
            ]).then(([left, right]) => handleParsed(left, right));
        }
        else {
            return handleParsed(this._def.left._parseSync({
                data: ctx.data,
                path: ctx.path,
                parent: ctx,
            }), this._def.right._parseSync({
                data: ctx.data,
                path: ctx.path,
                parent: ctx,
            }));
        }
    }
}
ZodIntersection.create = (left, right, params) => {
    return new ZodIntersection({
        left: left,
        right: right,
        typeName: ZodFirstPartyTypeKind.ZodIntersection,
        ...processCreateParams(params),
    });
};
class ZodTuple extends ZodType {
    _parse(input) {
        const { status, ctx } = this._processInputParams(input);
        if (ctx.parsedType !== ZodParsedType.array) {
            addIssueToContext(ctx, {
                code: ZodIssueCode.invalid_type,
                expected: ZodParsedType.array,
                received: ctx.parsedType,
            });
            return INVALID;
        }
        if (ctx.data.length < this._def.items.length) {
            addIssueToContext(ctx, {
                code: ZodIssueCode.too_small,
                minimum: this._def.items.length,
                inclusive: true,
                exact: false,
                type: "array",
            });
            return INVALID;
        }
        const rest = this._def.rest;
        if (!rest && ctx.data.length > this._def.items.length) {
            addIssueToContext(ctx, {
                code: ZodIssueCode.too_big,
                maximum: this._def.items.length,
                inclusive: true,
                exact: false,
                type: "array",
            });
            status.dirty();
        }
        const items = [...ctx.data]
            .map((item, itemIndex) => {
            const schema = this._def.items[itemIndex] || this._def.rest;
            if (!schema)
                return null;
            return schema._parse(new ParseInputLazyPath(ctx, item, ctx.path, itemIndex));
        })
            .filter((x) => !!x); // filter nulls
        if (ctx.common.async) {
            return Promise.all(items).then((results) => {
                return ParseStatus.mergeArray(status, results);
            });
        }
        else {
            return ParseStatus.mergeArray(status, items);
        }
    }
    get items() {
        return this._def.items;
    }
    rest(rest) {
        return new ZodTuple({
            ...this._def,
            rest,
        });
    }
}
ZodTuple.create = (schemas, params) => {
    if (!Array.isArray(schemas)) {
        throw new Error("You must pass an array of schemas to z.tuple([ ... ])");
    }
    return new ZodTuple({
        items: schemas,
        typeName: ZodFirstPartyTypeKind.ZodTuple,
        rest: null,
        ...processCreateParams(params),
    });
};
class ZodRecord extends ZodType {
    get keySchema() {
        return this._def.keyType;
    }
    get valueSchema() {
        return this._def.valueType;
    }
    _parse(input) {
        const { status, ctx } = this._processInputParams(input);
        if (ctx.parsedType !== ZodParsedType.object) {
            addIssueToContext(ctx, {
                code: ZodIssueCode.invalid_type,
                expected: ZodParsedType.object,
                received: ctx.parsedType,
            });
            return INVALID;
        }
        const pairs = [];
        const keyType = this._def.keyType;
        const valueType = this._def.valueType;
        for (const key in ctx.data) {
            pairs.push({
                key: keyType._parse(new ParseInputLazyPath(ctx, key, ctx.path, key)),
                value: valueType._parse(new ParseInputLazyPath(ctx, ctx.data[key], ctx.path, key)),
            });
        }
        if (ctx.common.async) {
            return ParseStatus.mergeObjectAsync(status, pairs);
        }
        else {
            return ParseStatus.mergeObjectSync(status, pairs);
        }
    }
    get element() {
        return this._def.valueType;
    }
    static create(first, second, third) {
        if (second instanceof ZodType) {
            return new ZodRecord({
                keyType: first,
                valueType: second,
                typeName: ZodFirstPartyTypeKind.ZodRecord,
                ...processCreateParams(third),
            });
        }
        return new ZodRecord({
            keyType: ZodString.create(),
            valueType: first,
            typeName: ZodFirstPartyTypeKind.ZodRecord,
            ...processCreateParams(second),
        });
    }
}
class ZodMap extends ZodType {
    get keySchema() {
        return this._def.keyType;
    }
    get valueSchema() {
        return this._def.valueType;
    }
    _parse(input) {
        const { status, ctx } = this._processInputParams(input);
        if (ctx.parsedType !== ZodParsedType.map) {
            addIssueToContext(ctx, {
                code: ZodIssueCode.invalid_type,
                expected: ZodParsedType.map,
                received: ctx.parsedType,
            });
            return INVALID;
        }
        const keyType = this._def.keyType;
        const valueType = this._def.valueType;
        const pairs = [...ctx.data.entries()].map(([key, value], index) => {
            return {
                key: keyType._parse(new ParseInputLazyPath(ctx, key, ctx.path, [index, "key"])),
                value: valueType._parse(new ParseInputLazyPath(ctx, value, ctx.path, [index, "value"])),
            };
        });
        if (ctx.common.async) {
            const finalMap = new Map();
            return Promise.resolve().then(async () => {
                for (const pair of pairs) {
                    const key = await pair.key;
                    const value = await pair.value;
                    if (key.status === "aborted" || value.status === "aborted") {
                        return INVALID;
                    }
                    if (key.status === "dirty" || value.status === "dirty") {
                        status.dirty();
                    }
                    finalMap.set(key.value, value.value);
                }
                return { status: status.value, value: finalMap };
            });
        }
        else {
            const finalMap = new Map();
            for (const pair of pairs) {
                const key = pair.key;
                const value = pair.value;
                if (key.status === "aborted" || value.status === "aborted") {
                    return INVALID;
                }
                if (key.status === "dirty" || value.status === "dirty") {
                    status.dirty();
                }
                finalMap.set(key.value, value.value);
            }
            return { status: status.value, value: finalMap };
        }
    }
}
ZodMap.create = (keyType, valueType, params) => {
    return new ZodMap({
        valueType,
        keyType,
        typeName: ZodFirstPartyTypeKind.ZodMap,
        ...processCreateParams(params),
    });
};
class ZodSet extends ZodType {
    _parse(input) {
        const { status, ctx } = this._processInputParams(input);
        if (ctx.parsedType !== ZodParsedType.set) {
            addIssueToContext(ctx, {
                code: ZodIssueCode.invalid_type,
                expected: ZodParsedType.set,
                received: ctx.parsedType,
            });
            return INVALID;
        }
        const def = this._def;
        if (def.minSize !== null) {
            if (ctx.data.size < def.minSize.value) {
                addIssueToContext(ctx, {
                    code: ZodIssueCode.too_small,
                    minimum: def.minSize.value,
                    type: "set",
                    inclusive: true,
                    exact: false,
                    message: def.minSize.message,
                });
                status.dirty();
            }
        }
        if (def.maxSize !== null) {
            if (ctx.data.size > def.maxSize.value) {
                addIssueToContext(ctx, {
                    code: ZodIssueCode.too_big,
                    maximum: def.maxSize.value,
                    type: "set",
                    inclusive: true,
                    exact: false,
                    message: def.maxSize.message,
                });
                status.dirty();
            }
        }
        const valueType = this._def.valueType;
        function finalizeSet(elements) {
            const parsedSet = new Set();
            for (const element of elements) {
                if (element.status === "aborted")
                    return INVALID;
                if (element.status === "dirty")
                    status.dirty();
                parsedSet.add(element.value);
            }
            return { status: status.value, value: parsedSet };
        }
        const elements = [...ctx.data.values()].map((item, i) => valueType._parse(new ParseInputLazyPath(ctx, item, ctx.path, i)));
        if (ctx.common.async) {
            return Promise.all(elements).then((elements) => finalizeSet(elements));
        }
        else {
            return finalizeSet(elements);
        }
    }
    min(minSize, message) {
        return new ZodSet({
            ...this._def,
            minSize: { value: minSize, message: errorUtil.toString(message) },
        });
    }
    max(maxSize, message) {
        return new ZodSet({
            ...this._def,
            maxSize: { value: maxSize, message: errorUtil.toString(message) },
        });
    }
    size(size, message) {
        return this.min(size, message).max(size, message);
    }
    nonempty(message) {
        return this.min(1, message);
    }
}
ZodSet.create = (valueType, params) => {
    return new ZodSet({
        valueType,
        minSize: null,
        maxSize: null,
        typeName: ZodFirstPartyTypeKind.ZodSet,
        ...processCreateParams(params),
    });
};
class ZodFunction extends ZodType {
    constructor() {
        super(...arguments);
        this.validate = this.implement;
    }
    _parse(input) {
        const { ctx } = this._processInputParams(input);
        if (ctx.parsedType !== ZodParsedType.function) {
            addIssueToContext(ctx, {
                code: ZodIssueCode.invalid_type,
                expected: ZodParsedType.function,
                received: ctx.parsedType,
            });
            return INVALID;
        }
        function makeArgsIssue(args, error) {
            return makeIssue({
                data: args,
                path: ctx.path,
                errorMaps: [
                    ctx.common.contextualErrorMap,
                    ctx.schemaErrorMap,
                    getErrorMap(),
                    errorMap,
                ].filter((x) => !!x),
                issueData: {
                    code: ZodIssueCode.invalid_arguments,
                    argumentsError: error,
                },
            });
        }
        function makeReturnsIssue(returns, error) {
            return makeIssue({
                data: returns,
                path: ctx.path,
                errorMaps: [
                    ctx.common.contextualErrorMap,
                    ctx.schemaErrorMap,
                    getErrorMap(),
                    errorMap,
                ].filter((x) => !!x),
                issueData: {
                    code: ZodIssueCode.invalid_return_type,
                    returnTypeError: error,
                },
            });
        }
        const params = { errorMap: ctx.common.contextualErrorMap };
        const fn = ctx.data;
        if (this._def.returns instanceof ZodPromise) {
            // Would love a way to avoid disabling this rule, but we need
            // an alias (using an arrow function was what caused 2651).
            // eslint-disable-next-line @typescript-eslint/no-this-alias
            const me = this;
            return OK(async function (...args) {
                const error = new ZodError([]);
                const parsedArgs = await me._def.args
                    .parseAsync(args, params)
                    .catch((e) => {
                    error.addIssue(makeArgsIssue(args, e));
                    throw error;
                });
                const result = await Reflect.apply(fn, this, parsedArgs);
                const parsedReturns = await me._def.returns._def.type
                    .parseAsync(result, params)
                    .catch((e) => {
                    error.addIssue(makeReturnsIssue(result, e));
                    throw error;
                });
                return parsedReturns;
            });
        }
        else {
            // Would love a way to avoid disabling this rule, but we need
            // an alias (using an arrow function was what caused 2651).
            // eslint-disable-next-line @typescript-eslint/no-this-alias
            const me = this;
            return OK(function (...args) {
                const parsedArgs = me._def.args.safeParse(args, params);
                if (!parsedArgs.success) {
                    throw new ZodError([makeArgsIssue(args, parsedArgs.error)]);
                }
                const result = Reflect.apply(fn, this, parsedArgs.data);
                const parsedReturns = me._def.returns.safeParse(result, params);
                if (!parsedReturns.success) {
                    throw new ZodError([makeReturnsIssue(result, parsedReturns.error)]);
                }
                return parsedReturns.data;
            });
        }
    }
    parameters() {
        return this._def.args;
    }
    returnType() {
        return this._def.returns;
    }
    args(...items) {
        return new ZodFunction({
            ...this._def,
            args: ZodTuple.create(items).rest(ZodUnknown.create()),
        });
    }
    returns(returnType) {
        return new ZodFunction({
            ...this._def,
            returns: returnType,
        });
    }
    implement(func) {
        const validatedFunc = this.parse(func);
        return validatedFunc;
    }
    strictImplement(func) {
        const validatedFunc = this.parse(func);
        return validatedFunc;
    }
    static create(args, returns, params) {
        return new ZodFunction({
            args: (args
                ? args
                : ZodTuple.create([]).rest(ZodUnknown.create())),
            returns: returns || ZodUnknown.create(),
            typeName: ZodFirstPartyTypeKind.ZodFunction,
            ...processCreateParams(params),
        });
    }
}
class ZodLazy extends ZodType {
    get schema() {
        return this._def.getter();
    }
    _parse(input) {
        const { ctx } = this._processInputParams(input);
        const lazySchema = this._def.getter();
        return lazySchema._parse({ data: ctx.data, path: ctx.path, parent: ctx });
    }
}
ZodLazy.create = (getter, params) => {
    return new ZodLazy({
        getter: getter,
        typeName: ZodFirstPartyTypeKind.ZodLazy,
        ...processCreateParams(params),
    });
};
class ZodLiteral extends ZodType {
    _parse(input) {
        if (input.data !== this._def.value) {
            const ctx = this._getOrReturnCtx(input);
            addIssueToContext(ctx, {
                received: ctx.data,
                code: ZodIssueCode.invalid_literal,
                expected: this._def.value,
            });
            return INVALID;
        }
        return { status: "valid", value: input.data };
    }
    get value() {
        return this._def.value;
    }
}
ZodLiteral.create = (value, params) => {
    return new ZodLiteral({
        value: value,
        typeName: ZodFirstPartyTypeKind.ZodLiteral,
        ...processCreateParams(params),
    });
};
function createZodEnum(values, params) {
    return new ZodEnum({
        values,
        typeName: ZodFirstPartyTypeKind.ZodEnum,
        ...processCreateParams(params),
    });
}
class ZodEnum extends ZodType {
    _parse(input) {
        if (typeof input.data !== "string") {
            const ctx = this._getOrReturnCtx(input);
            const expectedValues = this._def.values;
            addIssueToContext(ctx, {
                expected: util.joinValues(expectedValues),
                received: ctx.parsedType,
                code: ZodIssueCode.invalid_type,
            });
            return INVALID;
        }
        if (this._def.values.indexOf(input.data) === -1) {
            const ctx = this._getOrReturnCtx(input);
            const expectedValues = this._def.values;
            addIssueToContext(ctx, {
                received: ctx.data,
                code: ZodIssueCode.invalid_enum_value,
                options: expectedValues,
            });
            return INVALID;
        }
        return OK(input.data);
    }
    get options() {
        return this._def.values;
    }
    get enum() {
        const enumValues = {};
        for (const val of this._def.values) {
            enumValues[val] = val;
        }
        return enumValues;
    }
    get Values() {
        const enumValues = {};
        for (const val of this._def.values) {
            enumValues[val] = val;
        }
        return enumValues;
    }
    get Enum() {
        const enumValues = {};
        for (const val of this._def.values) {
            enumValues[val] = val;
        }
        return enumValues;
    }
    extract(values) {
        return ZodEnum.create(values);
    }
    exclude(values) {
        return ZodEnum.create(this.options.filter((opt) => !values.includes(opt)));
    }
}
ZodEnum.create = createZodEnum;
class ZodNativeEnum extends ZodType {
    _parse(input) {
        const nativeEnumValues = util.getValidEnumValues(this._def.values);
        const ctx = this._getOrReturnCtx(input);
        if (ctx.parsedType !== ZodParsedType.string &&
            ctx.parsedType !== ZodParsedType.number) {
            const expectedValues = util.objectValues(nativeEnumValues);
            addIssueToContext(ctx, {
                expected: util.joinValues(expectedValues),
                received: ctx.parsedType,
                code: ZodIssueCode.invalid_type,
            });
            return INVALID;
        }
        if (nativeEnumValues.indexOf(input.data) === -1) {
            const expectedValues = util.objectValues(nativeEnumValues);
            addIssueToContext(ctx, {
                received: ctx.data,
                code: ZodIssueCode.invalid_enum_value,
                options: expectedValues,
            });
            return INVALID;
        }
        return OK(input.data);
    }
    get enum() {
        return this._def.values;
    }
}
ZodNativeEnum.create = (values, params) => {
    return new ZodNativeEnum({
        values: values,
        typeName: ZodFirstPartyTypeKind.ZodNativeEnum,
        ...processCreateParams(params),
    });
};
class ZodPromise extends ZodType {
    unwrap() {
        return this._def.type;
    }
    _parse(input) {
        const { ctx } = this._processInputParams(input);
        if (ctx.parsedType !== ZodParsedType.promise &&
            ctx.common.async === false) {
            addIssueToContext(ctx, {
                code: ZodIssueCode.invalid_type,
                expected: ZodParsedType.promise,
                received: ctx.parsedType,
            });
            return INVALID;
        }
        const promisified = ctx.parsedType === ZodParsedType.promise
            ? ctx.data
            : Promise.resolve(ctx.data);
        return OK(promisified.then((data) => {
            return this._def.type.parseAsync(data, {
                path: ctx.path,
                errorMap: ctx.common.contextualErrorMap,
            });
        }));
    }
}
ZodPromise.create = (schema, params) => {
    return new ZodPromise({
        type: schema,
        typeName: ZodFirstPartyTypeKind.ZodPromise,
        ...processCreateParams(params),
    });
};
class ZodEffects extends ZodType {
    innerType() {
        return this._def.schema;
    }
    sourceType() {
        return this._def.schema._def.typeName === ZodFirstPartyTypeKind.ZodEffects
            ? this._def.schema.sourceType()
            : this._def.schema;
    }
    _parse(input) {
        const { status, ctx } = this._processInputParams(input);
        const effect = this._def.effect || null;
        const checkCtx = {
            addIssue: (arg) => {
                addIssueToContext(ctx, arg);
                if (arg.fatal) {
                    status.abort();
                }
                else {
                    status.dirty();
                }
            },
            get path() {
                return ctx.path;
            },
        };
        checkCtx.addIssue = checkCtx.addIssue.bind(checkCtx);
        if (effect.type === "preprocess") {
            const processed = effect.transform(ctx.data, checkCtx);
            if (ctx.common.issues.length) {
                return {
                    status: "dirty",
                    value: ctx.data,
                };
            }
            if (ctx.common.async) {
                return Promise.resolve(processed).then((processed) => {
                    return this._def.schema._parseAsync({
                        data: processed,
                        path: ctx.path,
                        parent: ctx,
                    });
                });
            }
            else {
                return this._def.schema._parseSync({
                    data: processed,
                    path: ctx.path,
                    parent: ctx,
                });
            }
        }
        if (effect.type === "refinement") {
            const executeRefinement = (acc
            // effect: RefinementEffect<any>
            ) => {
                const result = effect.refinement(acc, checkCtx);
                if (ctx.common.async) {
                    return Promise.resolve(result);
                }
                if (result instanceof Promise) {
                    throw new Error("Async refinement encountered during synchronous parse operation. Use .parseAsync instead.");
                }
                return acc;
            };
            if (ctx.common.async === false) {
                const inner = this._def.schema._parseSync({
                    data: ctx.data,
                    path: ctx.path,
                    parent: ctx,
                });
                if (inner.status === "aborted")
                    return INVALID;
                if (inner.status === "dirty")
                    status.dirty();
                // return value is ignored
                executeRefinement(inner.value);
                return { status: status.value, value: inner.value };
            }
            else {
                return this._def.schema
                    ._parseAsync({ data: ctx.data, path: ctx.path, parent: ctx })
                    .then((inner) => {
                    if (inner.status === "aborted")
                        return INVALID;
                    if (inner.status === "dirty")
                        status.dirty();
                    return executeRefinement(inner.value).then(() => {
                        return { status: status.value, value: inner.value };
                    });
                });
            }
        }
        if (effect.type === "transform") {
            if (ctx.common.async === false) {
                const base = this._def.schema._parseSync({
                    data: ctx.data,
                    path: ctx.path,
                    parent: ctx,
                });
                if (!isValid(base))
                    return base;
                const result = effect.transform(base.value, checkCtx);
                if (result instanceof Promise) {
                    throw new Error(`Asynchronous transform encountered during synchronous parse operation. Use .parseAsync instead.`);
                }
                return { status: status.value, value: result };
            }
            else {
                return this._def.schema
                    ._parseAsync({ data: ctx.data, path: ctx.path, parent: ctx })
                    .then((base) => {
                    if (!isValid(base))
                        return base;
                    return Promise.resolve(effect.transform(base.value, checkCtx)).then((result) => ({ status: status.value, value: result }));
                });
            }
        }
        util.assertNever(effect);
    }
}
ZodEffects.create = (schema, effect, params) => {
    return new ZodEffects({
        schema,
        typeName: ZodFirstPartyTypeKind.ZodEffects,
        effect,
        ...processCreateParams(params),
    });
};
ZodEffects.createWithPreprocess = (preprocess, schema, params) => {
    return new ZodEffects({
        schema,
        effect: { type: "preprocess", transform: preprocess },
        typeName: ZodFirstPartyTypeKind.ZodEffects,
        ...processCreateParams(params),
    });
};
class ZodOptional extends ZodType {
    _parse(input) {
        const parsedType = this._getType(input);
        if (parsedType === ZodParsedType.undefined) {
            return OK(undefined);
        }
        return this._def.innerType._parse(input);
    }
    unwrap() {
        return this._def.innerType;
    }
}
ZodOptional.create = (type, params) => {
    return new ZodOptional({
        innerType: type,
        typeName: ZodFirstPartyTypeKind.ZodOptional,
        ...processCreateParams(params),
    });
};
class ZodNullable extends ZodType {
    _parse(input) {
        const parsedType = this._getType(input);
        if (parsedType === ZodParsedType.null) {
            return OK(null);
        }
        return this._def.innerType._parse(input);
    }
    unwrap() {
        return this._def.innerType;
    }
}
ZodNullable.create = (type, params) => {
    return new ZodNullable({
        innerType: type,
        typeName: ZodFirstPartyTypeKind.ZodNullable,
        ...processCreateParams(params),
    });
};
class ZodDefault extends ZodType {
    _parse(input) {
        const { ctx } = this._processInputParams(input);
        let data = ctx.data;
        if (ctx.parsedType === ZodParsedType.undefined) {
            data = this._def.defaultValue();
        }
        return this._def.innerType._parse({
            data,
            path: ctx.path,
            parent: ctx,
        });
    }
    removeDefault() {
        return this._def.innerType;
    }
}
ZodDefault.create = (type, params) => {
    return new ZodDefault({
        innerType: type,
        typeName: ZodFirstPartyTypeKind.ZodDefault,
        defaultValue: typeof params.default === "function"
            ? params.default
            : () => params.default,
        ...processCreateParams(params),
    });
};
class ZodCatch extends ZodType {
    _parse(input) {
        const { ctx } = this._processInputParams(input);
        // newCtx is used to not collect issues from inner types in ctx
        const newCtx = {
            ...ctx,
            common: {
                ...ctx.common,
                issues: [],
            },
        };
        const result = this._def.innerType._parse({
            data: newCtx.data,
            path: newCtx.path,
            parent: {
                ...newCtx,
            },
        });
        if (isAsync(result)) {
            return result.then((result) => {
                return {
                    status: "valid",
                    value: result.status === "valid"
                        ? result.value
                        : this._def.catchValue({
                            get error() {
                                return new ZodError(newCtx.common.issues);
                            },
                            input: newCtx.data,
                        }),
                };
            });
        }
        else {
            return {
                status: "valid",
                value: result.status === "valid"
                    ? result.value
                    : this._def.catchValue({
                        get error() {
                            return new ZodError(newCtx.common.issues);
                        },
                        input: newCtx.data,
                    }),
            };
        }
    }
    removeCatch() {
        return this._def.innerType;
    }
}
ZodCatch.create = (type, params) => {
    return new ZodCatch({
        innerType: type,
        typeName: ZodFirstPartyTypeKind.ZodCatch,
        catchValue: typeof params.catch === "function" ? params.catch : () => params.catch,
        ...processCreateParams(params),
    });
};
class ZodNaN extends ZodType {
    _parse(input) {
        const parsedType = this._getType(input);
        if (parsedType !== ZodParsedType.nan) {
            const ctx = this._getOrReturnCtx(input);
            addIssueToContext(ctx, {
                code: ZodIssueCode.invalid_type,
                expected: ZodParsedType.nan,
                received: ctx.parsedType,
            });
            return INVALID;
        }
        return { status: "valid", value: input.data };
    }
}
ZodNaN.create = (params) => {
    return new ZodNaN({
        typeName: ZodFirstPartyTypeKind.ZodNaN,
        ...processCreateParams(params),
    });
};
const BRAND = Symbol("zod_brand");
class ZodBranded extends ZodType {
    _parse(input) {
        const { ctx } = this._processInputParams(input);
        const data = ctx.data;
        return this._def.type._parse({
            data,
            path: ctx.path,
            parent: ctx,
        });
    }
    unwrap() {
        return this._def.type;
    }
}
class ZodPipeline extends ZodType {
    _parse(input) {
        const { status, ctx } = this._processInputParams(input);
        if (ctx.common.async) {
            const handleAsync = async () => {
                const inResult = await this._def.in._parseAsync({
                    data: ctx.data,
                    path: ctx.path,
                    parent: ctx,
                });
                if (inResult.status === "aborted")
                    return INVALID;
                if (inResult.status === "dirty") {
                    status.dirty();
                    return DIRTY(inResult.value);
                }
                else {
                    return this._def.out._parseAsync({
                        data: inResult.value,
                        path: ctx.path,
                        parent: ctx,
                    });
                }
            };
            return handleAsync();
        }
        else {
            const inResult = this._def.in._parseSync({
                data: ctx.data,
                path: ctx.path,
                parent: ctx,
            });
            if (inResult.status === "aborted")
                return INVALID;
            if (inResult.status === "dirty") {
                status.dirty();
                return {
                    status: "dirty",
                    value: inResult.value,
                };
            }
            else {
                return this._def.out._parseSync({
                    data: inResult.value,
                    path: ctx.path,
                    parent: ctx,
                });
            }
        }
    }
    static create(a, b) {
        return new ZodPipeline({
            in: a,
            out: b,
            typeName: ZodFirstPartyTypeKind.ZodPipeline,
        });
    }
}
class ZodReadonly extends ZodType {
    _parse(input) {
        const result = this._def.innerType._parse(input);
        if (isValid(result)) {
            result.value = Object.freeze(result.value);
        }
        return result;
    }
}
ZodReadonly.create = (type, params) => {
    return new ZodReadonly({
        innerType: type,
        typeName: ZodFirstPartyTypeKind.ZodReadonly,
        ...processCreateParams(params),
    });
};
const custom = (check, params = {}, 
/**
 * @deprecated
 *
 * Pass `fatal` into the params object instead:
 *
 * ```ts
 * z.string().custom((val) => val.length > 5, { fatal: false })
 * ```
 *
 */
fatal) => {
    if (check)
        return ZodAny.create().superRefine((data, ctx) => {
            var _a, _b;
            if (!check(data)) {
                const p = typeof params === "function"
                    ? params(data)
                    : typeof params === "string"
                        ? { message: params }
                        : params;
                const _fatal = (_b = (_a = p.fatal) !== null && _a !== void 0 ? _a : fatal) !== null && _b !== void 0 ? _b : true;
                const p2 = typeof p === "string" ? { message: p } : p;
                ctx.addIssue({ code: "custom", ...p2, fatal: _fatal });
            }
        });
    return ZodAny.create();
};
const late = {
    object: ZodObject.lazycreate,
};
var ZodFirstPartyTypeKind;
(function (ZodFirstPartyTypeKind) {
    ZodFirstPartyTypeKind["ZodString"] = "ZodString";
    ZodFirstPartyTypeKind["ZodNumber"] = "ZodNumber";
    ZodFirstPartyTypeKind["ZodNaN"] = "ZodNaN";
    ZodFirstPartyTypeKind["ZodBigInt"] = "ZodBigInt";
    ZodFirstPartyTypeKind["ZodBoolean"] = "ZodBoolean";
    ZodFirstPartyTypeKind["ZodDate"] = "ZodDate";
    ZodFirstPartyTypeKind["ZodSymbol"] = "ZodSymbol";
    ZodFirstPartyTypeKind["ZodUndefined"] = "ZodUndefined";
    ZodFirstPartyTypeKind["ZodNull"] = "ZodNull";
    ZodFirstPartyTypeKind["ZodAny"] = "ZodAny";
    ZodFirstPartyTypeKind["ZodUnknown"] = "ZodUnknown";
    ZodFirstPartyTypeKind["ZodNever"] = "ZodNever";
    ZodFirstPartyTypeKind["ZodVoid"] = "ZodVoid";
    ZodFirstPartyTypeKind["ZodArray"] = "ZodArray";
    ZodFirstPartyTypeKind["ZodObject"] = "ZodObject";
    ZodFirstPartyTypeKind["ZodUnion"] = "ZodUnion";
    ZodFirstPartyTypeKind["ZodDiscriminatedUnion"] = "ZodDiscriminatedUnion";
    ZodFirstPartyTypeKind["ZodIntersection"] = "ZodIntersection";
    ZodFirstPartyTypeKind["ZodTuple"] = "ZodTuple";
    ZodFirstPartyTypeKind["ZodRecord"] = "ZodRecord";
    ZodFirstPartyTypeKind["ZodMap"] = "ZodMap";
    ZodFirstPartyTypeKind["ZodSet"] = "ZodSet";
    ZodFirstPartyTypeKind["ZodFunction"] = "ZodFunction";
    ZodFirstPartyTypeKind["ZodLazy"] = "ZodLazy";
    ZodFirstPartyTypeKind["ZodLiteral"] = "ZodLiteral";
    ZodFirstPartyTypeKind["ZodEnum"] = "ZodEnum";
    ZodFirstPartyTypeKind["ZodEffects"] = "ZodEffects";
    ZodFirstPartyTypeKind["ZodNativeEnum"] = "ZodNativeEnum";
    ZodFirstPartyTypeKind["ZodOptional"] = "ZodOptional";
    ZodFirstPartyTypeKind["ZodNullable"] = "ZodNullable";
    ZodFirstPartyTypeKind["ZodDefault"] = "ZodDefault";
    ZodFirstPartyTypeKind["ZodCatch"] = "ZodCatch";
    ZodFirstPartyTypeKind["ZodPromise"] = "ZodPromise";
    ZodFirstPartyTypeKind["ZodBranded"] = "ZodBranded";
    ZodFirstPartyTypeKind["ZodPipeline"] = "ZodPipeline";
    ZodFirstPartyTypeKind["ZodReadonly"] = "ZodReadonly";
})(ZodFirstPartyTypeKind || (ZodFirstPartyTypeKind = {}));
const instanceOfType = (
// const instanceOfType = <T extends new (...args: any[]) => any>(
cls, params = {
    message: `Input not instance of ${cls.name}`,
}) => custom((data) => data instanceof cls, params);
const stringType = ZodString.create;
const numberType = ZodNumber.create;
const nanType = ZodNaN.create;
const bigIntType = ZodBigInt.create;
const booleanType = ZodBoolean.create;
const dateType$1 = ZodDate.create;
const symbolType = ZodSymbol.create;
const undefinedType = ZodUndefined.create;
const nullType = ZodNull.create;
const anyType = ZodAny.create;
const unknownType = ZodUnknown.create;
const neverType = ZodNever.create;
const voidType = ZodVoid.create;
const arrayType = ZodArray.create;
const objectType = ZodObject.create;
const strictObjectType = ZodObject.strictCreate;
const unionType = ZodUnion.create;
const discriminatedUnionType = ZodDiscriminatedUnion.create;
const intersectionType = ZodIntersection.create;
const tupleType = ZodTuple.create;
const recordType = ZodRecord.create;
const mapType = ZodMap.create;
const setType = ZodSet.create;
const functionType = ZodFunction.create;
const lazyType = ZodLazy.create;
const literalType = ZodLiteral.create;
const enumType = ZodEnum.create;
const nativeEnumType = ZodNativeEnum.create;
const promiseType = ZodPromise.create;
const effectsType = ZodEffects.create;
const optionalType = ZodOptional.create;
const nullableType = ZodNullable.create;
const preprocessType = ZodEffects.createWithPreprocess;
const pipelineType = ZodPipeline.create;
const ostring = () => stringType().optional();
const onumber = () => numberType().optional();
const oboolean = () => booleanType().optional();
const coerce = {
    string: ((arg) => ZodString.create({ ...arg, coerce: true })),
    number: ((arg) => ZodNumber.create({ ...arg, coerce: true })),
    boolean: ((arg) => ZodBoolean.create({
        ...arg,
        coerce: true,
    })),
    bigint: ((arg) => ZodBigInt.create({ ...arg, coerce: true })),
    date: ((arg) => ZodDate.create({ ...arg, coerce: true })),
};
const NEVER = INVALID;

var z = /*#__PURE__*/Object.freeze({
    __proto__: null,
    defaultErrorMap: errorMap,
    setErrorMap: setErrorMap,
    getErrorMap: getErrorMap,
    makeIssue: makeIssue,
    EMPTY_PATH: EMPTY_PATH,
    addIssueToContext: addIssueToContext,
    ParseStatus: ParseStatus,
    INVALID: INVALID,
    DIRTY: DIRTY,
    OK: OK,
    isAborted: isAborted,
    isDirty: isDirty,
    isValid: isValid,
    isAsync: isAsync,
    get util () { return util; },
    get objectUtil () { return objectUtil; },
    ZodParsedType: ZodParsedType,
    getParsedType: getParsedType,
    ZodType: ZodType,
    ZodString: ZodString,
    ZodNumber: ZodNumber,
    ZodBigInt: ZodBigInt,
    ZodBoolean: ZodBoolean,
    ZodDate: ZodDate,
    ZodSymbol: ZodSymbol,
    ZodUndefined: ZodUndefined,
    ZodNull: ZodNull,
    ZodAny: ZodAny,
    ZodUnknown: ZodUnknown,
    ZodNever: ZodNever,
    ZodVoid: ZodVoid,
    ZodArray: ZodArray,
    ZodObject: ZodObject,
    ZodUnion: ZodUnion,
    ZodDiscriminatedUnion: ZodDiscriminatedUnion,
    ZodIntersection: ZodIntersection,
    ZodTuple: ZodTuple,
    ZodRecord: ZodRecord,
    ZodMap: ZodMap,
    ZodSet: ZodSet,
    ZodFunction: ZodFunction,
    ZodLazy: ZodLazy,
    ZodLiteral: ZodLiteral,
    ZodEnum: ZodEnum,
    ZodNativeEnum: ZodNativeEnum,
    ZodPromise: ZodPromise,
    ZodEffects: ZodEffects,
    ZodTransformer: ZodEffects,
    ZodOptional: ZodOptional,
    ZodNullable: ZodNullable,
    ZodDefault: ZodDefault,
    ZodCatch: ZodCatch,
    ZodNaN: ZodNaN,
    BRAND: BRAND,
    ZodBranded: ZodBranded,
    ZodPipeline: ZodPipeline,
    ZodReadonly: ZodReadonly,
    custom: custom,
    Schema: ZodType,
    ZodSchema: ZodType,
    late: late,
    get ZodFirstPartyTypeKind () { return ZodFirstPartyTypeKind; },
    coerce: coerce,
    any: anyType,
    array: arrayType,
    bigint: bigIntType,
    boolean: booleanType,
    date: dateType$1,
    discriminatedUnion: discriminatedUnionType,
    effect: effectsType,
    'enum': enumType,
    'function': functionType,
    'instanceof': instanceOfType,
    intersection: intersectionType,
    lazy: lazyType,
    literal: literalType,
    map: mapType,
    nan: nanType,
    nativeEnum: nativeEnumType,
    never: neverType,
    'null': nullType,
    nullable: nullableType,
    number: numberType,
    object: objectType,
    oboolean: oboolean,
    onumber: onumber,
    optional: optionalType,
    ostring: ostring,
    pipeline: pipelineType,
    preprocess: preprocessType,
    promise: promiseType,
    record: recordType,
    set: setType,
    strictObject: strictObjectType,
    string: stringType,
    symbol: symbolType,
    transformer: effectsType,
    tuple: tupleType,
    'undefined': undefinedType,
    union: unionType,
    unknown: unknownType,
    'void': voidType,
    NEVER: NEVER,
    ZodIssueCode: ZodIssueCode,
    quotelessJson: quotelessJson,
    ZodError: ZodError
});

async function safeFetch(url, options = {}, onNotOK = () => {
  throw new Error(`Request to ${url} returned a non-OK status code.`);
}) {
  const response = await fetch(url, options);
  if (!response.ok) {
    await onNotOK(response);
  }
  return response;
}

!!process.versions?.webcontainer;
const remoteResultSchema = z.object({
  columns: z.array(z.string()),
  columnTypes: z.array(z.string()),
  rows: z.array(z.array(z.unknown())),
  rowsAffected: z.number(),
  lastInsertRowid: z.unknown().optional()
});
function createRemoteDatabaseClient(appToken, remoteDbURL) {
  const url = new URL("/db/query", remoteDbURL);
  const db = drizzle(
    async (sql, parameters, method) => {
      const requestBody = { sql, args: parameters };
      const res = await safeFetch(
        url,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${appToken}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify(requestBody)
        },
        (response) => {
          throw new Error(
            `Failed to execute query.
Query: ${sql}
Full error: ${response.status} ${response.statusText}`
          );
        }
      );
      let remoteResult;
      try {
        const json = await res.json();
        remoteResult = remoteResultSchema.parse(json);
      } catch (e) {
        throw new Error(
          `Failed to execute query.
Query: ${sql}
Full error: Unexpected JSON response. ${e instanceof Error ? e.message : String(e)}`
        );
      }
      if (method === "run")
        return remoteResult;
      const rowValues = [];
      for (const row of remoteResult.rows) {
        if (row != null && typeof row === "object") {
          rowValues.push(Object.values(row));
        }
      }
      if (method === "get") {
        return { rows: rowValues[0] };
      }
      return { rows: rowValues };
    },
    async (queries) => {
      const stmts = queries.map(({ sql, params }) => ({ sql, args: params }));
      const res = await safeFetch(
        url,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${appToken}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify(stmts)
        },
        (response) => {
          throw new Error(
            `Failed to execute batch queries.
Full error: ${response.status} ${response.statusText}}`
          );
        }
      );
      let remoteResults;
      try {
        const json = await res.json();
        remoteResults = z.array(remoteResultSchema).parse(json);
      } catch (e) {
        throw new Error(
          `Failed to execute batch queries.
Full error: Unexpected JSON response. ${e instanceof Error ? e.message : String(e)}`
        );
      }
      let results = [];
      for (const [idx, rawResult] of remoteResults.entries()) {
        if (queries[idx]?.method === "run") {
          results.push(rawResult);
          continue;
        }
        const rowValues = [];
        for (const row of rawResult.rows) {
          if (row != null && typeof row === "object") {
            rowValues.push(Object.values(row));
          }
        }
        if (queries[idx]?.method === "get") {
          results.push({ rows: rowValues[0] });
        }
        results.push({ rows: rowValues });
      }
      return results;
    }
  );
  return db;
}

`${red("\u25B6 Login required!")}

  To authenticate with Astro Studio, run
  ${cyan("astro db login")}
`;
`${red("\u25B6 Directory not linked.")}

  To link this directory to an Astro Studio project, run
  ${cyan("astro db link")}
`;
`${red(
  "\u25B6 No file path provided."
)} Provide a path by running ${cyan("astro db execute <path>")}
`;
`${red(
  "\u25B6 Please provide a query to execute using the --query flag."
)}
`;

function hasPrimaryKey(column) {
  return "primaryKey" in column.schema && !!column.schema.primaryKey;
}
const dateType = customType({
  dataType() {
    return "text";
  },
  toDriver(value) {
    return value.toISOString();
  },
  fromDriver(value) {
    return new Date(value);
  }
});
const jsonType = customType({
  dataType() {
    return "text";
  },
  toDriver(value) {
    return JSON.stringify(value);
  },
  fromDriver(value) {
    return JSON.parse(value);
  }
});
function asDrizzleTable(name, table) {
  const columns = {};
  if (!Object.entries(table.columns).some(([, column]) => hasPrimaryKey(column))) {
    columns["_id"] = integer("_id").primaryKey();
  }
  for (const [columnName, column] of Object.entries(table.columns)) {
    columns[columnName] = columnMapper(columnName, column);
  }
  const drizzleTable = sqliteTable(name, columns, (ormTable) => {
    const indexes = {};
    for (const [indexName, indexProps] of Object.entries(table.indexes ?? {})) {
      const onColNames = Array.isArray(indexProps.on) ? indexProps.on : [indexProps.on];
      const onCols = onColNames.map((colName) => ormTable[colName]);
      if (!atLeastOne(onCols))
        continue;
      indexes[indexName] = index(indexName).on(...onCols);
    }
    return indexes;
  });
  return drizzleTable;
}
function atLeastOne(arr) {
  return arr.length > 0;
}
function columnMapper(columnName, column) {
  let c;
  switch (column.type) {
    case "text": {
      c = text(columnName);
      if (column.schema.default !== void 0)
        c = c.default(handleSerializedSQL(column.schema.default));
      if (column.schema.primaryKey === true)
        c = c.primaryKey();
      break;
    }
    case "number": {
      c = integer(columnName);
      if (column.schema.default !== void 0)
        c = c.default(handleSerializedSQL(column.schema.default));
      if (column.schema.primaryKey === true)
        c = c.primaryKey();
      break;
    }
    case "boolean": {
      c = integer(columnName, { mode: "boolean" });
      if (column.schema.default !== void 0)
        c = c.default(handleSerializedSQL(column.schema.default));
      break;
    }
    case "json":
      c = jsonType(columnName);
      if (column.schema.default !== void 0)
        c = c.default(column.schema.default);
      break;
    case "date": {
      c = dateType(columnName);
      if (column.schema.default !== void 0) {
        const def = handleSerializedSQL(column.schema.default);
        c = c.default(typeof def === "string" ? new Date(def) : def);
      }
      break;
    }
  }
  if (!column.schema.optional)
    c = c.notNull();
  if (column.schema.unique)
    c = c.unique();
  return c;
}
function handleSerializedSQL(def) {
  if (isSerializedSQL(def)) {
    return sql.raw(def.sql);
  }
  return def;
}

sql`CURRENT_TIMESTAMP`;
sql`TRUE`;
sql`FALSE`;

const db = await createRemoteDatabaseClient(process.env.ASTRO_STUDIO_APP_TOKEN ?? "97208ed03ee8df4d47cf8cff93d034c3642066b6:qhxqwq862vo4ungliyjlau8kvbxo", {"BASE_URL": "/", "MODE": "production", "DEV": false, "PROD": true, "SSR": true, "SITE": undefined, "ASSETS_PREFIX": undefined}.ASTRO_STUDIO_REMOTE_DB_URL ?? "https://db.services.astro.build");
const CVS = asDrizzleTable("CVS", { "columns": { "id": { "type": "text", "schema": { "unique": true, "deprecated": false, "name": "id", "collection": "CVS", "primaryKey": true } }, "name": { "type": "text", "schema": { "unique": false, "deprecated": false, "name": "name", "collection": "CVS", "primaryKey": false, "optional": false } }, "email": { "type": "text", "schema": { "unique": false, "deprecated": false, "name": "email", "collection": "CVS", "primaryKey": false, "optional": false } }, "place": { "type": "text", "schema": { "unique": false, "deprecated": false, "name": "place", "collection": "CVS", "primaryKey": false, "optional": false } }, "position": { "type": "text", "schema": { "unique": false, "deprecated": false, "name": "position", "collection": "CVS", "primaryKey": false, "optional": false } }, "status": { "type": "number", "schema": { "unique": false, "deprecated": false, "name": "status", "collection": "CVS", "primaryKey": false, "optional": false, "default": 1 } }, "createdAt": { "type": "date", "schema": { "optional": false, "unique": false, "deprecated": false, "name": "createdAt", "collection": "CVS" } } }, "deprecated": false });
const ATTACHMENTS = asDrizzleTable("ATTACHMENTS", { "columns": { "id": { "type": "number", "schema": { "unique": false, "deprecated": false, "name": "id", "collection": "ATTACHMENTS", "primaryKey": true } }, "name": { "type": "text", "schema": { "unique": false, "deprecated": false, "name": "name", "collection": "ATTACHMENTS", "primaryKey": false, "optional": false } }, "url": { "type": "text", "schema": { "unique": false, "deprecated": false, "name": "url", "collection": "ATTACHMENTS", "primaryKey": false, "optional": false } }, "size": { "type": "number", "schema": { "unique": false, "deprecated": false, "name": "size", "collection": "ATTACHMENTS", "primaryKey": false, "optional": false } }, "type": { "type": "text", "schema": { "unique": false, "deprecated": false, "name": "type", "collection": "ATTACHMENTS", "primaryKey": false, "optional": false } }, "key": { "type": "text", "schema": { "unique": false, "deprecated": false, "name": "key", "collection": "ATTACHMENTS", "primaryKey": false, "optional": false } }, "cvId": { "type": "text", "schema": { "unique": false, "deprecated": false, "name": "cvId", "collection": "ATTACHMENTS", "primaryKey": false, "optional": false, "references": { "type": "text", "schema": { "unique": true, "deprecated": false, "name": "id", "collection": "CVS", "primaryKey": true } } } } }, "deprecated": false });

async function createContextInner(opts) {
  return {
    session: opts?.session,
    db,
    CVS,
    ATTACHMENTS
  };
}
async function createContext(opts) {
  const contextInner = await createContextInner();
  return {
    ...contextInner
  };
}

function getParseFn$1(procedureParser) {
  const parser = procedureParser;
  if (typeof parser === "function") {
    return parser;
  }
  if (typeof parser.parseAsync === "function") {
    return parser.parseAsync.bind(parser);
  }
  if (typeof parser.parse === "function") {
    return parser.parse.bind(parser);
  }
  if (typeof parser.validateSync === "function") {
    return parser.validateSync.bind(parser);
  }
  if (typeof parser.create === "function") {
    return parser.create.bind(parser);
  }
  if (typeof parser.assert === "function") {
    return (value) => {
      parser.assert(value);
      return value;
    };
  }
  throw new Error("Could not find a validator fn");
}
function mergeWithoutOverrides(obj1, ...objs) {
  const newObj = Object.assign(/* @__PURE__ */ Object.create(null), obj1);
  for (const overrides of objs) {
    for (const key in overrides) {
      if (key in newObj && newObj[key] !== overrides[key]) {
        throw new Error(`Duplicate key ${key}`);
      }
      newObj[key] = overrides[key];
    }
  }
  return newObj;
}
function createMiddlewareFactory() {
  function createMiddlewareInner(middlewares) {
    return {
      _middlewares: middlewares,
      unstable_pipe(middlewareBuilderOrFn) {
        const pipedMiddleware = "_middlewares" in middlewareBuilderOrFn ? middlewareBuilderOrFn._middlewares : [
          middlewareBuilderOrFn
        ];
        return createMiddlewareInner([
          ...middlewares,
          ...pipedMiddleware
        ]);
      }
    };
  }
  function createMiddleware(fn) {
    return createMiddlewareInner([
      fn
    ]);
  }
  return createMiddleware;
}
function isPlainObject$1(obj) {
  return obj && typeof obj === "object" && !Array.isArray(obj);
}
function createInputMiddleware(parse) {
  const inputMiddleware = async ({ next, rawInput, input }) => {
    let parsedInput;
    try {
      parsedInput = await parse(rawInput);
    } catch (cause) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        cause
      });
    }
    const combinedInput = isPlainObject$1(input) && isPlainObject$1(parsedInput) ? {
      ...input,
      ...parsedInput
    } : parsedInput;
    return next({
      input: combinedInput
    });
  };
  inputMiddleware._type = "input";
  return inputMiddleware;
}
function createOutputMiddleware(parse) {
  const outputMiddleware = async ({ next }) => {
    const result = await next();
    if (!result.ok) {
      return result;
    }
    try {
      const data = await parse(result.data);
      return {
        ...result,
        data
      };
    } catch (cause) {
      throw new TRPCError({
        message: "Output validation failed",
        code: "INTERNAL_SERVER_ERROR",
        cause
      });
    }
  };
  outputMiddleware._type = "output";
  return outputMiddleware;
}
const middlewareMarker = "middlewareMarker";
function createNewBuilder(def1, def2) {
  const { middlewares = [], inputs, meta, ...rest } = def2;
  return createBuilder$1({
    ...mergeWithoutOverrides(def1, rest),
    inputs: [
      ...def1.inputs,
      ...inputs ?? []
    ],
    middlewares: [
      ...def1.middlewares,
      ...middlewares
    ],
    meta: def1.meta && meta ? {
      ...def1.meta,
      ...meta
    } : meta ?? def1.meta
  });
}
function createBuilder$1(initDef = {}) {
  const _def = {
    inputs: [],
    middlewares: [],
    ...initDef
  };
  return {
    _def,
    input(input) {
      const parser = getParseFn$1(input);
      return createNewBuilder(_def, {
        inputs: [
          input
        ],
        middlewares: [
          createInputMiddleware(parser)
        ]
      });
    },
    output(output) {
      const parseOutput = getParseFn$1(output);
      return createNewBuilder(_def, {
        output,
        middlewares: [
          createOutputMiddleware(parseOutput)
        ]
      });
    },
    meta(meta) {
      return createNewBuilder(_def, {
        meta
      });
    },
    /**
    * @deprecated
    * This functionality is deprecated and will be removed in the next major version.
    */
    unstable_concat(builder) {
      return createNewBuilder(_def, builder._def);
    },
    use(middlewareBuilderOrFn) {
      const middlewares = "_middlewares" in middlewareBuilderOrFn ? middlewareBuilderOrFn._middlewares : [
        middlewareBuilderOrFn
      ];
      return createNewBuilder(_def, {
        middlewares
      });
    },
    query(resolver) {
      return createResolver({
        ..._def,
        query: true
      }, resolver);
    },
    mutation(resolver) {
      return createResolver({
        ..._def,
        mutation: true
      }, resolver);
    },
    subscription(resolver) {
      return createResolver({
        ..._def,
        subscription: true
      }, resolver);
    }
  };
}
function createResolver(_def, resolver) {
  const finalBuilder = createNewBuilder(_def, {
    resolver,
    middlewares: [
      async function resolveMiddleware(opts) {
        const data = await resolver(opts);
        return {
          marker: middlewareMarker,
          ok: true,
          data,
          ctx: opts.ctx
        };
      }
    ]
  });
  return createProcedureCaller(finalBuilder._def);
}
const codeblock = `
This is a client-only function.
If you want to call this function on the server, see https://trpc.io/docs/server/server-side-calls
`.trim();
function createProcedureCaller(_def) {
  const procedure = async function resolve(opts) {
    if (!opts || !("rawInput" in opts)) {
      throw new Error(codeblock);
    }
    const callRecursive = async (callOpts = {
      index: 0,
      ctx: opts.ctx
    }) => {
      try {
        const middleware = _def.middlewares[callOpts.index];
        const result2 = await middleware({
          ctx: callOpts.ctx,
          type: opts.type,
          path: opts.path,
          rawInput: callOpts.rawInput ?? opts.rawInput,
          meta: _def.meta,
          input: callOpts.input,
          next(_nextOpts) {
            const nextOpts = _nextOpts;
            return callRecursive({
              index: callOpts.index + 1,
              ctx: nextOpts && "ctx" in nextOpts ? {
                ...callOpts.ctx,
                ...nextOpts.ctx
              } : callOpts.ctx,
              input: nextOpts && "input" in nextOpts ? nextOpts.input : callOpts.input,
              rawInput: nextOpts && "rawInput" in nextOpts ? nextOpts.rawInput : callOpts.rawInput
            });
          }
        });
        return result2;
      } catch (cause) {
        return {
          ok: false,
          error: getTRPCErrorFromUnknown(cause),
          marker: middlewareMarker
        };
      }
    };
    const result = await callRecursive();
    if (!result) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "No result from middlewares - did you forget to `return next()`?"
      });
    }
    if (!result.ok) {
      throw result.error;
    }
    return result.data;
  };
  procedure._def = _def;
  procedure.meta = _def.meta;
  return procedure;
}
function mergeRouters(...routerList) {
  const record = mergeWithoutOverrides({}, ...routerList.map((r) => r._def.record));
  const errorFormatter = routerList.reduce((currentErrorFormatter, nextRouter) => {
    if (nextRouter._def._config.errorFormatter && nextRouter._def._config.errorFormatter !== defaultFormatter) {
      if (currentErrorFormatter !== defaultFormatter && currentErrorFormatter !== nextRouter._def._config.errorFormatter) {
        throw new Error("You seem to have several error formatters");
      }
      return nextRouter._def._config.errorFormatter;
    }
    return currentErrorFormatter;
  }, defaultFormatter);
  const transformer = routerList.reduce((prev, current) => {
    if (current._def._config.transformer && current._def._config.transformer !== defaultTransformer) {
      if (prev !== defaultTransformer && prev !== current._def._config.transformer) {
        throw new Error("You seem to have several transformers");
      }
      return current._def._config.transformer;
    }
    return prev;
  }, defaultTransformer);
  const router2 = createRouterFactory({
    errorFormatter,
    transformer,
    isDev: routerList.some((r) => r._def._config.isDev),
    allowOutsideOfServer: routerList.some((r) => r._def._config.allowOutsideOfServer),
    isServer: routerList.some((r) => r._def._config.isServer),
    $types: routerList[0]?._def._config.$types
  })(record);
  return router2;
}
class TRPCBuilder {
  context() {
    return new TRPCBuilder();
  }
  meta() {
    return new TRPCBuilder();
  }
  create(options) {
    return createTRPCInner()(options);
  }
}
const initTRPC = new TRPCBuilder();
function createTRPCInner() {
  return function initTRPCInner(runtime) {
    const errorFormatter = runtime?.errorFormatter ?? defaultFormatter;
    const transformer = getDataTransformer(runtime?.transformer ?? defaultTransformer);
    const config = {
      transformer,
      isDev: runtime?.isDev ?? false,
      allowOutsideOfServer: runtime?.allowOutsideOfServer ?? false,
      errorFormatter,
      isServer: runtime?.isServer ?? isServerDefault,
      /**
      * @internal
      */
      $types: createFlatProxy((key) => {
        throw new Error(`Tried to access "$types.${key}" which is not available at runtime`);
      })
    };
    {
      const isServer = runtime?.isServer ?? isServerDefault;
      if (!isServer && runtime?.allowOutsideOfServer !== true) {
        throw new Error(`You're trying to use @trpc/server in a non-server environment. This is not supported by default.`);
      }
    }
    return {
      /**
      * These are just types, they can't be used
      * @internal
      */
      _config: config,
      /**
      * Builder object for creating procedures
      * @see https://trpc.io/docs/server/procedures
      */
      procedure: createBuilder$1({
        meta: runtime?.defaultMeta
      }),
      /**
      * Create reusable middlewares
      * @see https://trpc.io/docs/server/middlewares
      */
      middleware: createMiddlewareFactory(),
      /**
      * Create a router
      * @see https://trpc.io/docs/server/routers
      */
      router: createRouterFactory(config),
      /**
      * Merge Routers
      * @see https://trpc.io/docs/server/merging-routers
      */
      mergeRouters,
      /**
      * Create a server-side caller for a router
      * @see https://trpc.io/docs/server/server-side-calls
      */
      createCallerFactory: createCallerFactory()
    };
  };
}

const t$1 = initTRPC.context().create({
  isServer: true
});
t$1.middleware;
const publicProcedure = t$1.procedure;

const statusSchema = z.number().min(1, { message: "Invalid Status" }).max(4, { message: "Invalid Status" });
const inputItem$1 = z.object({
  id: z.string(),
  name: z.string(),
  newStatus: statusSchema
});
const inputSchema$3 = inputItem$1.or(z.array(inputItem$1));
const outputItem$1 = z.object({
  name: z.string(),
  newStatus: statusSchema
});
const outputSchema$3 = outputItem$1.or(z.array(outputItem$1));
const changeStatusProcedure = publicProcedure.input(inputSchema$3).output(outputSchema$3).mutation(async ({ input }) => {
  try {
    if (!Array.isArray(input)) {
      const { id, name, newStatus } = input;
      await db.update(CVS).set({ status: newStatus }).where(eq(CVS.id, id));
      return {
        name,
        newStatus
      };
    }
    const queries = [];
    input.forEach(
      (i) => queries.push(
        db.update(CVS).set({ status: i.newStatus }).where(eq(CVS.id, i.id))
      )
    );
    await db.batch(queries);
    return input.map((i) => ({
      name: i.name,
      newStatus: i.newStatus
    }));
  } catch (e) {
    throw new TRPCError({ code: "BAD_REQUEST" });
  }
});

var define_globalThis_process_env_default = {};
const r = /* @__PURE__ */ Object.create(null), E = (e) => define_globalThis_process_env_default || Object.assign({"BASE_URL": "/", "MODE": "production", "DEV": false, "PROD": true, "SSR": true, "SITE": undefined, "ASSETS_PREFIX": undefined}, { NODE: process.env.NODE, SHELL: process.env.SHELL, TERM: process.env.TERM, COLOR: 1, _: process.env._, NODE_ENV: "production" }) || globalThis.Deno?.env.toObject() || globalThis.__env__ || (e ? r : globalThis), s = new Proxy(r, { get(e, o) {
  return E()[o] ?? r[o];
}, has(e, o) {
  const i = E();
  return o in i || o in r;
}, set(e, o, i) {
  const g = E(true);
  return g[o] = i, true;
}, deleteProperty(e, o) {
  if (!o)
    return false;
  const i = E(true);
  return delete i[o], true;
}, ownKeys() {
  const e = E(true);
  return Object.keys(e);
} }), t = typeof process < "u" && process.env && "production" || "", p = [["APPVEYOR"], ["AWS_AMPLIFY", "AWS_APP_ID", { ci: true }], ["AZURE_PIPELINES", "SYSTEM_TEAMFOUNDATIONCOLLECTIONURI"], ["AZURE_STATIC", "INPUT_AZURE_STATIC_WEB_APPS_API_TOKEN"], ["APPCIRCLE", "AC_APPCIRCLE"], ["BAMBOO", "bamboo_planKey"], ["BITBUCKET", "BITBUCKET_COMMIT"], ["BITRISE", "BITRISE_IO"], ["BUDDY", "BUDDY_WORKSPACE_ID"], ["BUILDKITE"], ["CIRCLE", "CIRCLECI"], ["CIRRUS", "CIRRUS_CI"], ["CLOUDFLARE_PAGES", "CF_PAGES", { ci: true }], ["CODEBUILD", "CODEBUILD_BUILD_ARN"], ["CODEFRESH", "CF_BUILD_ID"], ["DRONE"], ["DRONE", "DRONE_BUILD_EVENT"], ["DSARI"], ["GITHUB_ACTIONS"], ["GITLAB", "GITLAB_CI"], ["GITLAB", "CI_MERGE_REQUEST_ID"], ["GOCD", "GO_PIPELINE_LABEL"], ["LAYERCI"], ["HUDSON", "HUDSON_URL"], ["JENKINS", "JENKINS_URL"], ["MAGNUM"], ["NETLIFY"], ["NETLIFY", "NETLIFY_LOCAL", { ci: false }], ["NEVERCODE"], ["RENDER"], ["SAIL", "SAILCI"], ["SEMAPHORE"], ["SCREWDRIVER"], ["SHIPPABLE"], ["SOLANO", "TDDIUM"], ["STRIDER"], ["TEAMCITY", "TEAMCITY_VERSION"], ["TRAVIS"], ["VERCEL", "NOW_BUILDER"], ["VERCEL", "VERCEL", { ci: false }], ["VERCEL", "VERCEL_ENV", { ci: false }], ["APPCENTER", "APPCENTER_BUILD_ID"], ["CODESANDBOX", "CODESANDBOX_SSE", { ci: false }], ["STACKBLITZ"], ["STORMKIT"], ["CLEAVR"], ["ZEABUR"], ["CODESPHERE", "CODESPHERE_APP_ID", { ci: true }], ["RAILWAY", "RAILWAY_PROJECT_ID"], ["RAILWAY", "RAILWAY_SERVICE_ID"]];
function B() {
  if (define_globalThis_process_env_default)
    for (const e of p) {
      const o = e[1] || e[0];
      if (define_globalThis_process_env_default[o])
        return { name: e[0].toLowerCase(), ...e[2] };
    }
  return define_globalThis_process_env_default?.SHELL === "/bin/jsh" && globalThis.process?.versions?.webcontainer ? { name: "stackblitz", ci: false } : { name: "", ci: false };
}
const l = B(); l.name;
function n(e) {
  return e ? e !== "false" : false;
}
const I = globalThis.process?.platform || "", T = n(s.CI) || l.ci !== false, R = n(globalThis.process?.stdout && globalThis.process?.stdout.isTTY); n(s.DEBUG); const C = t === "test" || n(s.TEST), v = t === "dev" || t === "development"; n(s.MINIMAL) || T || C || !R; const a = /^win/i.test(I); !n(s.NO_COLOR) && (n(s.FORCE_COLOR) || (R || a) && s.TERM !== "dumb" || T); const _ = (globalThis.process?.versions?.node || "").replace(/^v/, "") || null; Number(_?.split(".")[0]) || null; const W = globalThis.process || /* @__PURE__ */ Object.create(null), c = { versions: {} }, w = new Proxy(W, { get(e, o) {
  if (o === "env")
    return s;
  if (o in e)
    return e[o];
  if (o in c)
    return c[o];
} }), A = globalThis.process?.release?.name === "node", L = !!globalThis.Bun || !!globalThis.process?.versions?.bun, D = !!globalThis.Deno, O = !!globalThis.fastly, S = !!globalThis.Netlify, N = !!globalThis.EdgeRuntime, u = globalThis.navigator?.userAgent === "Cloudflare-Workers", b = !!globalThis.__lagon__, F = [[S, "netlify"], [N, "edge-light"], [u, "workerd"], [O, "fastly"], [D, "deno"], [L, "bun"], [A, "node"], [b, "lagon"]];
function G() {
  const e = F.find((o) => o[0]);
  if (e)
    return { name: e[1] };
}
const P = G(); P?.name || "";

const mimeTypesInternal = {
    "application/andrew-inset": {
        source: "iana",
        extensions: [
            "ez"
        ],
        compressible: null
    },
    "application/applixware": {
        source: "apache",
        extensions: [
            "aw"
        ],
        compressible: null
    },
    "application/atom+xml": {
        source: "iana",
        compressible: true,
        extensions: [
            "atom"
        ]
    },
    "application/atomcat+xml": {
        source: "iana",
        compressible: true,
        extensions: [
            "atomcat"
        ]
    },
    "application/atomdeleted+xml": {
        source: "iana",
        compressible: true,
        extensions: [
            "atomdeleted"
        ]
    },
    "application/atomsvc+xml": {
        source: "iana",
        compressible: true,
        extensions: [
            "atomsvc"
        ]
    },
    "application/atsc-dwd+xml": {
        source: "iana",
        compressible: true,
        extensions: [
            "dwd"
        ]
    },
    "application/atsc-held+xml": {
        source: "iana",
        compressible: true,
        extensions: [
            "held"
        ]
    },
    "application/atsc-rsat+xml": {
        source: "iana",
        compressible: true,
        extensions: [
            "rsat"
        ]
    },
    "application/calendar+xml": {
        source: "iana",
        compressible: true,
        extensions: [
            "xcs"
        ]
    },
    "application/ccxml+xml": {
        source: "iana",
        compressible: true,
        extensions: [
            "ccxml"
        ]
    },
    "application/cdfx+xml": {
        source: "iana",
        compressible: true,
        extensions: [
            "cdfx"
        ]
    },
    "application/cdmi-capability": {
        source: "iana",
        extensions: [
            "cdmia"
        ],
        compressible: null
    },
    "application/cdmi-container": {
        source: "iana",
        extensions: [
            "cdmic"
        ],
        compressible: null
    },
    "application/cdmi-domain": {
        source: "iana",
        extensions: [
            "cdmid"
        ],
        compressible: null
    },
    "application/cdmi-object": {
        source: "iana",
        extensions: [
            "cdmio"
        ],
        compressible: null
    },
    "application/cdmi-queue": {
        source: "iana",
        extensions: [
            "cdmiq"
        ],
        compressible: null
    },
    "application/cpl+xml": {
        source: "iana",
        compressible: true,
        extensions: [
            "cpl"
        ]
    },
    "application/cu-seeme": {
        source: "apache",
        extensions: [
            "cu"
        ],
        compressible: null
    },
    "application/dash+xml": {
        source: "iana",
        compressible: true,
        extensions: [
            "mpd"
        ]
    },
    "application/dash-patch+xml": {
        source: "iana",
        compressible: true,
        extensions: [
            "mpp"
        ]
    },
    "application/davmount+xml": {
        source: "iana",
        compressible: true,
        extensions: [
            "davmount"
        ]
    },
    "application/docbook+xml": {
        source: "apache",
        compressible: true,
        extensions: [
            "dbk"
        ]
    },
    "application/dssc+der": {
        source: "iana",
        extensions: [
            "dssc"
        ],
        compressible: null
    },
    "application/dssc+xml": {
        source: "iana",
        compressible: true,
        extensions: [
            "xdssc"
        ]
    },
    "application/ecmascript": {
        source: "iana",
        compressible: true,
        extensions: [
            "es",
            "ecma"
        ]
    },
    "application/emma+xml": {
        source: "iana",
        compressible: true,
        extensions: [
            "emma"
        ]
    },
    "application/emotionml+xml": {
        source: "iana",
        compressible: true,
        extensions: [
            "emotionml"
        ]
    },
    "application/epub+zip": {
        source: "iana",
        compressible: false,
        extensions: [
            "epub"
        ]
    },
    "application/exi": {
        source: "iana",
        extensions: [
            "exi"
        ],
        compressible: null
    },
    "application/express": {
        source: "iana",
        extensions: [
            "exp"
        ],
        compressible: null
    },
    "application/fdt+xml": {
        source: "iana",
        compressible: true,
        extensions: [
            "fdt"
        ]
    },
    "application/font-tdpfr": {
        source: "iana",
        extensions: [
            "pfr"
        ],
        compressible: null
    },
    "application/geo+json": {
        source: "iana",
        compressible: true,
        extensions: [
            "geojson"
        ]
    },
    "application/gml+xml": {
        source: "iana",
        compressible: true,
        extensions: [
            "gml"
        ]
    },
    "application/gpx+xml": {
        source: "apache",
        compressible: true,
        extensions: [
            "gpx"
        ]
    },
    "application/gxf": {
        source: "apache",
        extensions: [
            "gxf"
        ],
        compressible: null
    },
    "application/gzip": {
        source: "iana",
        compressible: false,
        extensions: [
            "gz"
        ]
    },
    "application/hyperstudio": {
        source: "iana",
        extensions: [
            "stk"
        ],
        compressible: null
    },
    "application/inkml+xml": {
        source: "iana",
        compressible: true,
        extensions: [
            "ink",
            "inkml"
        ]
    },
    "application/ipfix": {
        source: "iana",
        extensions: [
            "ipfix"
        ],
        compressible: null
    },
    "application/its+xml": {
        source: "iana",
        compressible: true,
        extensions: [
            "its"
        ]
    },
    "application/java-archive": {
        source: "apache",
        compressible: false,
        extensions: [
            "jar",
            "war",
            "ear"
        ]
    },
    "application/java-serialized-object": {
        source: "apache",
        compressible: false,
        extensions: [
            "ser"
        ]
    },
    "application/java-vm": {
        source: "apache",
        compressible: false,
        extensions: [
            "class"
        ]
    },
    "application/javascript": {
        source: "iana",
        charset: "UTF-8",
        compressible: true,
        extensions: [
            "js",
            "mjs"
        ]
    },
    "application/json": {
        source: "iana",
        charset: "UTF-8",
        compressible: true,
        extensions: [
            "json",
            "map"
        ]
    },
    "application/jsonml+json": {
        source: "apache",
        compressible: true,
        extensions: [
            "jsonml"
        ]
    },
    "application/ld+json": {
        source: "iana",
        compressible: true,
        extensions: [
            "jsonld"
        ]
    },
    "application/lgr+xml": {
        source: "iana",
        compressible: true,
        extensions: [
            "lgr"
        ]
    },
    "application/lost+xml": {
        source: "iana",
        compressible: true,
        extensions: [
            "lostxml"
        ]
    },
    "application/mac-binhex40": {
        source: "iana",
        extensions: [
            "hqx"
        ],
        compressible: null
    },
    "application/mac-compactpro": {
        source: "apache",
        extensions: [
            "cpt"
        ],
        compressible: null
    },
    "application/mads+xml": {
        source: "iana",
        compressible: true,
        extensions: [
            "mads"
        ]
    },
    "application/manifest+json": {
        source: "iana",
        charset: "UTF-8",
        compressible: true,
        extensions: [
            "webmanifest"
        ]
    },
    "application/marc": {
        source: "iana",
        extensions: [
            "mrc"
        ],
        compressible: null
    },
    "application/marcxml+xml": {
        source: "iana",
        compressible: true,
        extensions: [
            "mrcx"
        ]
    },
    "application/mathematica": {
        source: "iana",
        extensions: [
            "ma",
            "nb",
            "mb"
        ],
        compressible: null
    },
    "application/mathml+xml": {
        source: "iana",
        compressible: true,
        extensions: [
            "mathml"
        ]
    },
    "application/mbox": {
        source: "iana",
        extensions: [
            "mbox"
        ],
        compressible: null
    },
    "application/media-policy-dataset+xml": {
        source: "iana",
        compressible: true,
        extensions: [
            "mpf"
        ]
    },
    "application/mediaservercontrol+xml": {
        source: "iana",
        compressible: true,
        extensions: [
            "mscml"
        ]
    },
    "application/metalink+xml": {
        source: "apache",
        compressible: true,
        extensions: [
            "metalink"
        ]
    },
    "application/metalink4+xml": {
        source: "iana",
        compressible: true,
        extensions: [
            "meta4"
        ]
    },
    "application/mets+xml": {
        source: "iana",
        compressible: true,
        extensions: [
            "mets"
        ]
    },
    "application/mmt-aei+xml": {
        source: "iana",
        compressible: true,
        extensions: [
            "maei"
        ]
    },
    "application/mmt-usd+xml": {
        source: "iana",
        compressible: true,
        extensions: [
            "musd"
        ]
    },
    "application/mods+xml": {
        source: "iana",
        compressible: true,
        extensions: [
            "mods"
        ]
    },
    "application/mp21": {
        source: "iana",
        extensions: [
            "m21",
            "mp21"
        ],
        compressible: null
    },
    "application/mp4": {
        source: "iana",
        extensions: [
            "mp4s",
            "m4p"
        ],
        compressible: null
    },
    "application/msword": {
        source: "iana",
        compressible: false,
        extensions: [
            "doc",
            "dot"
        ]
    },
    "application/mxf": {
        source: "iana",
        extensions: [
            "mxf"
        ],
        compressible: null
    },
    "application/n-quads": {
        source: "iana",
        extensions: [
            "nq"
        ],
        compressible: null
    },
    "application/n-triples": {
        source: "iana",
        extensions: [
            "nt"
        ],
        compressible: null
    },
    "application/node": {
        source: "iana",
        extensions: [
            "cjs"
        ],
        compressible: null
    },
    "application/octet-stream": {
        source: "iana",
        compressible: false,
        extensions: [
            "bin",
            "dms",
            "lrf",
            "mar",
            "so",
            "dist",
            "distz",
            "pkg",
            "bpk",
            "dump",
            "elc",
            "deploy",
            "exe",
            "dll",
            "deb",
            "dmg",
            "iso",
            "img",
            "msi",
            "msp",
            "msm",
            "buffer"
        ]
    },
    "application/oda": {
        source: "iana",
        extensions: [
            "oda"
        ],
        compressible: null
    },
    "application/oebps-package+xml": {
        source: "iana",
        compressible: true,
        extensions: [
            "opf"
        ]
    },
    "application/ogg": {
        source: "iana",
        compressible: false,
        extensions: [
            "ogx"
        ]
    },
    "application/omdoc+xml": {
        source: "apache",
        compressible: true,
        extensions: [
            "omdoc"
        ]
    },
    "application/onenote": {
        source: "apache",
        extensions: [
            "onetoc",
            "onetoc2",
            "onetmp",
            "onepkg"
        ],
        compressible: null
    },
    "application/oxps": {
        source: "iana",
        extensions: [
            "oxps"
        ],
        compressible: null
    },
    "application/p2p-overlay+xml": {
        source: "iana",
        compressible: true,
        extensions: [
            "relo"
        ]
    },
    "application/patch-ops-error+xml": {
        source: "iana",
        compressible: true,
        extensions: [
            "xer"
        ]
    },
    "application/pdf": {
        source: "iana",
        compressible: false,
        extensions: [
            "pdf"
        ]
    },
    "application/pgp-encrypted": {
        source: "iana",
        compressible: false,
        extensions: [
            "pgp"
        ]
    },
    "application/pgp-keys": {
        source: "iana",
        extensions: [
            "asc"
        ],
        compressible: null
    },
    "application/pgp-signature": {
        source: "iana",
        extensions: [
            "asc",
            "sig"
        ],
        compressible: null
    },
    "application/pics-rules": {
        source: "apache",
        extensions: [
            "prf"
        ],
        compressible: null
    },
    "application/pkcs10": {
        source: "iana",
        extensions: [
            "p10"
        ],
        compressible: null
    },
    "application/pkcs7-mime": {
        source: "iana",
        extensions: [
            "p7m",
            "p7c"
        ],
        compressible: null
    },
    "application/pkcs7-signature": {
        source: "iana",
        extensions: [
            "p7s"
        ],
        compressible: null
    },
    "application/pkcs8": {
        source: "iana",
        extensions: [
            "p8"
        ],
        compressible: null
    },
    "application/pkix-attr-cert": {
        source: "iana",
        extensions: [
            "ac"
        ],
        compressible: null
    },
    "application/pkix-cert": {
        source: "iana",
        extensions: [
            "cer"
        ],
        compressible: null
    },
    "application/pkix-crl": {
        source: "iana",
        extensions: [
            "crl"
        ],
        compressible: null
    },
    "application/pkix-pkipath": {
        source: "iana",
        extensions: [
            "pkipath"
        ],
        compressible: null
    },
    "application/pkixcmp": {
        source: "iana",
        extensions: [
            "pki"
        ],
        compressible: null
    },
    "application/pls+xml": {
        source: "iana",
        compressible: true,
        extensions: [
            "pls"
        ]
    },
    "application/postscript": {
        source: "iana",
        compressible: true,
        extensions: [
            "ai",
            "eps",
            "ps"
        ]
    },
    "application/provenance+xml": {
        source: "iana",
        compressible: true,
        extensions: [
            "provx"
        ]
    },
    "application/prs.cww": {
        source: "iana",
        extensions: [
            "cww"
        ],
        compressible: null
    },
    "application/pskc+xml": {
        source: "iana",
        compressible: true,
        extensions: [
            "pskcxml"
        ]
    },
    "application/rdf+xml": {
        source: "iana",
        compressible: true,
        extensions: [
            "rdf",
            "owl"
        ]
    },
    "application/reginfo+xml": {
        source: "iana",
        compressible: true,
        extensions: [
            "rif"
        ]
    },
    "application/relax-ng-compact-syntax": {
        source: "iana",
        extensions: [
            "rnc"
        ],
        compressible: null
    },
    "application/resource-lists+xml": {
        source: "iana",
        compressible: true,
        extensions: [
            "rl"
        ]
    },
    "application/resource-lists-diff+xml": {
        source: "iana",
        compressible: true,
        extensions: [
            "rld"
        ]
    },
    "application/rls-services+xml": {
        source: "iana",
        compressible: true,
        extensions: [
            "rs"
        ]
    },
    "application/route-apd+xml": {
        source: "iana",
        compressible: true,
        extensions: [
            "rapd"
        ]
    },
    "application/route-s-tsid+xml": {
        source: "iana",
        compressible: true,
        extensions: [
            "sls"
        ]
    },
    "application/route-usd+xml": {
        source: "iana",
        compressible: true,
        extensions: [
            "rusd"
        ]
    },
    "application/rpki-ghostbusters": {
        source: "iana",
        extensions: [
            "gbr"
        ],
        compressible: null
    },
    "application/rpki-manifest": {
        source: "iana",
        extensions: [
            "mft"
        ],
        compressible: null
    },
    "application/rpki-roa": {
        source: "iana",
        extensions: [
            "roa"
        ],
        compressible: null
    },
    "application/rsd+xml": {
        source: "apache",
        compressible: true,
        extensions: [
            "rsd"
        ]
    },
    "application/rss+xml": {
        source: "apache",
        compressible: true,
        extensions: [
            "rss"
        ]
    },
    "application/rtf": {
        source: "iana",
        compressible: true,
        extensions: [
            "rtf"
        ]
    },
    "application/sbml+xml": {
        source: "iana",
        compressible: true,
        extensions: [
            "sbml"
        ]
    },
    "application/scvp-cv-request": {
        source: "iana",
        extensions: [
            "scq"
        ],
        compressible: null
    },
    "application/scvp-cv-response": {
        source: "iana",
        extensions: [
            "scs"
        ],
        compressible: null
    },
    "application/scvp-vp-request": {
        source: "iana",
        extensions: [
            "spq"
        ],
        compressible: null
    },
    "application/scvp-vp-response": {
        source: "iana",
        extensions: [
            "spp"
        ],
        compressible: null
    },
    "application/sdp": {
        source: "iana",
        extensions: [
            "sdp"
        ],
        compressible: null
    },
    "application/senml+xml": {
        source: "iana",
        compressible: true,
        extensions: [
            "senmlx"
        ]
    },
    "application/sensml+xml": {
        source: "iana",
        compressible: true,
        extensions: [
            "sensmlx"
        ]
    },
    "application/set-payment-initiation": {
        source: "iana",
        extensions: [
            "setpay"
        ],
        compressible: null
    },
    "application/set-registration-initiation": {
        source: "iana",
        extensions: [
            "setreg"
        ],
        compressible: null
    },
    "application/shf+xml": {
        source: "iana",
        compressible: true,
        extensions: [
            "shf"
        ]
    },
    "application/sieve": {
        source: "iana",
        extensions: [
            "siv",
            "sieve"
        ],
        compressible: null
    },
    "application/smil+xml": {
        source: "iana",
        compressible: true,
        extensions: [
            "smi",
            "smil"
        ]
    },
    "application/sparql-query": {
        source: "iana",
        extensions: [
            "rq"
        ],
        compressible: null
    },
    "application/sparql-results+xml": {
        source: "iana",
        compressible: true,
        extensions: [
            "srx"
        ]
    },
    "application/srgs": {
        source: "iana",
        extensions: [
            "gram"
        ],
        compressible: null
    },
    "application/srgs+xml": {
        source: "iana",
        compressible: true,
        extensions: [
            "grxml"
        ]
    },
    "application/sru+xml": {
        source: "iana",
        compressible: true,
        extensions: [
            "sru"
        ]
    },
    "application/ssdl+xml": {
        source: "apache",
        compressible: true,
        extensions: [
            "ssdl"
        ]
    },
    "application/ssml+xml": {
        source: "iana",
        compressible: true,
        extensions: [
            "ssml"
        ]
    },
    "application/swid+xml": {
        source: "iana",
        compressible: true,
        extensions: [
            "swidtag"
        ]
    },
    "application/tei+xml": {
        source: "iana",
        compressible: true,
        extensions: [
            "tei",
            "teicorpus"
        ]
    },
    "application/thraud+xml": {
        source: "iana",
        compressible: true,
        extensions: [
            "tfi"
        ]
    },
    "application/timestamped-data": {
        source: "iana",
        extensions: [
            "tsd"
        ],
        compressible: null
    },
    "application/trig": {
        source: "iana",
        extensions: [
            "trig"
        ],
        compressible: null
    },
    "application/ttml+xml": {
        source: "iana",
        compressible: true,
        extensions: [
            "ttml"
        ]
    },
    "application/urc-ressheet+xml": {
        source: "iana",
        compressible: true,
        extensions: [
            "rsheet"
        ]
    },
    "application/urc-targetdesc+xml": {
        source: "iana",
        compressible: true,
        extensions: [
            "td"
        ]
    },
    "application/vnd.1000minds.decision-model+xml": {
        source: "iana",
        compressible: true,
        extensions: [
            "1km"
        ]
    },
    "application/vnd.3gpp.pic-bw-large": {
        source: "iana",
        extensions: [
            "plb"
        ],
        compressible: null
    },
    "application/vnd.3gpp.pic-bw-small": {
        source: "iana",
        extensions: [
            "psb"
        ],
        compressible: null
    },
    "application/vnd.3gpp.pic-bw-var": {
        source: "iana",
        extensions: [
            "pvb"
        ],
        compressible: null
    },
    "application/vnd.3gpp2.tcap": {
        source: "iana",
        extensions: [
            "tcap"
        ],
        compressible: null
    },
    "application/vnd.3m.post-it-notes": {
        source: "iana",
        extensions: [
            "pwn"
        ],
        compressible: null
    },
    "application/vnd.accpac.simply.aso": {
        source: "iana",
        extensions: [
            "aso"
        ],
        compressible: null
    },
    "application/vnd.accpac.simply.imp": {
        source: "iana",
        extensions: [
            "imp"
        ],
        compressible: null
    },
    "application/vnd.acucobol": {
        source: "iana",
        extensions: [
            "acu"
        ],
        compressible: null
    },
    "application/vnd.acucorp": {
        source: "iana",
        extensions: [
            "atc",
            "acutc"
        ],
        compressible: null
    },
    "application/vnd.adobe.air-application-installer-package+zip": {
        source: "apache",
        compressible: false,
        extensions: [
            "air"
        ]
    },
    "application/vnd.adobe.formscentral.fcdt": {
        source: "iana",
        extensions: [
            "fcdt"
        ],
        compressible: null
    },
    "application/vnd.adobe.fxp": {
        source: "iana",
        extensions: [
            "fxp",
            "fxpl"
        ],
        compressible: null
    },
    "application/vnd.adobe.xdp+xml": {
        source: "iana",
        compressible: true,
        extensions: [
            "xdp"
        ]
    },
    "application/vnd.adobe.xfdf": {
        source: "iana",
        extensions: [
            "xfdf"
        ],
        compressible: null
    },
    "application/vnd.age": {
        source: "iana",
        extensions: [
            "age"
        ],
        compressible: null
    },
    "application/vnd.ahead.space": {
        source: "iana",
        extensions: [
            "ahead"
        ],
        compressible: null
    },
    "application/vnd.airzip.filesecure.azf": {
        source: "iana",
        extensions: [
            "azf"
        ],
        compressible: null
    },
    "application/vnd.airzip.filesecure.azs": {
        source: "iana",
        extensions: [
            "azs"
        ],
        compressible: null
    },
    "application/vnd.amazon.ebook": {
        source: "apache",
        extensions: [
            "azw"
        ],
        compressible: null
    },
    "application/vnd.americandynamics.acc": {
        source: "iana",
        extensions: [
            "acc"
        ],
        compressible: null
    },
    "application/vnd.amiga.ami": {
        source: "iana",
        extensions: [
            "ami"
        ],
        compressible: null
    },
    "application/vnd.android.package-archive": {
        source: "apache",
        compressible: false,
        extensions: [
            "apk"
        ]
    },
    "application/vnd.anser-web-certificate-issue-initiation": {
        source: "iana",
        extensions: [
            "cii"
        ],
        compressible: null
    },
    "application/vnd.anser-web-funds-transfer-initiation": {
        source: "apache",
        extensions: [
            "fti"
        ],
        compressible: null
    },
    "application/vnd.antix.game-component": {
        source: "iana",
        extensions: [
            "atx"
        ],
        compressible: null
    },
    "application/vnd.apple.installer+xml": {
        source: "iana",
        compressible: true,
        extensions: [
            "mpkg"
        ]
    },
    "application/vnd.apple.keynote": {
        source: "iana",
        extensions: [
            "key"
        ],
        compressible: null
    },
    "application/vnd.apple.mpegurl": {
        source: "iana",
        extensions: [
            "m3u8"
        ],
        compressible: null
    },
    "application/vnd.apple.numbers": {
        source: "iana",
        extensions: [
            "numbers"
        ],
        compressible: null
    },
    "application/vnd.apple.pages": {
        source: "iana",
        extensions: [
            "pages"
        ],
        compressible: null
    },
    "application/vnd.aristanetworks.swi": {
        source: "iana",
        extensions: [
            "swi"
        ],
        compressible: null
    },
    "application/vnd.astraea-software.iota": {
        source: "iana",
        extensions: [
            "iota"
        ],
        compressible: null
    },
    "application/vnd.audiograph": {
        source: "iana",
        extensions: [
            "aep"
        ],
        compressible: null
    },
    "application/vnd.balsamiq.bmml+xml": {
        source: "iana",
        compressible: true,
        extensions: [
            "bmml"
        ]
    },
    "application/vnd.blueice.multipass": {
        source: "iana",
        extensions: [
            "mpm"
        ],
        compressible: null
    },
    "application/vnd.bmi": {
        source: "iana",
        extensions: [
            "bmi"
        ],
        compressible: null
    },
    "application/vnd.businessobjects": {
        source: "iana",
        extensions: [
            "rep"
        ],
        compressible: null
    },
    "application/vnd.chemdraw+xml": {
        source: "iana",
        compressible: true,
        extensions: [
            "cdxml"
        ]
    },
    "application/vnd.chipnuts.karaoke-mmd": {
        source: "iana",
        extensions: [
            "mmd"
        ],
        compressible: null
    },
    "application/vnd.cinderella": {
        source: "iana",
        extensions: [
            "cdy"
        ],
        compressible: null
    },
    "application/vnd.citationstyles.style+xml": {
        source: "iana",
        compressible: true,
        extensions: [
            "csl"
        ]
    },
    "application/vnd.claymore": {
        source: "iana",
        extensions: [
            "cla"
        ],
        compressible: null
    },
    "application/vnd.cloanto.rp9": {
        source: "iana",
        extensions: [
            "rp9"
        ],
        compressible: null
    },
    "application/vnd.clonk.c4group": {
        source: "iana",
        extensions: [
            "c4g",
            "c4d",
            "c4f",
            "c4p",
            "c4u"
        ],
        compressible: null
    },
    "application/vnd.cluetrust.cartomobile-config": {
        source: "iana",
        extensions: [
            "c11amc"
        ],
        compressible: null
    },
    "application/vnd.cluetrust.cartomobile-config-pkg": {
        source: "iana",
        extensions: [
            "c11amz"
        ],
        compressible: null
    },
    "application/vnd.commonspace": {
        source: "iana",
        extensions: [
            "csp"
        ],
        compressible: null
    },
    "application/vnd.contact.cmsg": {
        source: "iana",
        extensions: [
            "cdbcmsg"
        ],
        compressible: null
    },
    "application/vnd.cosmocaller": {
        source: "iana",
        extensions: [
            "cmc"
        ],
        compressible: null
    },
    "application/vnd.crick.clicker": {
        source: "iana",
        extensions: [
            "clkx"
        ],
        compressible: null
    },
    "application/vnd.crick.clicker.keyboard": {
        source: "iana",
        extensions: [
            "clkk"
        ],
        compressible: null
    },
    "application/vnd.crick.clicker.palette": {
        source: "iana",
        extensions: [
            "clkp"
        ],
        compressible: null
    },
    "application/vnd.crick.clicker.template": {
        source: "iana",
        extensions: [
            "clkt"
        ],
        compressible: null
    },
    "application/vnd.crick.clicker.wordbank": {
        source: "iana",
        extensions: [
            "clkw"
        ],
        compressible: null
    },
    "application/vnd.criticaltools.wbs+xml": {
        source: "iana",
        compressible: true,
        extensions: [
            "wbs"
        ]
    },
    "application/vnd.ctc-posml": {
        source: "iana",
        extensions: [
            "pml"
        ],
        compressible: null
    },
    "application/vnd.cups-ppd": {
        source: "iana",
        extensions: [
            "ppd"
        ],
        compressible: null
    },
    "application/vnd.curl.car": {
        source: "apache",
        extensions: [
            "car"
        ],
        compressible: null
    },
    "application/vnd.curl.pcurl": {
        source: "apache",
        extensions: [
            "pcurl"
        ],
        compressible: null
    },
    "application/vnd.dart": {
        source: "iana",
        compressible: true,
        extensions: [
            "dart"
        ]
    },
    "application/vnd.data-vision.rdz": {
        source: "iana",
        extensions: [
            "rdz"
        ],
        compressible: null
    },
    "application/vnd.dbf": {
        source: "iana",
        extensions: [
            "dbf"
        ],
        compressible: null
    },
    "application/vnd.dece.data": {
        source: "iana",
        extensions: [
            "uvf",
            "uvvf",
            "uvd",
            "uvvd"
        ],
        compressible: null
    },
    "application/vnd.dece.ttml+xml": {
        source: "iana",
        compressible: true,
        extensions: [
            "uvt",
            "uvvt"
        ]
    },
    "application/vnd.dece.unspecified": {
        source: "iana",
        extensions: [
            "uvx",
            "uvvx"
        ],
        compressible: null
    },
    "application/vnd.dece.zip": {
        source: "iana",
        extensions: [
            "uvz",
            "uvvz"
        ],
        compressible: null
    },
    "application/vnd.denovo.fcselayout-link": {
        source: "iana",
        extensions: [
            "fe_launch"
        ],
        compressible: null
    },
    "application/vnd.dna": {
        source: "iana",
        extensions: [
            "dna"
        ],
        compressible: null
    },
    "application/vnd.dolby.mlp": {
        source: "apache",
        extensions: [
            "mlp"
        ],
        compressible: null
    },
    "application/vnd.dpgraph": {
        source: "iana",
        extensions: [
            "dpg"
        ],
        compressible: null
    },
    "application/vnd.dreamfactory": {
        source: "iana",
        extensions: [
            "dfac"
        ],
        compressible: null
    },
    "application/vnd.ds-keypoint": {
        source: "apache",
        extensions: [
            "kpxx"
        ],
        compressible: null
    },
    "application/vnd.dvb.ait": {
        source: "iana",
        extensions: [
            "ait"
        ],
        compressible: null
    },
    "application/vnd.dvb.service": {
        source: "iana",
        extensions: [
            "svc"
        ],
        compressible: null
    },
    "application/vnd.dynageo": {
        source: "iana",
        extensions: [
            "geo"
        ],
        compressible: null
    },
    "application/vnd.ecowin.chart": {
        source: "iana",
        extensions: [
            "mag"
        ],
        compressible: null
    },
    "application/vnd.enliven": {
        source: "iana",
        extensions: [
            "nml"
        ],
        compressible: null
    },
    "application/vnd.epson.esf": {
        source: "iana",
        extensions: [
            "esf"
        ],
        compressible: null
    },
    "application/vnd.epson.msf": {
        source: "iana",
        extensions: [
            "msf"
        ],
        compressible: null
    },
    "application/vnd.epson.quickanime": {
        source: "iana",
        extensions: [
            "qam"
        ],
        compressible: null
    },
    "application/vnd.epson.salt": {
        source: "iana",
        extensions: [
            "slt"
        ],
        compressible: null
    },
    "application/vnd.epson.ssf": {
        source: "iana",
        extensions: [
            "ssf"
        ],
        compressible: null
    },
    "application/vnd.eszigno3+xml": {
        source: "iana",
        compressible: true,
        extensions: [
            "es3",
            "et3"
        ]
    },
    "application/vnd.ezpix-album": {
        source: "iana",
        extensions: [
            "ez2"
        ],
        compressible: null
    },
    "application/vnd.ezpix-package": {
        source: "iana",
        extensions: [
            "ez3"
        ],
        compressible: null
    },
    "application/vnd.fdf": {
        source: "iana",
        extensions: [
            "fdf"
        ],
        compressible: null
    },
    "application/vnd.fdsn.mseed": {
        source: "iana",
        extensions: [
            "mseed"
        ],
        compressible: null
    },
    "application/vnd.fdsn.seed": {
        source: "iana",
        extensions: [
            "seed",
            "dataless"
        ],
        compressible: null
    },
    "application/vnd.flographit": {
        source: "iana",
        extensions: [
            "gph"
        ],
        compressible: null
    },
    "application/vnd.fluxtime.clip": {
        source: "iana",
        extensions: [
            "ftc"
        ],
        compressible: null
    },
    "application/vnd.framemaker": {
        source: "iana",
        extensions: [
            "fm",
            "frame",
            "maker",
            "book"
        ],
        compressible: null
    },
    "application/vnd.frogans.fnc": {
        source: "iana",
        extensions: [
            "fnc"
        ],
        compressible: null
    },
    "application/vnd.frogans.ltf": {
        source: "iana",
        extensions: [
            "ltf"
        ],
        compressible: null
    },
    "application/vnd.fsc.weblaunch": {
        source: "iana",
        extensions: [
            "fsc"
        ],
        compressible: null
    },
    "application/vnd.fujitsu.oasys": {
        source: "iana",
        extensions: [
            "oas"
        ],
        compressible: null
    },
    "application/vnd.fujitsu.oasys2": {
        source: "iana",
        extensions: [
            "oa2"
        ],
        compressible: null
    },
    "application/vnd.fujitsu.oasys3": {
        source: "iana",
        extensions: [
            "oa3"
        ],
        compressible: null
    },
    "application/vnd.fujitsu.oasysgp": {
        source: "iana",
        extensions: [
            "fg5"
        ],
        compressible: null
    },
    "application/vnd.fujitsu.oasysprs": {
        source: "iana",
        extensions: [
            "bh2"
        ],
        compressible: null
    },
    "application/vnd.fujixerox.ddd": {
        source: "iana",
        extensions: [
            "ddd"
        ],
        compressible: null
    },
    "application/vnd.fujixerox.docuworks": {
        source: "iana",
        extensions: [
            "xdw"
        ],
        compressible: null
    },
    "application/vnd.fujixerox.docuworks.binder": {
        source: "iana",
        extensions: [
            "xbd"
        ],
        compressible: null
    },
    "application/vnd.fuzzysheet": {
        source: "iana",
        extensions: [
            "fzs"
        ],
        compressible: null
    },
    "application/vnd.genomatix.tuxedo": {
        source: "iana",
        extensions: [
            "txd"
        ],
        compressible: null
    },
    "application/vnd.geogebra.file": {
        source: "iana",
        extensions: [
            "ggb"
        ],
        compressible: null
    },
    "application/vnd.geogebra.tool": {
        source: "iana",
        extensions: [
            "ggt"
        ],
        compressible: null
    },
    "application/vnd.geometry-explorer": {
        source: "iana",
        extensions: [
            "gex",
            "gre"
        ],
        compressible: null
    },
    "application/vnd.geonext": {
        source: "iana",
        extensions: [
            "gxt"
        ],
        compressible: null
    },
    "application/vnd.geoplan": {
        source: "iana",
        extensions: [
            "g2w"
        ],
        compressible: null
    },
    "application/vnd.geospace": {
        source: "iana",
        extensions: [
            "g3w"
        ],
        compressible: null
    },
    "application/vnd.gmx": {
        source: "iana",
        extensions: [
            "gmx"
        ],
        compressible: null
    },
    "application/vnd.google-earth.kml+xml": {
        source: "iana",
        compressible: true,
        extensions: [
            "kml"
        ]
    },
    "application/vnd.google-earth.kmz": {
        source: "iana",
        compressible: false,
        extensions: [
            "kmz"
        ]
    },
    "application/vnd.grafeq": {
        source: "iana",
        extensions: [
            "gqf",
            "gqs"
        ],
        compressible: null
    },
    "application/vnd.groove-account": {
        source: "iana",
        extensions: [
            "gac"
        ],
        compressible: null
    },
    "application/vnd.groove-help": {
        source: "iana",
        extensions: [
            "ghf"
        ],
        compressible: null
    },
    "application/vnd.groove-identity-message": {
        source: "iana",
        extensions: [
            "gim"
        ],
        compressible: null
    },
    "application/vnd.groove-injector": {
        source: "iana",
        extensions: [
            "grv"
        ],
        compressible: null
    },
    "application/vnd.groove-tool-message": {
        source: "iana",
        extensions: [
            "gtm"
        ],
        compressible: null
    },
    "application/vnd.groove-tool-template": {
        source: "iana",
        extensions: [
            "tpl"
        ],
        compressible: null
    },
    "application/vnd.groove-vcard": {
        source: "iana",
        extensions: [
            "vcg"
        ],
        compressible: null
    },
    "application/vnd.hal+xml": {
        source: "iana",
        compressible: true,
        extensions: [
            "hal"
        ]
    },
    "application/vnd.handheld-entertainment+xml": {
        source: "iana",
        compressible: true,
        extensions: [
            "zmm"
        ]
    },
    "application/vnd.hbci": {
        source: "iana",
        extensions: [
            "hbci"
        ],
        compressible: null
    },
    "application/vnd.hhe.lesson-player": {
        source: "iana",
        extensions: [
            "les"
        ],
        compressible: null
    },
    "application/vnd.hp-hpgl": {
        source: "iana",
        extensions: [
            "hpgl"
        ],
        compressible: null
    },
    "application/vnd.hp-hpid": {
        source: "iana",
        extensions: [
            "hpid"
        ],
        compressible: null
    },
    "application/vnd.hp-hps": {
        source: "iana",
        extensions: [
            "hps"
        ],
        compressible: null
    },
    "application/vnd.hp-jlyt": {
        source: "iana",
        extensions: [
            "jlt"
        ],
        compressible: null
    },
    "application/vnd.hp-pcl": {
        source: "iana",
        extensions: [
            "pcl"
        ],
        compressible: null
    },
    "application/vnd.hp-pclxl": {
        source: "iana",
        extensions: [
            "pclxl"
        ],
        compressible: null
    },
    "application/vnd.hydrostatix.sof-data": {
        source: "iana",
        extensions: [
            "sfd-hdstx"
        ],
        compressible: null
    },
    "application/vnd.ibm.minipay": {
        source: "iana",
        extensions: [
            "mpy"
        ],
        compressible: null
    },
    "application/vnd.ibm.modcap": {
        source: "iana",
        extensions: [
            "afp",
            "listafp",
            "list3820"
        ],
        compressible: null
    },
    "application/vnd.ibm.rights-management": {
        source: "iana",
        extensions: [
            "irm"
        ],
        compressible: null
    },
    "application/vnd.ibm.secure-container": {
        source: "iana",
        extensions: [
            "sc"
        ],
        compressible: null
    },
    "application/vnd.iccprofile": {
        source: "iana",
        extensions: [
            "icc",
            "icm"
        ],
        compressible: null
    },
    "application/vnd.igloader": {
        source: "iana",
        extensions: [
            "igl"
        ],
        compressible: null
    },
    "application/vnd.immervision-ivp": {
        source: "iana",
        extensions: [
            "ivp"
        ],
        compressible: null
    },
    "application/vnd.immervision-ivu": {
        source: "iana",
        extensions: [
            "ivu"
        ],
        compressible: null
    },
    "application/vnd.insors.igm": {
        source: "iana",
        extensions: [
            "igm"
        ],
        compressible: null
    },
    "application/vnd.intercon.formnet": {
        source: "iana",
        extensions: [
            "xpw",
            "xpx"
        ],
        compressible: null
    },
    "application/vnd.intergeo": {
        source: "iana",
        extensions: [
            "i2g"
        ],
        compressible: null
    },
    "application/vnd.intu.qbo": {
        source: "iana",
        extensions: [
            "qbo"
        ],
        compressible: null
    },
    "application/vnd.intu.qfx": {
        source: "iana",
        extensions: [
            "qfx"
        ],
        compressible: null
    },
    "application/vnd.ipunplugged.rcprofile": {
        source: "iana",
        extensions: [
            "rcprofile"
        ],
        compressible: null
    },
    "application/vnd.irepository.package+xml": {
        source: "iana",
        compressible: true,
        extensions: [
            "irp"
        ]
    },
    "application/vnd.is-xpr": {
        source: "iana",
        extensions: [
            "xpr"
        ],
        compressible: null
    },
    "application/vnd.isac.fcs": {
        source: "iana",
        extensions: [
            "fcs"
        ],
        compressible: null
    },
    "application/vnd.jam": {
        source: "iana",
        extensions: [
            "jam"
        ],
        compressible: null
    },
    "application/vnd.jcp.javame.midlet-rms": {
        source: "iana",
        extensions: [
            "rms"
        ],
        compressible: null
    },
    "application/vnd.jisp": {
        source: "iana",
        extensions: [
            "jisp"
        ],
        compressible: null
    },
    "application/vnd.joost.joda-archive": {
        source: "iana",
        extensions: [
            "joda"
        ],
        compressible: null
    },
    "application/vnd.kahootz": {
        source: "iana",
        extensions: [
            "ktz",
            "ktr"
        ],
        compressible: null
    },
    "application/vnd.kde.karbon": {
        source: "iana",
        extensions: [
            "karbon"
        ],
        compressible: null
    },
    "application/vnd.kde.kchart": {
        source: "iana",
        extensions: [
            "chrt"
        ],
        compressible: null
    },
    "application/vnd.kde.kformula": {
        source: "iana",
        extensions: [
            "kfo"
        ],
        compressible: null
    },
    "application/vnd.kde.kivio": {
        source: "iana",
        extensions: [
            "flw"
        ],
        compressible: null
    },
    "application/vnd.kde.kontour": {
        source: "iana",
        extensions: [
            "kon"
        ],
        compressible: null
    },
    "application/vnd.kde.kpresenter": {
        source: "iana",
        extensions: [
            "kpr",
            "kpt"
        ],
        compressible: null
    },
    "application/vnd.kde.kspread": {
        source: "iana",
        extensions: [
            "ksp"
        ],
        compressible: null
    },
    "application/vnd.kde.kword": {
        source: "iana",
        extensions: [
            "kwd",
            "kwt"
        ],
        compressible: null
    },
    "application/vnd.kenameaapp": {
        source: "iana",
        extensions: [
            "htke"
        ],
        compressible: null
    },
    "application/vnd.kidspiration": {
        source: "iana",
        extensions: [
            "kia"
        ],
        compressible: null
    },
    "application/vnd.kinar": {
        source: "iana",
        extensions: [
            "kne",
            "knp"
        ],
        compressible: null
    },
    "application/vnd.koan": {
        source: "iana",
        extensions: [
            "skp",
            "skd",
            "skt",
            "skm"
        ],
        compressible: null
    },
    "application/vnd.kodak-descriptor": {
        source: "iana",
        extensions: [
            "sse"
        ],
        compressible: null
    },
    "application/vnd.las.las+xml": {
        source: "iana",
        compressible: true,
        extensions: [
            "lasxml"
        ]
    },
    "application/vnd.llamagraphics.life-balance.desktop": {
        source: "iana",
        extensions: [
            "lbd"
        ],
        compressible: null
    },
    "application/vnd.llamagraphics.life-balance.exchange+xml": {
        source: "iana",
        compressible: true,
        extensions: [
            "lbe"
        ]
    },
    "application/vnd.lotus-1-2-3": {
        source: "iana",
        extensions: [
            "123"
        ],
        compressible: null
    },
    "application/vnd.lotus-approach": {
        source: "iana",
        extensions: [
            "apr"
        ],
        compressible: null
    },
    "application/vnd.lotus-freelance": {
        source: "iana",
        extensions: [
            "pre"
        ],
        compressible: null
    },
    "application/vnd.lotus-notes": {
        source: "iana",
        extensions: [
            "nsf"
        ],
        compressible: null
    },
    "application/vnd.lotus-organizer": {
        source: "iana",
        extensions: [
            "org"
        ],
        compressible: null
    },
    "application/vnd.lotus-screencam": {
        source: "iana",
        extensions: [
            "scm"
        ],
        compressible: null
    },
    "application/vnd.lotus-wordpro": {
        source: "iana",
        extensions: [
            "lwp"
        ],
        compressible: null
    },
    "application/vnd.macports.portpkg": {
        source: "iana",
        extensions: [
            "portpkg"
        ],
        compressible: null
    },
    "application/vnd.mapbox-vector-tile": {
        source: "iana",
        extensions: [
            "mvt"
        ],
        compressible: null
    },
    "application/vnd.mcd": {
        source: "iana",
        extensions: [
            "mcd"
        ],
        compressible: null
    },
    "application/vnd.medcalcdata": {
        source: "iana",
        extensions: [
            "mc1"
        ],
        compressible: null
    },
    "application/vnd.mediastation.cdkey": {
        source: "iana",
        extensions: [
            "cdkey"
        ],
        compressible: null
    },
    "application/vnd.mfer": {
        source: "iana",
        extensions: [
            "mwf"
        ],
        compressible: null
    },
    "application/vnd.mfmp": {
        source: "iana",
        extensions: [
            "mfm"
        ],
        compressible: null
    },
    "application/vnd.micrografx.flo": {
        source: "iana",
        extensions: [
            "flo"
        ],
        compressible: null
    },
    "application/vnd.micrografx.igx": {
        source: "iana",
        extensions: [
            "igx"
        ],
        compressible: null
    },
    "application/vnd.mif": {
        source: "iana",
        extensions: [
            "mif"
        ],
        compressible: null
    },
    "application/vnd.mobius.daf": {
        source: "iana",
        extensions: [
            "daf"
        ],
        compressible: null
    },
    "application/vnd.mobius.dis": {
        source: "iana",
        extensions: [
            "dis"
        ],
        compressible: null
    },
    "application/vnd.mobius.mbk": {
        source: "iana",
        extensions: [
            "mbk"
        ],
        compressible: null
    },
    "application/vnd.mobius.mqy": {
        source: "iana",
        extensions: [
            "mqy"
        ],
        compressible: null
    },
    "application/vnd.mobius.msl": {
        source: "iana",
        extensions: [
            "msl"
        ],
        compressible: null
    },
    "application/vnd.mobius.plc": {
        source: "iana",
        extensions: [
            "plc"
        ],
        compressible: null
    },
    "application/vnd.mobius.txf": {
        source: "iana",
        extensions: [
            "txf"
        ],
        compressible: null
    },
    "application/vnd.mophun.application": {
        source: "iana",
        extensions: [
            "mpn"
        ],
        compressible: null
    },
    "application/vnd.mophun.certificate": {
        source: "iana",
        extensions: [
            "mpc"
        ],
        compressible: null
    },
    "application/vnd.mozilla.xul+xml": {
        source: "iana",
        compressible: true,
        extensions: [
            "xul"
        ]
    },
    "application/vnd.ms-artgalry": {
        source: "iana",
        extensions: [
            "cil"
        ],
        compressible: null
    },
    "application/vnd.ms-cab-compressed": {
        source: "iana",
        extensions: [
            "cab"
        ],
        compressible: null
    },
    "application/vnd.ms-excel": {
        source: "iana",
        compressible: false,
        extensions: [
            "xls",
            "xlm",
            "xla",
            "xlc",
            "xlt",
            "xlw"
        ]
    },
    "application/vnd.ms-excel.addin.macroenabled.12": {
        source: "iana",
        extensions: [
            "xlam"
        ],
        compressible: null
    },
    "application/vnd.ms-excel.sheet.binary.macroenabled.12": {
        source: "iana",
        extensions: [
            "xlsb"
        ],
        compressible: null
    },
    "application/vnd.ms-excel.sheet.macroenabled.12": {
        source: "iana",
        extensions: [
            "xlsm"
        ],
        compressible: null
    },
    "application/vnd.ms-excel.template.macroenabled.12": {
        source: "iana",
        extensions: [
            "xltm"
        ],
        compressible: null
    },
    "application/vnd.ms-fontobject": {
        source: "iana",
        compressible: true,
        extensions: [
            "eot"
        ]
    },
    "application/vnd.ms-htmlhelp": {
        source: "iana",
        extensions: [
            "chm"
        ],
        compressible: null
    },
    "application/vnd.ms-ims": {
        source: "iana",
        extensions: [
            "ims"
        ],
        compressible: null
    },
    "application/vnd.ms-lrm": {
        source: "iana",
        extensions: [
            "lrm"
        ],
        compressible: null
    },
    "application/vnd.ms-officetheme": {
        source: "iana",
        extensions: [
            "thmx"
        ],
        compressible: null
    },
    "application/vnd.ms-pki.seccat": {
        source: "apache",
        extensions: [
            "cat"
        ],
        compressible: null
    },
    "application/vnd.ms-pki.stl": {
        source: "apache",
        extensions: [
            "stl"
        ],
        compressible: null
    },
    "application/vnd.ms-powerpoint": {
        source: "iana",
        compressible: false,
        extensions: [
            "ppt",
            "pps",
            "pot"
        ]
    },
    "application/vnd.ms-powerpoint.addin.macroenabled.12": {
        source: "iana",
        extensions: [
            "ppam"
        ],
        compressible: null
    },
    "application/vnd.ms-powerpoint.presentation.macroenabled.12": {
        source: "iana",
        extensions: [
            "pptm"
        ],
        compressible: null
    },
    "application/vnd.ms-powerpoint.slide.macroenabled.12": {
        source: "iana",
        extensions: [
            "sldm"
        ],
        compressible: null
    },
    "application/vnd.ms-powerpoint.slideshow.macroenabled.12": {
        source: "iana",
        extensions: [
            "ppsm"
        ],
        compressible: null
    },
    "application/vnd.ms-powerpoint.template.macroenabled.12": {
        source: "iana",
        extensions: [
            "potm"
        ],
        compressible: null
    },
    "application/vnd.ms-project": {
        source: "iana",
        extensions: [
            "mpp",
            "mpt"
        ],
        compressible: null
    },
    "application/vnd.ms-word.document.macroenabled.12": {
        source: "iana",
        extensions: [
            "docm"
        ],
        compressible: null
    },
    "application/vnd.ms-word.template.macroenabled.12": {
        source: "iana",
        extensions: [
            "dotm"
        ],
        compressible: null
    },
    "application/vnd.ms-works": {
        source: "iana",
        extensions: [
            "wps",
            "wks",
            "wcm",
            "wdb"
        ],
        compressible: null
    },
    "application/vnd.ms-wpl": {
        source: "iana",
        extensions: [
            "wpl"
        ],
        compressible: null
    },
    "application/vnd.ms-xpsdocument": {
        source: "iana",
        compressible: false,
        extensions: [
            "xps"
        ]
    },
    "application/vnd.mseq": {
        source: "iana",
        extensions: [
            "mseq"
        ],
        compressible: null
    },
    "application/vnd.musician": {
        source: "iana",
        extensions: [
            "mus"
        ],
        compressible: null
    },
    "application/vnd.muvee.style": {
        source: "iana",
        extensions: [
            "msty"
        ],
        compressible: null
    },
    "application/vnd.mynfc": {
        source: "iana",
        extensions: [
            "taglet"
        ],
        compressible: null
    },
    "application/vnd.neurolanguage.nlu": {
        source: "iana",
        extensions: [
            "nlu"
        ],
        compressible: null
    },
    "application/vnd.nitf": {
        source: "iana",
        extensions: [
            "ntf",
            "nitf"
        ],
        compressible: null
    },
    "application/vnd.noblenet-directory": {
        source: "iana",
        extensions: [
            "nnd"
        ],
        compressible: null
    },
    "application/vnd.noblenet-sealer": {
        source: "iana",
        extensions: [
            "nns"
        ],
        compressible: null
    },
    "application/vnd.noblenet-web": {
        source: "iana",
        extensions: [
            "nnw"
        ],
        compressible: null
    },
    "application/vnd.nokia.n-gage.ac+xml": {
        source: "iana",
        compressible: true,
        extensions: [
            "ac"
        ]
    },
    "application/vnd.nokia.n-gage.data": {
        source: "iana",
        extensions: [
            "ngdat"
        ],
        compressible: null
    },
    "application/vnd.nokia.n-gage.symbian.install": {
        source: "iana",
        extensions: [
            "n-gage"
        ],
        compressible: null
    },
    "application/vnd.nokia.radio-preset": {
        source: "iana",
        extensions: [
            "rpst"
        ],
        compressible: null
    },
    "application/vnd.nokia.radio-presets": {
        source: "iana",
        extensions: [
            "rpss"
        ],
        compressible: null
    },
    "application/vnd.novadigm.edm": {
        source: "iana",
        extensions: [
            "edm"
        ],
        compressible: null
    },
    "application/vnd.novadigm.edx": {
        source: "iana",
        extensions: [
            "edx"
        ],
        compressible: null
    },
    "application/vnd.novadigm.ext": {
        source: "iana",
        extensions: [
            "ext"
        ],
        compressible: null
    },
    "application/vnd.oasis.opendocument.chart": {
        source: "iana",
        extensions: [
            "odc"
        ],
        compressible: null
    },
    "application/vnd.oasis.opendocument.chart-template": {
        source: "iana",
        extensions: [
            "otc"
        ],
        compressible: null
    },
    "application/vnd.oasis.opendocument.database": {
        source: "iana",
        extensions: [
            "odb"
        ],
        compressible: null
    },
    "application/vnd.oasis.opendocument.formula": {
        source: "iana",
        extensions: [
            "odf"
        ],
        compressible: null
    },
    "application/vnd.oasis.opendocument.formula-template": {
        source: "iana",
        extensions: [
            "odft"
        ],
        compressible: null
    },
    "application/vnd.oasis.opendocument.graphics": {
        source: "iana",
        compressible: false,
        extensions: [
            "odg"
        ]
    },
    "application/vnd.oasis.opendocument.graphics-template": {
        source: "iana",
        extensions: [
            "otg"
        ],
        compressible: null
    },
    "application/vnd.oasis.opendocument.image": {
        source: "iana",
        extensions: [
            "odi"
        ],
        compressible: null
    },
    "application/vnd.oasis.opendocument.image-template": {
        source: "iana",
        extensions: [
            "oti"
        ],
        compressible: null
    },
    "application/vnd.oasis.opendocument.presentation": {
        source: "iana",
        compressible: false,
        extensions: [
            "odp"
        ]
    },
    "application/vnd.oasis.opendocument.presentation-template": {
        source: "iana",
        extensions: [
            "otp"
        ],
        compressible: null
    },
    "application/vnd.oasis.opendocument.spreadsheet": {
        source: "iana",
        compressible: false,
        extensions: [
            "ods"
        ]
    },
    "application/vnd.oasis.opendocument.spreadsheet-template": {
        source: "iana",
        extensions: [
            "ots"
        ],
        compressible: null
    },
    "application/vnd.oasis.opendocument.text": {
        source: "iana",
        compressible: false,
        extensions: [
            "odt"
        ]
    },
    "application/vnd.oasis.opendocument.text-master": {
        source: "iana",
        extensions: [
            "odm"
        ],
        compressible: null
    },
    "application/vnd.oasis.opendocument.text-template": {
        source: "iana",
        extensions: [
            "ott"
        ],
        compressible: null
    },
    "application/vnd.oasis.opendocument.text-web": {
        source: "iana",
        extensions: [
            "oth"
        ],
        compressible: null
    },
    "application/vnd.olpc-sugar": {
        source: "iana",
        extensions: [
            "xo"
        ],
        compressible: null
    },
    "application/vnd.oma.dd2+xml": {
        source: "iana",
        compressible: true,
        extensions: [
            "dd2"
        ]
    },
    "application/vnd.openblox.game+xml": {
        source: "iana",
        compressible: true,
        extensions: [
            "obgx"
        ]
    },
    "application/vnd.openofficeorg.extension": {
        source: "apache",
        extensions: [
            "oxt"
        ],
        compressible: null
    },
    "application/vnd.openstreetmap.data+xml": {
        source: "iana",
        compressible: true,
        extensions: [
            "osm"
        ]
    },
    "application/vnd.openxmlformats-officedocument.presentationml.presentation": {
        source: "iana",
        compressible: false,
        extensions: [
            "pptx"
        ]
    },
    "application/vnd.openxmlformats-officedocument.presentationml.slide": {
        source: "iana",
        extensions: [
            "sldx"
        ],
        compressible: null
    },
    "application/vnd.openxmlformats-officedocument.presentationml.slideshow": {
        source: "iana",
        extensions: [
            "ppsx"
        ],
        compressible: null
    },
    "application/vnd.openxmlformats-officedocument.presentationml.template": {
        source: "iana",
        extensions: [
            "potx"
        ],
        compressible: null
    },
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": {
        source: "iana",
        compressible: false,
        extensions: [
            "xlsx"
        ]
    },
    "application/vnd.openxmlformats-officedocument.spreadsheetml.template": {
        source: "iana",
        extensions: [
            "xltx"
        ],
        compressible: null
    },
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": {
        source: "iana",
        compressible: false,
        extensions: [
            "docx"
        ]
    },
    "application/vnd.openxmlformats-officedocument.wordprocessingml.template": {
        source: "iana",
        extensions: [
            "dotx"
        ],
        compressible: null
    },
    "application/vnd.osgeo.mapguide.package": {
        source: "iana",
        extensions: [
            "mgp"
        ],
        compressible: null
    },
    "application/vnd.osgi.dp": {
        source: "iana",
        extensions: [
            "dp"
        ],
        compressible: null
    },
    "application/vnd.osgi.subsystem": {
        source: "iana",
        extensions: [
            "esa"
        ],
        compressible: null
    },
    "application/vnd.palm": {
        source: "iana",
        extensions: [
            "pdb",
            "pqa",
            "oprc"
        ],
        compressible: null
    },
    "application/vnd.pawaafile": {
        source: "iana",
        extensions: [
            "paw"
        ],
        compressible: null
    },
    "application/vnd.pg.format": {
        source: "iana",
        extensions: [
            "str"
        ],
        compressible: null
    },
    "application/vnd.pg.osasli": {
        source: "iana",
        extensions: [
            "ei6"
        ],
        compressible: null
    },
    "application/vnd.picsel": {
        source: "iana",
        extensions: [
            "efif"
        ],
        compressible: null
    },
    "application/vnd.pmi.widget": {
        source: "iana",
        extensions: [
            "wg"
        ],
        compressible: null
    },
    "application/vnd.pocketlearn": {
        source: "iana",
        extensions: [
            "plf"
        ],
        compressible: null
    },
    "application/vnd.powerbuilder6": {
        source: "iana",
        extensions: [
            "pbd"
        ],
        compressible: null
    },
    "application/vnd.previewsystems.box": {
        source: "iana",
        extensions: [
            "box"
        ],
        compressible: null
    },
    "application/vnd.proteus.magazine": {
        source: "iana",
        extensions: [
            "mgz"
        ],
        compressible: null
    },
    "application/vnd.publishare-delta-tree": {
        source: "iana",
        extensions: [
            "qps"
        ],
        compressible: null
    },
    "application/vnd.pvi.ptid1": {
        source: "iana",
        extensions: [
            "ptid"
        ],
        compressible: null
    },
    "application/vnd.quark.quarkxpress": {
        source: "iana",
        extensions: [
            "qxd",
            "qxt",
            "qwd",
            "qwt",
            "qxl",
            "qxb"
        ],
        compressible: null
    },
    "application/vnd.rar": {
        source: "iana",
        extensions: [
            "rar"
        ],
        compressible: null
    },
    "application/vnd.realvnc.bed": {
        source: "iana",
        extensions: [
            "bed"
        ],
        compressible: null
    },
    "application/vnd.recordare.musicxml": {
        source: "iana",
        extensions: [
            "mxl"
        ],
        compressible: null
    },
    "application/vnd.recordare.musicxml+xml": {
        source: "iana",
        compressible: true,
        extensions: [
            "musicxml"
        ]
    },
    "application/vnd.rig.cryptonote": {
        source: "iana",
        extensions: [
            "cryptonote"
        ],
        compressible: null
    },
    "application/vnd.rim.cod": {
        source: "apache",
        extensions: [
            "cod"
        ],
        compressible: null
    },
    "application/vnd.rn-realmedia": {
        source: "apache",
        extensions: [
            "rm"
        ],
        compressible: null
    },
    "application/vnd.rn-realmedia-vbr": {
        source: "apache",
        extensions: [
            "rmvb"
        ],
        compressible: null
    },
    "application/vnd.route66.link66+xml": {
        source: "iana",
        compressible: true,
        extensions: [
            "link66"
        ]
    },
    "application/vnd.sailingtracker.track": {
        source: "iana",
        extensions: [
            "st"
        ],
        compressible: null
    },
    "application/vnd.seemail": {
        source: "iana",
        extensions: [
            "see"
        ],
        compressible: null
    },
    "application/vnd.sema": {
        source: "iana",
        extensions: [
            "sema"
        ],
        compressible: null
    },
    "application/vnd.semd": {
        source: "iana",
        extensions: [
            "semd"
        ],
        compressible: null
    },
    "application/vnd.semf": {
        source: "iana",
        extensions: [
            "semf"
        ],
        compressible: null
    },
    "application/vnd.shana.informed.formdata": {
        source: "iana",
        extensions: [
            "ifm"
        ],
        compressible: null
    },
    "application/vnd.shana.informed.formtemplate": {
        source: "iana",
        extensions: [
            "itp"
        ],
        compressible: null
    },
    "application/vnd.shana.informed.interchange": {
        source: "iana",
        extensions: [
            "iif"
        ],
        compressible: null
    },
    "application/vnd.shana.informed.package": {
        source: "iana",
        extensions: [
            "ipk"
        ],
        compressible: null
    },
    "application/vnd.simtech-mindmapper": {
        source: "iana",
        extensions: [
            "twd",
            "twds"
        ],
        compressible: null
    },
    "application/vnd.smaf": {
        source: "iana",
        extensions: [
            "mmf"
        ],
        compressible: null
    },
    "application/vnd.smart.teacher": {
        source: "iana",
        extensions: [
            "teacher"
        ],
        compressible: null
    },
    "application/vnd.software602.filler.form+xml": {
        source: "iana",
        compressible: true,
        extensions: [
            "fo"
        ]
    },
    "application/vnd.solent.sdkm+xml": {
        source: "iana",
        compressible: true,
        extensions: [
            "sdkm",
            "sdkd"
        ]
    },
    "application/vnd.spotfire.dxp": {
        source: "iana",
        extensions: [
            "dxp"
        ],
        compressible: null
    },
    "application/vnd.spotfire.sfs": {
        source: "iana",
        extensions: [
            "sfs"
        ],
        compressible: null
    },
    "application/vnd.stardivision.calc": {
        source: "apache",
        extensions: [
            "sdc"
        ],
        compressible: null
    },
    "application/vnd.stardivision.draw": {
        source: "apache",
        extensions: [
            "sda"
        ],
        compressible: null
    },
    "application/vnd.stardivision.impress": {
        source: "apache",
        extensions: [
            "sdd"
        ],
        compressible: null
    },
    "application/vnd.stardivision.math": {
        source: "apache",
        extensions: [
            "smf"
        ],
        compressible: null
    },
    "application/vnd.stardivision.writer": {
        source: "apache",
        extensions: [
            "sdw",
            "vor"
        ],
        compressible: null
    },
    "application/vnd.stardivision.writer-global": {
        source: "apache",
        extensions: [
            "sgl"
        ],
        compressible: null
    },
    "application/vnd.stepmania.package": {
        source: "iana",
        extensions: [
            "smzip"
        ],
        compressible: null
    },
    "application/vnd.stepmania.stepchart": {
        source: "iana",
        extensions: [
            "sm"
        ],
        compressible: null
    },
    "application/vnd.sun.wadl+xml": {
        source: "iana",
        compressible: true,
        extensions: [
            "wadl"
        ]
    },
    "application/vnd.sun.xml.calc": {
        source: "apache",
        extensions: [
            "sxc"
        ],
        compressible: null
    },
    "application/vnd.sun.xml.calc.template": {
        source: "apache",
        extensions: [
            "stc"
        ],
        compressible: null
    },
    "application/vnd.sun.xml.draw": {
        source: "apache",
        extensions: [
            "sxd"
        ],
        compressible: null
    },
    "application/vnd.sun.xml.draw.template": {
        source: "apache",
        extensions: [
            "std"
        ],
        compressible: null
    },
    "application/vnd.sun.xml.impress": {
        source: "apache",
        extensions: [
            "sxi"
        ],
        compressible: null
    },
    "application/vnd.sun.xml.impress.template": {
        source: "apache",
        extensions: [
            "sti"
        ],
        compressible: null
    },
    "application/vnd.sun.xml.math": {
        source: "apache",
        extensions: [
            "sxm"
        ],
        compressible: null
    },
    "application/vnd.sun.xml.writer": {
        source: "apache",
        extensions: [
            "sxw"
        ],
        compressible: null
    },
    "application/vnd.sun.xml.writer.global": {
        source: "apache",
        extensions: [
            "sxg"
        ],
        compressible: null
    },
    "application/vnd.sun.xml.writer.template": {
        source: "apache",
        extensions: [
            "stw"
        ],
        compressible: null
    },
    "application/vnd.sus-calendar": {
        source: "iana",
        extensions: [
            "sus",
            "susp"
        ],
        compressible: null
    },
    "application/vnd.svd": {
        source: "iana",
        extensions: [
            "svd"
        ],
        compressible: null
    },
    "application/vnd.symbian.install": {
        source: "apache",
        extensions: [
            "sis",
            "sisx"
        ],
        compressible: null
    },
    "application/vnd.syncml+xml": {
        source: "iana",
        charset: "UTF-8",
        compressible: true,
        extensions: [
            "xsm"
        ]
    },
    "application/vnd.syncml.dm+wbxml": {
        source: "iana",
        charset: "UTF-8",
        extensions: [
            "bdm"
        ],
        compressible: null
    },
    "application/vnd.syncml.dm+xml": {
        source: "iana",
        charset: "UTF-8",
        compressible: true,
        extensions: [
            "xdm"
        ]
    },
    "application/vnd.syncml.dmddf+xml": {
        source: "iana",
        charset: "UTF-8",
        compressible: true,
        extensions: [
            "ddf"
        ]
    },
    "application/vnd.tao.intent-module-archive": {
        source: "iana",
        extensions: [
            "tao"
        ],
        compressible: null
    },
    "application/vnd.tcpdump.pcap": {
        source: "iana",
        extensions: [
            "pcap",
            "cap",
            "dmp"
        ],
        compressible: null
    },
    "application/vnd.tmobile-livetv": {
        source: "iana",
        extensions: [
            "tmo"
        ],
        compressible: null
    },
    "application/vnd.trid.tpt": {
        source: "iana",
        extensions: [
            "tpt"
        ],
        compressible: null
    },
    "application/vnd.triscape.mxs": {
        source: "iana",
        extensions: [
            "mxs"
        ],
        compressible: null
    },
    "application/vnd.trueapp": {
        source: "iana",
        extensions: [
            "tra"
        ],
        compressible: null
    },
    "application/vnd.ufdl": {
        source: "iana",
        extensions: [
            "ufd",
            "ufdl"
        ],
        compressible: null
    },
    "application/vnd.uiq.theme": {
        source: "iana",
        extensions: [
            "utz"
        ],
        compressible: null
    },
    "application/vnd.umajin": {
        source: "iana",
        extensions: [
            "umj"
        ],
        compressible: null
    },
    "application/vnd.unity": {
        source: "iana",
        extensions: [
            "unityweb"
        ],
        compressible: null
    },
    "application/vnd.uoml+xml": {
        source: "iana",
        compressible: true,
        extensions: [
            "uoml"
        ]
    },
    "application/vnd.vcx": {
        source: "iana",
        extensions: [
            "vcx"
        ],
        compressible: null
    },
    "application/vnd.visio": {
        source: "iana",
        extensions: [
            "vsd",
            "vst",
            "vss",
            "vsw"
        ],
        compressible: null
    },
    "application/vnd.visionary": {
        source: "iana",
        extensions: [
            "vis"
        ],
        compressible: null
    },
    "application/vnd.vsf": {
        source: "iana",
        extensions: [
            "vsf"
        ],
        compressible: null
    },
    "application/vnd.wap.wbxml": {
        source: "iana",
        charset: "UTF-8",
        extensions: [
            "wbxml"
        ],
        compressible: null
    },
    "application/vnd.wap.wmlc": {
        source: "iana",
        extensions: [
            "wmlc"
        ],
        compressible: null
    },
    "application/vnd.wap.wmlscriptc": {
        source: "iana",
        extensions: [
            "wmlsc"
        ],
        compressible: null
    },
    "application/vnd.webturbo": {
        source: "iana",
        extensions: [
            "wtb"
        ],
        compressible: null
    },
    "application/vnd.wolfram.player": {
        source: "iana",
        extensions: [
            "nbp"
        ],
        compressible: null
    },
    "application/vnd.wordperfect": {
        source: "iana",
        extensions: [
            "wpd"
        ],
        compressible: null
    },
    "application/vnd.wqd": {
        source: "iana",
        extensions: [
            "wqd"
        ],
        compressible: null
    },
    "application/vnd.wt.stf": {
        source: "iana",
        extensions: [
            "stf"
        ],
        compressible: null
    },
    "application/vnd.xara": {
        source: "iana",
        extensions: [
            "xar"
        ],
        compressible: null
    },
    "application/vnd.xfdl": {
        source: "iana",
        extensions: [
            "xfdl"
        ],
        compressible: null
    },
    "application/vnd.yamaha.hv-dic": {
        source: "iana",
        extensions: [
            "hvd"
        ],
        compressible: null
    },
    "application/vnd.yamaha.hv-script": {
        source: "iana",
        extensions: [
            "hvs"
        ],
        compressible: null
    },
    "application/vnd.yamaha.hv-voice": {
        source: "iana",
        extensions: [
            "hvp"
        ],
        compressible: null
    },
    "application/vnd.yamaha.openscoreformat": {
        source: "iana",
        extensions: [
            "osf"
        ],
        compressible: null
    },
    "application/vnd.yamaha.openscoreformat.osfpvg+xml": {
        source: "iana",
        compressible: true,
        extensions: [
            "osfpvg"
        ]
    },
    "application/vnd.yamaha.smaf-audio": {
        source: "iana",
        extensions: [
            "saf"
        ],
        compressible: null
    },
    "application/vnd.yamaha.smaf-phrase": {
        source: "iana",
        extensions: [
            "spf"
        ],
        compressible: null
    },
    "application/vnd.yellowriver-custom-menu": {
        source: "iana",
        extensions: [
            "cmp"
        ],
        compressible: null
    },
    "application/vnd.zul": {
        source: "iana",
        extensions: [
            "zir",
            "zirz"
        ],
        compressible: null
    },
    "application/vnd.zzazz.deck+xml": {
        source: "iana",
        compressible: true,
        extensions: [
            "zaz"
        ]
    },
    "application/voicexml+xml": {
        source: "iana",
        compressible: true,
        extensions: [
            "vxml"
        ]
    },
    "application/wasm": {
        source: "iana",
        compressible: true,
        extensions: [
            "wasm"
        ]
    },
    "application/watcherinfo+xml": {
        source: "iana",
        compressible: true,
        extensions: [
            "wif"
        ]
    },
    "application/widget": {
        source: "iana",
        extensions: [
            "wgt"
        ],
        compressible: null
    },
    "application/winhlp": {
        source: "apache",
        extensions: [
            "hlp"
        ],
        compressible: null
    },
    "application/wsdl+xml": {
        source: "iana",
        compressible: true,
        extensions: [
            "wsdl"
        ]
    },
    "application/wspolicy+xml": {
        source: "iana",
        compressible: true,
        extensions: [
            "wspolicy"
        ]
    },
    "application/x-7z-compressed": {
        source: "apache",
        compressible: false,
        extensions: [
            "7z"
        ]
    },
    "application/x-abiword": {
        source: "apache",
        extensions: [
            "abw"
        ],
        compressible: null
    },
    "application/x-ace-compressed": {
        source: "apache",
        extensions: [
            "ace"
        ],
        compressible: null
    },
    "application/x-apple-diskimage": {
        source: "apache",
        extensions: [
            "dmg"
        ],
        compressible: null
    },
    "application/x-authorware-bin": {
        source: "apache",
        extensions: [
            "aab",
            "x32",
            "u32",
            "vox"
        ],
        compressible: null
    },
    "application/x-authorware-map": {
        source: "apache",
        extensions: [
            "aam"
        ],
        compressible: null
    },
    "application/x-authorware-seg": {
        source: "apache",
        extensions: [
            "aas"
        ],
        compressible: null
    },
    "application/x-bcpio": {
        source: "apache",
        extensions: [
            "bcpio"
        ],
        compressible: null
    },
    "application/x-bittorrent": {
        source: "apache",
        extensions: [
            "torrent"
        ],
        compressible: null
    },
    "application/x-blorb": {
        source: "apache",
        extensions: [
            "blb",
            "blorb"
        ],
        compressible: null
    },
    "application/x-bzip": {
        source: "apache",
        compressible: false,
        extensions: [
            "bz"
        ]
    },
    "application/x-bzip2": {
        source: "apache",
        compressible: false,
        extensions: [
            "bz2",
            "boz"
        ]
    },
    "application/x-cbr": {
        source: "apache",
        extensions: [
            "cbr",
            "cba",
            "cbt",
            "cbz",
            "cb7"
        ],
        compressible: null
    },
    "application/x-cdlink": {
        source: "apache",
        extensions: [
            "vcd"
        ],
        compressible: null
    },
    "application/x-cfs-compressed": {
        source: "apache",
        extensions: [
            "cfs"
        ],
        compressible: null
    },
    "application/x-chat": {
        source: "apache",
        extensions: [
            "chat"
        ],
        compressible: null
    },
    "application/x-chess-pgn": {
        source: "apache",
        extensions: [
            "pgn"
        ],
        compressible: null
    },
    "application/x-cocoa": {
        source: "nginx",
        extensions: [
            "cco"
        ],
        compressible: null
    },
    "application/x-conference": {
        source: "apache",
        extensions: [
            "nsc"
        ],
        compressible: null
    },
    "application/x-cpio": {
        source: "apache",
        extensions: [
            "cpio"
        ],
        compressible: null
    },
    "application/x-csh": {
        source: "apache",
        extensions: [
            "csh"
        ],
        compressible: null
    },
    "application/x-debian-package": {
        source: "apache",
        extensions: [
            "deb",
            "udeb"
        ],
        compressible: null
    },
    "application/x-dgc-compressed": {
        source: "apache",
        extensions: [
            "dgc"
        ],
        compressible: null
    },
    "application/x-director": {
        source: "apache",
        extensions: [
            "dir",
            "dcr",
            "dxr",
            "cst",
            "cct",
            "cxt",
            "w3d",
            "fgd",
            "swa"
        ],
        compressible: null
    },
    "application/x-doom": {
        source: "apache",
        extensions: [
            "wad"
        ],
        compressible: null
    },
    "application/x-dtbncx+xml": {
        source: "apache",
        compressible: true,
        extensions: [
            "ncx"
        ]
    },
    "application/x-dtbook+xml": {
        source: "apache",
        compressible: true,
        extensions: [
            "dtb"
        ]
    },
    "application/x-dtbresource+xml": {
        source: "apache",
        compressible: true,
        extensions: [
            "res"
        ]
    },
    "application/x-dvi": {
        source: "apache",
        compressible: false,
        extensions: [
            "dvi"
        ]
    },
    "application/x-envoy": {
        source: "apache",
        extensions: [
            "evy"
        ],
        compressible: null
    },
    "application/x-eva": {
        source: "apache",
        extensions: [
            "eva"
        ],
        compressible: null
    },
    "application/x-font-bdf": {
        source: "apache",
        extensions: [
            "bdf"
        ],
        compressible: null
    },
    "application/x-font-ghostscript": {
        source: "apache",
        extensions: [
            "gsf"
        ],
        compressible: null
    },
    "application/x-font-linux-psf": {
        source: "apache",
        extensions: [
            "psf"
        ],
        compressible: null
    },
    "application/x-font-pcf": {
        source: "apache",
        extensions: [
            "pcf"
        ],
        compressible: null
    },
    "application/x-font-snf": {
        source: "apache",
        extensions: [
            "snf"
        ],
        compressible: null
    },
    "application/x-font-type1": {
        source: "apache",
        extensions: [
            "pfa",
            "pfb",
            "pfm",
            "afm"
        ],
        compressible: null
    },
    "application/x-freearc": {
        source: "apache",
        extensions: [
            "arc"
        ],
        compressible: null
    },
    "application/x-futuresplash": {
        source: "apache",
        extensions: [
            "spl"
        ],
        compressible: null
    },
    "application/x-gca-compressed": {
        source: "apache",
        extensions: [
            "gca"
        ],
        compressible: null
    },
    "application/x-glulx": {
        source: "apache",
        extensions: [
            "ulx"
        ],
        compressible: null
    },
    "application/x-gnumeric": {
        source: "apache",
        extensions: [
            "gnumeric"
        ],
        compressible: null
    },
    "application/x-gramps-xml": {
        source: "apache",
        extensions: [
            "gramps"
        ],
        compressible: null
    },
    "application/x-gtar": {
        source: "apache",
        extensions: [
            "gtar"
        ],
        compressible: null
    },
    "application/x-hdf": {
        source: "apache",
        extensions: [
            "hdf"
        ],
        compressible: null
    },
    "application/x-install-instructions": {
        source: "apache",
        extensions: [
            "install"
        ],
        compressible: null
    },
    "application/x-iso9660-image": {
        source: "apache",
        extensions: [
            "iso"
        ],
        compressible: null
    },
    "application/x-java-archive-diff": {
        source: "nginx",
        extensions: [
            "jardiff"
        ],
        compressible: null
    },
    "application/x-java-jnlp-file": {
        source: "apache",
        compressible: false,
        extensions: [
            "jnlp"
        ]
    },
    "application/x-latex": {
        source: "apache",
        compressible: false,
        extensions: [
            "latex"
        ]
    },
    "application/x-lzh-compressed": {
        source: "apache",
        extensions: [
            "lzh",
            "lha"
        ],
        compressible: null
    },
    "application/x-makeself": {
        source: "nginx",
        extensions: [
            "run"
        ],
        compressible: null
    },
    "application/x-mie": {
        source: "apache",
        extensions: [
            "mie"
        ],
        compressible: null
    },
    "application/x-mobipocket-ebook": {
        source: "apache",
        extensions: [
            "prc",
            "mobi"
        ],
        compressible: null
    },
    "application/x-ms-application": {
        source: "apache",
        extensions: [
            "application"
        ],
        compressible: null
    },
    "application/x-ms-shortcut": {
        source: "apache",
        extensions: [
            "lnk"
        ],
        compressible: null
    },
    "application/x-ms-wmd": {
        source: "apache",
        extensions: [
            "wmd"
        ],
        compressible: null
    },
    "application/x-ms-wmz": {
        source: "apache",
        extensions: [
            "wmz"
        ],
        compressible: null
    },
    "application/x-ms-xbap": {
        source: "apache",
        extensions: [
            "xbap"
        ],
        compressible: null
    },
    "application/x-msaccess": {
        source: "apache",
        extensions: [
            "mdb"
        ],
        compressible: null
    },
    "application/x-msbinder": {
        source: "apache",
        extensions: [
            "obd"
        ],
        compressible: null
    },
    "application/x-mscardfile": {
        source: "apache",
        extensions: [
            "crd"
        ],
        compressible: null
    },
    "application/x-msclip": {
        source: "apache",
        extensions: [
            "clp"
        ],
        compressible: null
    },
    "application/x-msdownload": {
        source: "apache",
        extensions: [
            "exe",
            "dll",
            "com",
            "bat",
            "msi"
        ],
        compressible: null
    },
    "application/x-msmediaview": {
        source: "apache",
        extensions: [
            "mvb",
            "m13",
            "m14"
        ],
        compressible: null
    },
    "application/x-msmetafile": {
        source: "apache",
        extensions: [
            "wmf",
            "wmz",
            "emf",
            "emz"
        ],
        compressible: null
    },
    "application/x-msmoney": {
        source: "apache",
        extensions: [
            "mny"
        ],
        compressible: null
    },
    "application/x-mspublisher": {
        source: "apache",
        extensions: [
            "pub"
        ],
        compressible: null
    },
    "application/x-msschedule": {
        source: "apache",
        extensions: [
            "scd"
        ],
        compressible: null
    },
    "application/x-msterminal": {
        source: "apache",
        extensions: [
            "trm"
        ],
        compressible: null
    },
    "application/x-mswrite": {
        source: "apache",
        extensions: [
            "wri"
        ],
        compressible: null
    },
    "application/x-netcdf": {
        source: "apache",
        extensions: [
            "nc",
            "cdf"
        ],
        compressible: null
    },
    "application/x-nzb": {
        source: "apache",
        extensions: [
            "nzb"
        ],
        compressible: null
    },
    "application/x-perl": {
        source: "nginx",
        extensions: [
            "pl",
            "pm"
        ],
        compressible: null
    },
    "application/x-pilot": {
        source: "nginx",
        extensions: [
            "prc",
            "pdb"
        ],
        compressible: null
    },
    "application/x-pkcs12": {
        source: "apache",
        compressible: false,
        extensions: [
            "p12",
            "pfx"
        ]
    },
    "application/x-pkcs7-certificates": {
        source: "apache",
        extensions: [
            "p7b",
            "spc"
        ],
        compressible: null
    },
    "application/x-pkcs7-certreqresp": {
        source: "apache",
        extensions: [
            "p7r"
        ],
        compressible: null
    },
    "application/x-rar-compressed": {
        source: "apache",
        compressible: false,
        extensions: [
            "rar"
        ]
    },
    "application/x-redhat-package-manager": {
        source: "nginx",
        extensions: [
            "rpm"
        ],
        compressible: null
    },
    "application/x-research-info-systems": {
        source: "apache",
        extensions: [
            "ris"
        ],
        compressible: null
    },
    "application/x-sea": {
        source: "nginx",
        extensions: [
            "sea"
        ],
        compressible: null
    },
    "application/x-sh": {
        source: "apache",
        compressible: true,
        extensions: [
            "sh"
        ]
    },
    "application/x-shar": {
        source: "apache",
        extensions: [
            "shar"
        ],
        compressible: null
    },
    "application/x-shockwave-flash": {
        source: "apache",
        compressible: false,
        extensions: [
            "swf"
        ]
    },
    "application/x-silverlight-app": {
        source: "apache",
        extensions: [
            "xap"
        ],
        compressible: null
    },
    "application/x-sql": {
        source: "apache",
        extensions: [
            "sql"
        ],
        compressible: null
    },
    "application/x-stuffit": {
        source: "apache",
        compressible: false,
        extensions: [
            "sit"
        ]
    },
    "application/x-stuffitx": {
        source: "apache",
        extensions: [
            "sitx"
        ],
        compressible: null
    },
    "application/x-subrip": {
        source: "apache",
        extensions: [
            "srt"
        ],
        compressible: null
    },
    "application/x-sv4cpio": {
        source: "apache",
        extensions: [
            "sv4cpio"
        ],
        compressible: null
    },
    "application/x-sv4crc": {
        source: "apache",
        extensions: [
            "sv4crc"
        ],
        compressible: null
    },
    "application/x-t3vm-image": {
        source: "apache",
        extensions: [
            "t3"
        ],
        compressible: null
    },
    "application/x-tads": {
        source: "apache",
        extensions: [
            "gam"
        ],
        compressible: null
    },
    "application/x-tar": {
        source: "apache",
        compressible: true,
        extensions: [
            "tar"
        ]
    },
    "application/x-tcl": {
        source: "apache",
        extensions: [
            "tcl",
            "tk"
        ],
        compressible: null
    },
    "application/x-tex": {
        source: "apache",
        extensions: [
            "tex"
        ],
        compressible: null
    },
    "application/x-tex-tfm": {
        source: "apache",
        extensions: [
            "tfm"
        ],
        compressible: null
    },
    "application/x-texinfo": {
        source: "apache",
        extensions: [
            "texinfo",
            "texi"
        ],
        compressible: null
    },
    "application/x-tgif": {
        source: "apache",
        extensions: [
            "obj"
        ],
        compressible: null
    },
    "application/x-ustar": {
        source: "apache",
        extensions: [
            "ustar"
        ],
        compressible: null
    },
    "application/x-wais-source": {
        source: "apache",
        extensions: [
            "src"
        ],
        compressible: null
    },
    "application/x-x509-ca-cert": {
        source: "iana",
        extensions: [
            "der",
            "crt",
            "pem"
        ],
        compressible: null
    },
    "application/x-xfig": {
        source: "apache",
        extensions: [
            "fig"
        ],
        compressible: null
    },
    "application/x-xliff+xml": {
        source: "apache",
        compressible: true,
        extensions: [
            "xlf"
        ]
    },
    "application/x-xpinstall": {
        source: "apache",
        compressible: false,
        extensions: [
            "xpi"
        ]
    },
    "application/x-xz": {
        source: "apache",
        extensions: [
            "xz"
        ],
        compressible: null
    },
    "application/x-zmachine": {
        source: "apache",
        extensions: [
            "z1",
            "z2",
            "z3",
            "z4",
            "z5",
            "z6",
            "z7",
            "z8"
        ],
        compressible: null
    },
    "application/xaml+xml": {
        source: "apache",
        compressible: true,
        extensions: [
            "xaml"
        ]
    },
    "application/xcap-att+xml": {
        source: "iana",
        compressible: true,
        extensions: [
            "xav"
        ]
    },
    "application/xcap-caps+xml": {
        source: "iana",
        compressible: true,
        extensions: [
            "xca"
        ]
    },
    "application/xcap-diff+xml": {
        source: "iana",
        compressible: true,
        extensions: [
            "xdf"
        ]
    },
    "application/xcap-el+xml": {
        source: "iana",
        compressible: true,
        extensions: [
            "xel"
        ]
    },
    "application/xcap-ns+xml": {
        source: "iana",
        compressible: true,
        extensions: [
            "xns"
        ]
    },
    "application/xenc+xml": {
        source: "iana",
        compressible: true,
        extensions: [
            "xenc"
        ]
    },
    "application/xhtml+xml": {
        source: "iana",
        compressible: true,
        extensions: [
            "xhtml",
            "xht"
        ]
    },
    "application/xliff+xml": {
        source: "iana",
        compressible: true,
        extensions: [
            "xlf"
        ]
    },
    "application/xml": {
        source: "iana",
        compressible: true,
        extensions: [
            "xml",
            "xsl",
            "xsd",
            "rng"
        ]
    },
    "application/xml-dtd": {
        source: "iana",
        compressible: true,
        extensions: [
            "dtd"
        ]
    },
    "application/xop+xml": {
        source: "iana",
        compressible: true,
        extensions: [
            "xop"
        ]
    },
    "application/xproc+xml": {
        source: "apache",
        compressible: true,
        extensions: [
            "xpl"
        ]
    },
    "application/xslt+xml": {
        source: "iana",
        compressible: true,
        extensions: [
            "xsl",
            "xslt"
        ]
    },
    "application/xspf+xml": {
        source: "apache",
        compressible: true,
        extensions: [
            "xspf"
        ]
    },
    "application/xv+xml": {
        source: "iana",
        compressible: true,
        extensions: [
            "mxml",
            "xhvml",
            "xvml",
            "xvm"
        ]
    },
    "application/yang": {
        source: "iana",
        extensions: [
            "yang"
        ],
        compressible: null
    },
    "application/yin+xml": {
        source: "iana",
        compressible: true,
        extensions: [
            "yin"
        ]
    },
    "application/zip": {
        source: "iana",
        compressible: false,
        extensions: [
            "zip"
        ]
    },
    "audio/3gpp": {
        source: "iana",
        compressible: false,
        extensions: [
            "3gpp"
        ]
    },
    "audio/adpcm": {
        source: "apache",
        extensions: [
            "adp"
        ],
        compressible: null
    },
    "audio/amr": {
        source: "iana",
        extensions: [
            "amr"
        ],
        compressible: null
    },
    "audio/basic": {
        source: "iana",
        compressible: false,
        extensions: [
            "au",
            "snd"
        ]
    },
    "audio/midi": {
        source: "apache",
        extensions: [
            "mid",
            "midi",
            "kar",
            "rmi"
        ],
        compressible: null
    },
    "audio/mobile-xmf": {
        source: "iana",
        extensions: [
            "mxmf"
        ],
        compressible: null
    },
    "audio/mp4": {
        source: "iana",
        compressible: false,
        extensions: [
            "m4a",
            "mp4a"
        ]
    },
    "audio/mpeg": {
        source: "iana",
        compressible: false,
        extensions: [
            "mpga",
            "mp2",
            "mp2a",
            "mp3",
            "m2a",
            "m3a"
        ]
    },
    "audio/ogg": {
        source: "iana",
        compressible: false,
        extensions: [
            "oga",
            "ogg",
            "spx",
            "opus"
        ]
    },
    "audio/s3m": {
        source: "apache",
        extensions: [
            "s3m"
        ],
        compressible: null
    },
    "audio/silk": {
        source: "apache",
        extensions: [
            "sil"
        ],
        compressible: null
    },
    "audio/vnd.dece.audio": {
        source: "iana",
        extensions: [
            "uva",
            "uvva"
        ],
        compressible: null
    },
    "audio/vnd.digital-winds": {
        source: "iana",
        extensions: [
            "eol"
        ],
        compressible: null
    },
    "audio/vnd.dra": {
        source: "iana",
        extensions: [
            "dra"
        ],
        compressible: null
    },
    "audio/vnd.dts": {
        source: "iana",
        extensions: [
            "dts"
        ],
        compressible: null
    },
    "audio/vnd.dts.hd": {
        source: "iana",
        extensions: [
            "dtshd"
        ],
        compressible: null
    },
    "audio/vnd.lucent.voice": {
        source: "iana",
        extensions: [
            "lvp"
        ],
        compressible: null
    },
    "audio/vnd.ms-playready.media.pya": {
        source: "iana",
        extensions: [
            "pya"
        ],
        compressible: null
    },
    "audio/vnd.nuera.ecelp4800": {
        source: "iana",
        extensions: [
            "ecelp4800"
        ],
        compressible: null
    },
    "audio/vnd.nuera.ecelp7470": {
        source: "iana",
        extensions: [
            "ecelp7470"
        ],
        compressible: null
    },
    "audio/vnd.nuera.ecelp9600": {
        source: "iana",
        extensions: [
            "ecelp9600"
        ],
        compressible: null
    },
    "audio/vnd.rip": {
        source: "iana",
        extensions: [
            "rip"
        ],
        compressible: null
    },
    "audio/webm": {
        source: "apache",
        compressible: false,
        extensions: [
            "weba"
        ]
    },
    "audio/x-aac": {
        source: "apache",
        compressible: false,
        extensions: [
            "aac"
        ]
    },
    "audio/x-aiff": {
        source: "apache",
        extensions: [
            "aif",
            "aiff",
            "aifc"
        ],
        compressible: null
    },
    "audio/x-caf": {
        source: "apache",
        compressible: false,
        extensions: [
            "caf"
        ]
    },
    "audio/x-flac": {
        source: "apache",
        extensions: [
            "flac"
        ],
        compressible: null
    },
    "audio/x-m4a": {
        source: "nginx",
        extensions: [
            "m4a"
        ],
        compressible: null
    },
    "audio/x-matroska": {
        source: "apache",
        extensions: [
            "mka"
        ],
        compressible: null
    },
    "audio/x-mpegurl": {
        source: "apache",
        extensions: [
            "m3u"
        ],
        compressible: null
    },
    "audio/x-ms-wax": {
        source: "apache",
        extensions: [
            "wax"
        ],
        compressible: null
    },
    "audio/x-ms-wma": {
        source: "apache",
        extensions: [
            "wma"
        ],
        compressible: null
    },
    "audio/x-pn-realaudio": {
        source: "apache",
        extensions: [
            "ram",
            "ra"
        ],
        compressible: null
    },
    "audio/x-pn-realaudio-plugin": {
        source: "apache",
        extensions: [
            "rmp"
        ],
        compressible: null
    },
    "audio/x-realaudio": {
        source: "nginx",
        extensions: [
            "ra"
        ],
        compressible: null
    },
    "audio/x-wav": {
        source: "apache",
        extensions: [
            "wav"
        ],
        compressible: null
    },
    "audio/x-gsm": {
        source: "apache",
        extensions: [
            "gsm"
        ],
        compressible: null
    },
    "audio/xm": {
        source: "apache",
        extensions: [
            "xm"
        ],
        compressible: null
    },
    "chemical/x-cdx": {
        source: "apache",
        extensions: [
            "cdx"
        ],
        compressible: null
    },
    "chemical/x-cif": {
        source: "apache",
        extensions: [
            "cif"
        ],
        compressible: null
    },
    "chemical/x-cmdf": {
        source: "apache",
        extensions: [
            "cmdf"
        ],
        compressible: null
    },
    "chemical/x-cml": {
        source: "apache",
        extensions: [
            "cml"
        ],
        compressible: null
    },
    "chemical/x-csml": {
        source: "apache",
        extensions: [
            "csml"
        ],
        compressible: null
    },
    "chemical/x-xyz": {
        source: "apache",
        extensions: [
            "xyz"
        ],
        compressible: null
    },
    "font/collection": {
        source: "iana",
        extensions: [
            "ttc"
        ],
        compressible: null
    },
    "font/otf": {
        source: "iana",
        compressible: true,
        extensions: [
            "otf"
        ]
    },
    "font/ttf": {
        source: "iana",
        compressible: true,
        extensions: [
            "ttf"
        ]
    },
    "font/woff": {
        source: "iana",
        extensions: [
            "woff"
        ],
        compressible: null
    },
    "font/woff2": {
        source: "iana",
        extensions: [
            "woff2"
        ],
        compressible: null
    },
    "image/aces": {
        source: "iana",
        extensions: [
            "exr"
        ],
        compressible: null
    },
    "image/avci": {
        source: "iana",
        extensions: [
            "avci"
        ],
        compressible: null
    },
    "image/avcs": {
        source: "iana",
        extensions: [
            "avcs"
        ],
        compressible: null
    },
    "image/avif": {
        source: "iana",
        compressible: false,
        extensions: [
            "avif"
        ]
    },
    "image/bmp": {
        source: "iana",
        compressible: true,
        extensions: [
            "bmp"
        ]
    },
    "image/cgm": {
        source: "iana",
        extensions: [
            "cgm"
        ],
        compressible: null
    },
    "image/dicom-rle": {
        source: "iana",
        extensions: [
            "drle"
        ],
        compressible: null
    },
    "image/emf": {
        source: "iana",
        extensions: [
            "emf"
        ],
        compressible: null
    },
    "image/fits": {
        source: "iana",
        extensions: [
            "fits"
        ],
        compressible: null
    },
    "image/g3fax": {
        source: "iana",
        extensions: [
            "g3"
        ],
        compressible: null
    },
    "image/gif": {
        source: "iana",
        compressible: false,
        extensions: [
            "gif"
        ]
    },
    "image/heic": {
        source: "iana",
        extensions: [
            "heic"
        ],
        compressible: null
    },
    "image/heic-sequence": {
        source: "iana",
        extensions: [
            "heics"
        ],
        compressible: null
    },
    "image/heif": {
        source: "iana",
        extensions: [
            "heif"
        ],
        compressible: null
    },
    "image/heif-sequence": {
        source: "iana",
        extensions: [
            "heifs"
        ],
        compressible: null
    },
    "image/hej2k": {
        source: "iana",
        extensions: [
            "hej2"
        ],
        compressible: null
    },
    "image/hsj2": {
        source: "iana",
        extensions: [
            "hsj2"
        ],
        compressible: null
    },
    "image/ief": {
        source: "iana",
        extensions: [
            "ief"
        ],
        compressible: null
    },
    "image/jls": {
        source: "iana",
        extensions: [
            "jls"
        ],
        compressible: null
    },
    "image/jp2": {
        source: "iana",
        compressible: false,
        extensions: [
            "jp2",
            "jpg2"
        ]
    },
    "image/jpeg": {
        source: "iana",
        compressible: false,
        extensions: [
            "jpeg",
            "jpg",
            "jpe"
        ]
    },
    "image/jph": {
        source: "iana",
        extensions: [
            "jph"
        ],
        compressible: null
    },
    "image/jphc": {
        source: "iana",
        extensions: [
            "jhc"
        ],
        compressible: null
    },
    "image/jpm": {
        source: "iana",
        compressible: false,
        extensions: [
            "jpm"
        ]
    },
    "image/jpx": {
        source: "iana",
        compressible: false,
        extensions: [
            "jpx",
            "jpf"
        ]
    },
    "image/jxr": {
        source: "iana",
        extensions: [
            "jxr"
        ],
        compressible: null
    },
    "image/jxra": {
        source: "iana",
        extensions: [
            "jxra"
        ],
        compressible: null
    },
    "image/jxrs": {
        source: "iana",
        extensions: [
            "jxrs"
        ],
        compressible: null
    },
    "image/jxs": {
        source: "iana",
        extensions: [
            "jxs"
        ],
        compressible: null
    },
    "image/jxsc": {
        source: "iana",
        extensions: [
            "jxsc"
        ],
        compressible: null
    },
    "image/jxsi": {
        source: "iana",
        extensions: [
            "jxsi"
        ],
        compressible: null
    },
    "image/jxss": {
        source: "iana",
        extensions: [
            "jxss"
        ],
        compressible: null
    },
    "image/ktx": {
        source: "iana",
        extensions: [
            "ktx"
        ],
        compressible: null
    },
    "image/ktx2": {
        source: "iana",
        extensions: [
            "ktx2"
        ],
        compressible: null
    },
    "image/png": {
        source: "iana",
        compressible: false,
        extensions: [
            "png"
        ]
    },
    "image/prs.btif": {
        source: "iana",
        extensions: [
            "btif"
        ],
        compressible: null
    },
    "image/prs.pti": {
        source: "iana",
        extensions: [
            "pti"
        ],
        compressible: null
    },
    "image/sgi": {
        source: "apache",
        extensions: [
            "sgi"
        ],
        compressible: null
    },
    "image/svg+xml": {
        source: "iana",
        compressible: true,
        extensions: [
            "svg",
            "svgz"
        ]
    },
    "image/t38": {
        source: "iana",
        extensions: [
            "t38"
        ],
        compressible: null
    },
    "image/tiff": {
        source: "iana",
        compressible: false,
        extensions: [
            "tif",
            "tiff"
        ]
    },
    "image/tiff-fx": {
        source: "iana",
        extensions: [
            "tfx"
        ],
        compressible: null
    },
    "image/vnd.adobe.photoshop": {
        source: "iana",
        compressible: true,
        extensions: [
            "psd"
        ]
    },
    "image/vnd.airzip.accelerator.azv": {
        source: "iana",
        extensions: [
            "azv"
        ],
        compressible: null
    },
    "image/vnd.dece.graphic": {
        source: "iana",
        extensions: [
            "uvi",
            "uvvi",
            "uvg",
            "uvvg"
        ],
        compressible: null
    },
    "image/vnd.djvu": {
        source: "iana",
        extensions: [
            "djvu",
            "djv"
        ],
        compressible: null
    },
    "image/vnd.dvb.subtitle": {
        source: "iana",
        extensions: [
            "sub"
        ],
        compressible: null
    },
    "image/vnd.dwg": {
        source: "iana",
        extensions: [
            "dwg"
        ],
        compressible: null
    },
    "image/vnd.dxf": {
        source: "iana",
        extensions: [
            "dxf"
        ],
        compressible: null
    },
    "image/vnd.fastbidsheet": {
        source: "iana",
        extensions: [
            "fbs"
        ],
        compressible: null
    },
    "image/vnd.fpx": {
        source: "iana",
        extensions: [
            "fpx"
        ],
        compressible: null
    },
    "image/vnd.fst": {
        source: "iana",
        extensions: [
            "fst"
        ],
        compressible: null
    },
    "image/vnd.fujixerox.edmics-mmr": {
        source: "iana",
        extensions: [
            "mmr"
        ],
        compressible: null
    },
    "image/vnd.fujixerox.edmics-rlc": {
        source: "iana",
        extensions: [
            "rlc"
        ],
        compressible: null
    },
    "image/vnd.microsoft.icon": {
        source: "iana",
        compressible: true,
        extensions: [
            "ico"
        ]
    },
    "image/vnd.ms-modi": {
        source: "iana",
        extensions: [
            "mdi"
        ],
        compressible: null
    },
    "image/vnd.ms-photo": {
        source: "apache",
        extensions: [
            "wdp"
        ],
        compressible: null
    },
    "image/vnd.net-fpx": {
        source: "iana",
        extensions: [
            "npx"
        ],
        compressible: null
    },
    "image/vnd.pco.b16": {
        source: "iana",
        extensions: [
            "b16"
        ],
        compressible: null
    },
    "image/vnd.tencent.tap": {
        source: "iana",
        extensions: [
            "tap"
        ],
        compressible: null
    },
    "image/vnd.valve.source.texture": {
        source: "iana",
        extensions: [
            "vtf"
        ],
        compressible: null
    },
    "image/vnd.wap.wbmp": {
        source: "iana",
        extensions: [
            "wbmp"
        ],
        compressible: null
    },
    "image/vnd.xiff": {
        source: "iana",
        extensions: [
            "xif"
        ],
        compressible: null
    },
    "image/vnd.zbrush.pcx": {
        source: "iana",
        extensions: [
            "pcx"
        ],
        compressible: null
    },
    "image/webp": {
        source: "apache",
        extensions: [
            "webp"
        ],
        compressible: null
    },
    "image/wmf": {
        source: "iana",
        extensions: [
            "wmf"
        ],
        compressible: null
    },
    "image/x-3ds": {
        source: "apache",
        extensions: [
            "3ds"
        ],
        compressible: null
    },
    "image/x-cmu-raster": {
        source: "apache",
        extensions: [
            "ras"
        ],
        compressible: null
    },
    "image/x-cmx": {
        source: "apache",
        extensions: [
            "cmx"
        ],
        compressible: null
    },
    "image/x-freehand": {
        source: "apache",
        extensions: [
            "fh",
            "fhc",
            "fh4",
            "fh5",
            "fh7"
        ],
        compressible: null
    },
    "image/x-icon": {
        source: "apache",
        compressible: true,
        extensions: [
            "ico"
        ]
    },
    "image/x-jng": {
        source: "nginx",
        extensions: [
            "jng"
        ],
        compressible: null
    },
    "image/x-mrsid-image": {
        source: "apache",
        extensions: [
            "sid"
        ],
        compressible: null
    },
    "image/x-ms-bmp": {
        source: "nginx",
        compressible: true,
        extensions: [
            "bmp"
        ]
    },
    "image/x-pcx": {
        source: "apache",
        extensions: [
            "pcx"
        ],
        compressible: null
    },
    "image/x-pict": {
        source: "apache",
        extensions: [
            "pic",
            "pct"
        ],
        compressible: null
    },
    "image/x-portable-anymap": {
        source: "apache",
        extensions: [
            "pnm"
        ],
        compressible: null
    },
    "image/x-portable-bitmap": {
        source: "apache",
        extensions: [
            "pbm"
        ],
        compressible: null
    },
    "image/x-portable-graymap": {
        source: "apache",
        extensions: [
            "pgm"
        ],
        compressible: null
    },
    "image/x-portable-pixmap": {
        source: "apache",
        extensions: [
            "ppm"
        ],
        compressible: null
    },
    "image/x-rgb": {
        source: "apache",
        extensions: [
            "rgb"
        ],
        compressible: null
    },
    "image/x-tga": {
        source: "apache",
        extensions: [
            "tga"
        ],
        compressible: null
    },
    "image/x-xbitmap": {
        source: "apache",
        extensions: [
            "xbm"
        ],
        compressible: null
    },
    "image/x-xpixmap": {
        source: "apache",
        extensions: [
            "xpm"
        ],
        compressible: null
    },
    "image/x-xwindowdump": {
        source: "apache",
        extensions: [
            "xwd"
        ],
        compressible: null
    },
    "message/disposition-notification": {
        source: "iana",
        extensions: [
            "disposition-notification"
        ],
        compressible: null
    },
    "message/global": {
        source: "iana",
        extensions: [
            "u8msg"
        ],
        compressible: null
    },
    "message/global-delivery-status": {
        source: "iana",
        extensions: [
            "u8dsn"
        ],
        compressible: null
    },
    "message/global-disposition-notification": {
        source: "iana",
        extensions: [
            "u8mdn"
        ],
        compressible: null
    },
    "message/global-headers": {
        source: "iana",
        extensions: [
            "u8hdr"
        ],
        compressible: null
    },
    "message/rfc822": {
        source: "iana",
        compressible: true,
        extensions: [
            "eml",
            "mime"
        ]
    },
    "message/vnd.wfa.wsc": {
        source: "iana",
        extensions: [
            "wsc"
        ],
        compressible: null
    },
    "model/3mf": {
        source: "iana",
        extensions: [
            "3mf"
        ],
        compressible: null
    },
    "model/gltf+json": {
        source: "iana",
        compressible: true,
        extensions: [
            "gltf"
        ]
    },
    "model/gltf-binary": {
        source: "iana",
        compressible: true,
        extensions: [
            "glb"
        ]
    },
    "model/iges": {
        source: "iana",
        compressible: false,
        extensions: [
            "igs",
            "iges"
        ]
    },
    "model/mesh": {
        source: "iana",
        compressible: false,
        extensions: [
            "msh",
            "mesh",
            "silo"
        ]
    },
    "model/mtl": {
        source: "iana",
        extensions: [
            "mtl"
        ],
        compressible: null
    },
    "model/obj": {
        source: "iana",
        extensions: [
            "obj"
        ],
        compressible: null
    },
    "model/step": {
        source: "iana",
        compressible: false,
        extensions: [
            ".p21",
            ".stp",
            ".step",
            ".stpnc",
            ".210"
        ]
    },
    "model/step+xml": {
        source: "iana",
        compressible: true,
        extensions: [
            "stpx"
        ]
    },
    "model/step+zip": {
        source: "iana",
        compressible: false,
        extensions: [
            "stpz"
        ]
    },
    "model/step-xml+zip": {
        source: "iana",
        compressible: false,
        extensions: [
            "stpxz"
        ]
    },
    "model/stl": {
        source: "iana",
        extensions: [
            "stl"
        ],
        compressible: null
    },
    "model/vnd.collada+xml": {
        source: "iana",
        compressible: true,
        extensions: [
            "dae"
        ]
    },
    "model/vnd.dwf": {
        source: "iana",
        extensions: [
            "dwf"
        ],
        compressible: null
    },
    "model/vnd.gdl": {
        source: "iana",
        extensions: [
            "gdl"
        ],
        compressible: null
    },
    "model/vnd.gtw": {
        source: "iana",
        extensions: [
            "gtw"
        ],
        compressible: null
    },
    "model/vnd.mts": {
        source: "iana",
        extensions: [
            "mts"
        ],
        compressible: null
    },
    "model/vnd.opengex": {
        source: "iana",
        extensions: [
            "ogex"
        ],
        compressible: null
    },
    "model/vnd.parasolid.transmit.binary": {
        source: "iana",
        extensions: [
            "x_b"
        ],
        compressible: null
    },
    "model/vnd.parasolid.transmit.text": {
        source: "iana",
        extensions: [
            "x_t"
        ],
        compressible: null
    },
    "model/vnd.sap.vds": {
        source: "iana",
        extensions: [
            "vds"
        ],
        compressible: null
    },
    "model/vnd.usdz+zip": {
        source: "iana",
        compressible: false,
        extensions: [
            "usdz"
        ]
    },
    "model/vnd.valve.source.compiled-map": {
        source: "iana",
        extensions: [
            "bsp"
        ],
        compressible: null
    },
    "model/vnd.vtu": {
        source: "iana",
        extensions: [
            "vtu"
        ],
        compressible: null
    },
    "model/vrml": {
        source: "iana",
        compressible: false,
        extensions: [
            "wrl",
            "vrml"
        ]
    },
    "model/x3d+binary": {
        source: "apache",
        compressible: false,
        extensions: [
            "x3db",
            "x3dbz"
        ]
    },
    "model/x3d+fastinfoset": {
        source: "iana",
        extensions: [
            "x3db"
        ],
        compressible: null
    },
    "model/x3d+vrml": {
        source: "apache",
        compressible: false,
        extensions: [
            "x3dv",
            "x3dvz"
        ]
    },
    "model/x3d+xml": {
        source: "iana",
        compressible: true,
        extensions: [
            "x3d",
            "x3dz"
        ]
    },
    "model/x3d-vrml": {
        source: "iana",
        extensions: [
            "x3dv"
        ],
        compressible: null
    },
    "text/cache-manifest": {
        source: "iana",
        compressible: true,
        extensions: [
            "appcache",
            "manifest"
        ]
    },
    "text/calendar": {
        source: "iana",
        extensions: [
            "ics",
            "ifb"
        ],
        compressible: null
    },
    "text/css": {
        source: "iana",
        charset: "UTF-8",
        compressible: true,
        extensions: [
            "css"
        ]
    },
    "text/csv": {
        source: "iana",
        compressible: true,
        extensions: [
            "csv"
        ]
    },
    "text/html": {
        source: "iana",
        compressible: true,
        extensions: [
            "html",
            "htm",
            "shtml"
        ]
    },
    "text/markdown": {
        source: "iana",
        compressible: true,
        extensions: [
            "markdown",
            "md"
        ]
    },
    "text/mathml": {
        source: "nginx",
        extensions: [
            "mml"
        ],
        compressible: null
    },
    "text/n3": {
        source: "iana",
        charset: "UTF-8",
        compressible: true,
        extensions: [
            "n3"
        ]
    },
    "text/plain": {
        source: "iana",
        compressible: true,
        extensions: [
            "txt",
            "text",
            "conf",
            "def",
            "list",
            "log",
            "in",
            "ini"
        ]
    },
    "text/prs.lines.tag": {
        source: "iana",
        extensions: [
            "dsc"
        ],
        compressible: null
    },
    "text/richtext": {
        source: "iana",
        compressible: true,
        extensions: [
            "rtx"
        ]
    },
    "text/rtf": {
        source: "iana",
        compressible: true,
        extensions: [
            "rtf"
        ]
    },
    "text/sgml": {
        source: "iana",
        extensions: [
            "sgml",
            "sgm"
        ],
        compressible: null
    },
    "text/shex": {
        source: "iana",
        extensions: [
            "shex"
        ],
        compressible: null
    },
    "text/spdx": {
        source: "iana",
        extensions: [
            "spdx"
        ],
        compressible: null
    },
    "text/tab-separated-values": {
        source: "iana",
        compressible: true,
        extensions: [
            "tsv"
        ]
    },
    "text/troff": {
        source: "iana",
        extensions: [
            "t",
            "tr",
            "roff",
            "man",
            "me",
            "ms"
        ],
        compressible: null
    },
    "text/turtle": {
        source: "iana",
        charset: "UTF-8",
        extensions: [
            "ttl"
        ],
        compressible: null
    },
    "text/uri-list": {
        source: "iana",
        compressible: true,
        extensions: [
            "uri",
            "uris",
            "urls"
        ]
    },
    "text/vcard": {
        source: "iana",
        compressible: true,
        extensions: [
            "vcard"
        ]
    },
    "text/vnd.curl": {
        source: "iana",
        extensions: [
            "curl"
        ],
        compressible: null
    },
    "text/vnd.curl.dcurl": {
        source: "apache",
        extensions: [
            "dcurl"
        ],
        compressible: null
    },
    "text/vnd.curl.mcurl": {
        source: "apache",
        extensions: [
            "mcurl"
        ],
        compressible: null
    },
    "text/vnd.curl.scurl": {
        source: "apache",
        extensions: [
            "scurl"
        ],
        compressible: null
    },
    "text/vnd.dvb.subtitle": {
        source: "iana",
        extensions: [
            "sub"
        ],
        compressible: null
    },
    "text/vnd.familysearch.gedcom": {
        source: "iana",
        extensions: [
            "ged"
        ],
        compressible: null
    },
    "text/vnd.fly": {
        source: "iana",
        extensions: [
            "fly"
        ],
        compressible: null
    },
    "text/vnd.fmi.flexstor": {
        source: "iana",
        extensions: [
            "flx"
        ],
        compressible: null
    },
    "text/vnd.graphviz": {
        source: "iana",
        extensions: [
            "gv"
        ],
        compressible: null
    },
    "text/vnd.in3d.3dml": {
        source: "iana",
        extensions: [
            "3dml"
        ],
        compressible: null
    },
    "text/vnd.in3d.spot": {
        source: "iana",
        extensions: [
            "spot"
        ],
        compressible: null
    },
    "text/vnd.sun.j2me.app-descriptor": {
        source: "iana",
        charset: "UTF-8",
        extensions: [
            "jad"
        ],
        compressible: null
    },
    "text/vnd.wap.wml": {
        source: "iana",
        extensions: [
            "wml"
        ],
        compressible: null
    },
    "text/vnd.wap.wmlscript": {
        source: "iana",
        extensions: [
            "wmls"
        ],
        compressible: null
    },
    "text/vtt": {
        source: "iana",
        charset: "UTF-8",
        compressible: true,
        extensions: [
            "vtt"
        ]
    },
    "text/x-asm": {
        source: "apache",
        extensions: [
            "s",
            "asm"
        ],
        compressible: null
    },
    "text/x-c": {
        source: "apache",
        extensions: [
            "c",
            "cc",
            "cxx",
            "cpp",
            "h",
            "hh",
            "dic"
        ],
        compressible: null
    },
    "text/x-component": {
        source: "nginx",
        extensions: [
            "htc"
        ],
        compressible: null
    },
    "text/x-fortran": {
        source: "apache",
        extensions: [
            "f",
            "for",
            "f77",
            "f90"
        ],
        compressible: null
    },
    "text/x-java-source": {
        source: "apache",
        extensions: [
            "java"
        ],
        compressible: null
    },
    "text/x-nfo": {
        source: "apache",
        extensions: [
            "nfo"
        ],
        compressible: null
    },
    "text/x-opml": {
        source: "apache",
        extensions: [
            "opml"
        ],
        compressible: null
    },
    "text/x-pascal": {
        source: "apache",
        extensions: [
            "p",
            "pas"
        ],
        compressible: null
    },
    "text/x-setext": {
        source: "apache",
        extensions: [
            "etx"
        ],
        compressible: null
    },
    "text/x-sfv": {
        source: "apache",
        extensions: [
            "sfv"
        ],
        compressible: null
    },
    "text/x-uuencode": {
        source: "apache",
        extensions: [
            "uu"
        ],
        compressible: null
    },
    "text/x-vcalendar": {
        source: "apache",
        extensions: [
            "vcs"
        ],
        compressible: null
    },
    "text/x-vcard": {
        source: "apache",
        extensions: [
            "vcf"
        ],
        compressible: null
    },
    "text/xml": {
        source: "iana",
        compressible: true,
        extensions: [
            "xml"
        ]
    },
    "video/3gpp": {
        source: "iana",
        extensions: [
            "3gp",
            "3gpp"
        ],
        compressible: null
    },
    "video/3gpp2": {
        source: "iana",
        extensions: [
            "3g2"
        ],
        compressible: null
    },
    "video/h261": {
        source: "iana",
        extensions: [
            "h261"
        ],
        compressible: null
    },
    "video/h263": {
        source: "iana",
        extensions: [
            "h263"
        ],
        compressible: null
    },
    "video/h264": {
        source: "iana",
        extensions: [
            "h264"
        ],
        compressible: null
    },
    "video/iso.segment": {
        source: "iana",
        extensions: [
            "m4s"
        ],
        compressible: null
    },
    "video/jpeg": {
        source: "iana",
        extensions: [
            "jpgv"
        ],
        compressible: null
    },
    "video/jpm": {
        source: "apache",
        extensions: [
            "jpm",
            "jpgm"
        ],
        compressible: null
    },
    "video/mj2": {
        source: "iana",
        extensions: [
            "mj2",
            "mjp2"
        ],
        compressible: null
    },
    "video/mp2t": {
        source: "iana",
        extensions: [
            "ts"
        ],
        compressible: null
    },
    "video/mp4": {
        source: "iana",
        compressible: false,
        extensions: [
            "mp4",
            "mp4v",
            "mpg4"
        ]
    },
    "video/mpeg": {
        source: "iana",
        compressible: false,
        extensions: [
            "mpeg",
            "mpg",
            "mpe",
            "m1v",
            "m2v"
        ]
    },
    "video/ogg": {
        source: "iana",
        compressible: false,
        extensions: [
            "ogv"
        ]
    },
    "video/quicktime": {
        source: "iana",
        compressible: false,
        extensions: [
            "qt",
            "mov"
        ]
    },
    "video/vnd.dece.hd": {
        source: "iana",
        extensions: [
            "uvh",
            "uvvh"
        ],
        compressible: null
    },
    "video/vnd.dece.mobile": {
        source: "iana",
        extensions: [
            "uvm",
            "uvvm"
        ],
        compressible: null
    },
    "video/vnd.dece.pd": {
        source: "iana",
        extensions: [
            "uvp",
            "uvvp"
        ],
        compressible: null
    },
    "video/vnd.dece.sd": {
        source: "iana",
        extensions: [
            "uvs",
            "uvvs"
        ],
        compressible: null
    },
    "video/vnd.dece.video": {
        source: "iana",
        extensions: [
            "uvv",
            "uvvv"
        ],
        compressible: null
    },
    "video/vnd.dvb.file": {
        source: "iana",
        extensions: [
            "dvb"
        ],
        compressible: null
    },
    "video/vnd.fvt": {
        source: "iana",
        extensions: [
            "fvt"
        ],
        compressible: null
    },
    "video/vnd.mpegurl": {
        source: "iana",
        extensions: [
            "mxu",
            "m4u"
        ],
        compressible: null
    },
    "video/vnd.ms-playready.media.pyv": {
        source: "iana",
        extensions: [
            "pyv"
        ],
        compressible: null
    },
    "video/vnd.uvvu.mp4": {
        source: "iana",
        extensions: [
            "uvu",
            "uvvu"
        ],
        compressible: null
    },
    "video/vnd.vivo": {
        source: "iana",
        extensions: [
            "viv"
        ],
        compressible: null
    },
    "video/webm": {
        source: "apache",
        compressible: false,
        extensions: [
            "webm"
        ]
    },
    "video/x-f4v": {
        source: "apache",
        extensions: [
            "f4v"
        ],
        compressible: null
    },
    "video/x-fli": {
        source: "apache",
        extensions: [
            "fli"
        ],
        compressible: null
    },
    "video/x-flv": {
        source: "apache",
        compressible: false,
        extensions: [
            "flv"
        ]
    },
    "video/x-m4v": {
        source: "apache",
        extensions: [
            "m4v"
        ],
        compressible: null
    },
    "video/x-matroska": {
        source: "apache",
        compressible: false,
        extensions: [
            "mkv",
            "mk3d",
            "mks"
        ]
    },
    "video/x-mng": {
        source: "apache",
        extensions: [
            "mng"
        ],
        compressible: null
    },
    "video/x-ms-asf": {
        source: "apache",
        extensions: [
            "asf",
            "asx"
        ],
        compressible: null
    },
    "video/x-ms-vob": {
        source: "apache",
        extensions: [
            "vob"
        ],
        compressible: null
    },
    "video/x-ms-wm": {
        source: "apache",
        extensions: [
            "wm"
        ],
        compressible: null
    },
    "video/x-ms-wmv": {
        source: "apache",
        compressible: false,
        extensions: [
            "wmv"
        ]
    },
    "video/x-ms-wmx": {
        source: "apache",
        extensions: [
            "wmx"
        ],
        compressible: null
    },
    "video/x-ms-wvx": {
        source: "apache",
        extensions: [
            "wvx"
        ],
        compressible: null
    },
    "video/x-msvideo": {
        source: "apache",
        extensions: [
            "avi"
        ],
        compressible: null
    },
    "video/x-sgi-movie": {
        source: "apache",
        extensions: [
            "movie"
        ],
        compressible: null
    },
    "video/x-smv": {
        source: "apache",
        extensions: [
            "smv"
        ],
        compressible: null
    },
    "x-conference/x-cooltalk": {
        source: "apache",
        extensions: [
            "ice"
        ],
        compressible: null
    }
};
const mimeTypes = mimeTypesInternal;

function extname(path) {
    const index = path.lastIndexOf(".");
    return index < 0 ? "" : path.substring(index);
}
const extensions = {};
const types = {};
// Populate the extensions/types maps
populateMaps(extensions, types);
/**
 * Lookup the MIME type for a file path/extension.
 *
 * @param {string} path
 * @return {boolean|string}
 */ function lookup(path) {
    if (!path || typeof path !== "string") {
        return false;
    }
    // get the extension ("ext" or ".ext" or full path)
    const extension = extname("x." + path).toLowerCase().substring(1);
    if (!extension) {
        return false;
    }
    return types[extension] || false;
}
/**
 * Populate the extensions and types maps.
 * @private
 */ function populateMaps(extensions, types) {
    // source preference (least -> most)
    const preference = [
        "nginx",
        "apache",
        undefined,
        "iana"
    ];
    Object.keys(mimeTypes).forEach((type)=>{
        const mime = mimeTypes[type];
        const exts = mime.extensions;
        if (!exts?.length) {
            return;
        }
        // mime -> extensions
        extensions[type] = exts;
        // extension -> mime
        for (const extension of exts){
            if (types[extension]) {
                const from = preference.indexOf(mimeTypes[types[extension]].source);
                const to = preference.indexOf(mime.source);
                if (types[extension] !== "application/octet-stream" && (from > to || from === to && types[extension].startsWith("application/"))) {
                    continue;
                }
            }
            // set the extension -> mime
            types[extension] = type;
        }
    });
}

function isRouteArray(routeConfig) {
  return Array.isArray(routeConfig);
}
function getDefaultSizeForType(fileType) {
  if (fileType === "image")
    return "4MB";
  if (fileType === "video")
    return "16MB";
  if (fileType === "audio")
    return "8MB";
  if (fileType === "blob")
    return "8MB";
  if (fileType === "pdf")
    return "4MB";
  if (fileType === "text")
    return "64KB";
  return "4MB";
}
function fillInputRouteConfig(routeConfig) {
  if (isRouteArray(routeConfig)) {
    return routeConfig.reduce((acc, fileType) => {
      acc[fileType] = {
        // Apply defaults
        maxFileSize: getDefaultSizeForType(fileType),
        maxFileCount: 1,
        minFileCount: 1,
        contentDisposition: "inline"
      };
      return acc;
    }, {});
  }
  const newConfig = {};
  const inputKeys = objectKeys(routeConfig);
  inputKeys.forEach((key) => {
    const value = routeConfig[key];
    if (!value)
      throw new Error("Invalid config during fill");
    const defaultValues = {
      maxFileSize: getDefaultSizeForType(key),
      maxFileCount: 1,
      minFileCount: 1,
      contentDisposition: "inline"
    };
    newConfig[key] = {
      ...defaultValues,
      ...value
    };
  }, {});
  return newConfig;
}
function getTypeFromFileName(fileName, allowedTypes) {
  const mimeType = lookup(fileName);
  if (!mimeType) {
    if (allowedTypes.includes("blob"))
      return "blob";
    throw new Error(`Could not determine type for ${fileName}, presigned URL generation failed`);
  }
  if (allowedTypes.some((type2) => type2.includes("/"))) {
    if (allowedTypes.includes(mimeType)) {
      return mimeType;
    }
  }
  const type = mimeType.toLowerCase() === "application/pdf" ? "pdf" : mimeType.split("/")[0];
  if (!allowedTypes.includes(type)) {
    if (allowedTypes.includes("blob")) {
      return "blob";
    } else {
      throw new Error(`File type ${type} not allowed for ${fileName}`);
    }
  }
  return type;
}
function generateUploadThingURL(path) {
  let host = "https://uploadthing.com";
  if (w.env.CUSTOM_INFRA_URL) {
    host = w.env.CUSTOM_INFRA_URL;
  }
  return `${host}${path}`;
}
const withExponentialBackoff = async (doTheThing, MAXIMUM_BACKOFF_MS = 64 * 1e3, MAX_RETRIES = 20) => {
  let tries = 0;
  let backoffMs = 500;
  let backoffFuzzMs = 0;
  let result = void 0;
  while (tries <= MAX_RETRIES) {
    result = await doTheThing();
    if (result !== void 0)
      return result;
    tries += 1;
    backoffMs = Math.min(MAXIMUM_BACKOFF_MS, backoffMs * 2);
    backoffFuzzMs = Math.floor(Math.random() * 500);
    if (tries > 3) {
      console.error(`[UT] Call unsuccessful after ${tries} tries. Retrying in ${Math.floor(backoffMs / 1e3)} seconds...`);
    }
    await new Promise((r) => setTimeout(r, backoffMs + backoffFuzzMs));
  }
  return null;
};
async function pollForFileData(opts, callback) {
  return withExponentialBackoff(async () => {
    const res = await opts.fetch(opts.url, {
      headers: {
        ...opts.apiKey && {
          "x-uploadthing-api-key": opts.apiKey
        },
        "x-uploadthing-version": opts.sdkVersion
      }
    });
    const maybeJson = await safeParseJSON(res);
    if (maybeJson instanceof Error) {
      console.error(`[UT] Error polling for file data for ${opts.url}: ${maybeJson.message}`);
      return null;
    }
    if (maybeJson.status !== "done")
      return void 0;
    await callback?.(maybeJson);
    return Symbol("backoff done without response");
  });
}
async function safeParseJSON(input) {
  if (typeof input === "string") {
    try {
      return JSON.parse(input);
    } catch (err) {
      console.error(`Error parsing JSON, got '${input}'`);
      return new Error(`Error parsing JSON, got '${input}'`);
    }
  }
  const text = await input.text();
  try {
    return JSON.parse(text ?? "null");
  } catch (err) {
    console.error(`Error parsing JSON, got '${text}'`);
    return new Error(`Error parsing JSON, got '${text}'`);
  }
}
function objectKeys(obj) {
  return Object.keys(obj);
}
function isObject$1(obj) {
  return typeof obj === "object" && obj !== null && !Array.isArray(obj);
}
function asArray(val) {
  return Array.isArray(val) ? val : [
    val
  ];
}
function contentDisposition(contentDisposition2, fileName) {
  return [
    contentDisposition2,
    `filename="${encodeURI(fileName)}"`,
    `filename*=UTF-8''${encodeURI(fileName)}`
  ].join("; ");
}
function semverLite(required, toCheck) {
  const semverRegex = /(\d+)\.?(\d+)?\.?(\d+)?/;
  const requiredMatch = required.match(semverRegex);
  if (!requiredMatch?.[0]) {
    throw new Error(`Invalid semver requirement: ${required}`);
  }
  const toCheckMatch = toCheck.match(semverRegex);
  if (!toCheckMatch?.[0]) {
    throw new Error(`Invalid semver to check: ${toCheck}`);
  }
  const [_1, rMajor, rMinor, rPatch] = requiredMatch;
  const [_2, cMajor, cMinor, cPatch] = toCheckMatch;
  if (required.startsWith("^")) {
    if (rMajor !== cMajor)
      return false;
    if (rMinor > cMinor)
      return false;
    return true;
  }
  if (required.startsWith("~")) {
    if (rMajor !== cMajor)
      return false;
    if (rMinor !== cMinor)
      return false;
    return true;
  }
  return rMajor === cMajor && rMinor === cMinor && rPatch === cPatch;
}
function getFullApiUrl(maybeUrl) {
  const base = (() => {
    if (typeof window !== "undefined")
      return window.location.origin;
    if (w.env?.VERCEL_URL)
      return `https://${w.env.VERCEL_URL}`;
    return "http://localhost:3000";
  })();
  try {
    const url = new URL(maybeUrl ?? "/api/uploadthing", base);
    if (url.pathname === "/") {
      url.pathname = "/api/uploadthing";
    }
    return url;
  } catch (err) {
    throw new Error(`Failed to parse '${maybeUrl}' as a URL. Make sure it's a valid URL or path`);
  }
}
function resolveMaybeUrlArg(maybeUrl) {
  return maybeUrl instanceof URL ? maybeUrl : getFullApiUrl(maybeUrl);
}
const ERROR_CODES = {
  // Generic
  BAD_REQUEST: 400,
  NOT_FOUND: 404,
  FORBIDDEN: 403,
  INTERNAL_SERVER_ERROR: 500,
  INTERNAL_CLIENT_ERROR: 500,
  // S3 specific
  TOO_LARGE: 413,
  TOO_SMALL: 400,
  TOO_MANY_FILES: 400,
  KEY_TOO_LONG: 400,
  // UploadThing specific
  URL_GENERATION_FAILED: 500,
  UPLOAD_FAILED: 500,
  MISSING_ENV: 500,
  FILE_LIMIT_EXCEEDED: 500
};
function messageFromUnknown(cause, fallback) {
  if (typeof cause === "string") {
    return cause;
  }
  if (cause instanceof Error) {
    return cause.message;
  }
  if (cause && typeof cause === "object" && "message" in cause && typeof cause.message === "string") {
    return cause.message;
  }
  return fallback ?? "An unknown error occurred";
}
class UploadThingError extends Error {
  constructor(initOpts) {
    const opts = typeof initOpts === "string" ? {
      code: "INTERNAL_SERVER_ERROR",
      message: initOpts
    } : initOpts;
    const message = opts.message ?? messageFromUnknown(opts.cause, opts.code);
    super(message);
    this.code = opts.code;
    this.data = opts.data;
    if (opts.cause instanceof Error) {
      this.cause = opts.cause;
    } else if (opts.cause instanceof Response) {
      this.cause = new Error(`Response ${opts.cause.status} ${opts.cause.statusText}`);
    } else if (typeof opts.cause === "string") {
      this.cause = new Error(opts.cause);
    } else {
      this.cause = opts.cause;
    }
  }
  static async fromResponse(response) {
    const jsonOrError = await safeParseJSON(response);
    if (jsonOrError instanceof Error) {
      return new UploadThingError({
        message: jsonOrError.message,
        code: getErrorTypeFromStatusCode(response.status),
        cause: response
      });
    }
    let message = void 0;
    if (isObject$1(jsonOrError)) {
      if (typeof jsonOrError.message === "string") {
        message = jsonOrError.message;
      } else if (typeof jsonOrError.error === "string") {
        message = jsonOrError.error;
      }
    }
    return new UploadThingError({
      message,
      code: getErrorTypeFromStatusCode(response.status),
      cause: response,
      data: jsonOrError
    });
  }
  static toObject(error) {
    return {
      code: error.code,
      message: error.message,
      data: error.data
    };
  }
  static serialize(error) {
    return JSON.stringify(UploadThingError.toObject(error));
  }
}
function getStatusCodeFromError(error) {
  return ERROR_CODES[error.code] ?? 500;
}
function getErrorTypeFromStatusCode(statusCode) {
  for (const [code, status] of Object.entries(ERROR_CODES)) {
    if (status === statusCode) {
      return code;
    }
  }
  return "INTERNAL_SERVER_ERROR";
}
const INTERNAL_DO_NOT_USE__fatalClientError = (e) => new UploadThingError({
  code: "INTERNAL_CLIENT_ERROR",
  message: "Something went wrong. Please report this to UploadThing.",
  cause: e
});
const generateMimeTypes = (fileTypes) => {
  const accepted = fileTypes.map((type) => {
    if (type === "blob")
      return "blob";
    if (type === "pdf")
      return "application/pdf";
    if (type.includes("/"))
      return type;
    else
      return `${type}/*`;
  });
  if (accepted.includes("blob")) {
    return void 0;
  }
  return accepted;
};
const generateClientDropzoneAccept = (fileTypes) => {
  const mimeTypes = generateMimeTypes(fileTypes);
  if (!mimeTypes)
    return void 0;
  return Object.fromEntries(mimeTypes.map((type) => [
    type,
    []
  ]));
};
const generatePermittedFileTypes = (config) => {
  const fileTypes = config ? objectKeys(config) : [];
  const maxFileCount = config ? Object.values(config).map((v) => v.maxFileCount) : [];
  return {
    fileTypes,
    multiple: maxFileCount.some((v) => v && v > 1)
  };
};
const capitalizeStart = (str) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};
const INTERNAL_doFormatting = (config) => {
  if (!config)
    return "";
  const allowedTypes = objectKeys(config);
  const formattedTypes = allowedTypes.map((f) => f === "blob" ? "file" : f);
  if (formattedTypes.length > 1) {
    const lastType = formattedTypes.pop();
    return `${formattedTypes.join("s, ")} and ${lastType}s`;
  }
  const key = allowedTypes[0];
  const formattedKey = formattedTypes[0];
  const { maxFileSize, maxFileCount, minFileCount } = config[key];
  if (maxFileCount && maxFileCount > 1) {
    if (minFileCount > 1) {
      return `${minFileCount} - ${maxFileCount} ${formattedKey}s up to ${maxFileSize}`;
    } else {
      return `${formattedKey}s up to ${maxFileSize}, max ${maxFileCount}`;
    }
  } else {
    return `${formattedKey} (${maxFileSize})`;
  }
};
const allowedContentTextLabelGenerator = (config) => {
  return capitalizeStart(INTERNAL_doFormatting(config));
};
const styleFieldToClassName = (styleField, args) => {
  if (typeof styleField === "string")
    return styleField;
  if (typeof styleField === "function") {
    const result = styleField(args);
    if (typeof result === "string")
      return result;
  }
  return "";
};
const styleFieldToCssObject = (styleField, args) => {
  if (typeof styleField === "object")
    return styleField;
  if (typeof styleField === "function") {
    const result = styleField(args);
    if (typeof result === "object")
      return result;
  }
  return {};
};
const contentFieldToContent = (contentField, arg) => {
  if (!contentField)
    return null;
  if (typeof contentField !== "function")
    return contentField;
  if (typeof contentField === "function") {
    const result = contentField(arg);
    return result;
  }
};
const signaturePrefix = "hmac-sha256=";
const algorithm = {
  name: "HMAC",
  hash: "SHA-256"
};
const signPayload = async (payload, secret) => {
  const encoder = new TextEncoder();
  const signingKey = await crypto.subtle.importKey("raw", encoder.encode(secret), algorithm, false, [
    "sign"
  ]);
  const signature = await crypto.subtle.sign(algorithm, signingKey, encoder.encode(payload)).then((sig) => Buffer.from(sig).toString("hex"));
  return `${signaturePrefix}${signature}`;
};
const verifySignature = async (payload, signature, secret) => {
  const sig = signature?.slice(signaturePrefix.length);
  if (!sig)
    return false;
  const encoder = new TextEncoder();
  const signingKey = await crypto.subtle.importKey("raw", encoder.encode(secret), algorithm, false, [
    "verify"
  ]);
  return await crypto.subtle.verify(algorithm, signingKey, Uint8Array.from(Buffer.from(sig, "hex")), encoder.encode(payload));
};

const LogLevels = {
  silent: Number.NEGATIVE_INFINITY,
  fatal: 0,
  error: 0,
  warn: 1,
  log: 2,
  info: 3,
  success: 3,
  fail: 3,
  ready: 3,
  start: 3,
  box: 3,
  debug: 4,
  trace: 5,
  verbose: Number.POSITIVE_INFINITY
};
const LogTypes = {
  // Silent
  silent: {
    level: -1
  },
  // Level 0
  fatal: {
    level: LogLevels.fatal
  },
  error: {
    level: LogLevels.error
  },
  // Level 1
  warn: {
    level: LogLevels.warn
  },
  // Level 2
  log: {
    level: LogLevels.log
  },
  // Level 3
  info: {
    level: LogLevels.info
  },
  success: {
    level: LogLevels.success
  },
  fail: {
    level: LogLevels.fail
  },
  ready: {
    level: LogLevels.info
  },
  start: {
    level: LogLevels.info
  },
  box: {
    level: LogLevels.info
  },
  // Level 4
  debug: {
    level: LogLevels.debug
  },
  // Level 5
  trace: {
    level: LogLevels.trace
  },
  // Verbose
  verbose: {
    level: LogLevels.verbose
  }
};

function isObject(value) {
  return value !== null && typeof value === "object";
}
function _defu(baseObject, defaults, namespace = ".", merger) {
  if (!isObject(defaults)) {
    return _defu(baseObject, {}, namespace, merger);
  }
  const object = Object.assign({}, defaults);
  for (const key in baseObject) {
    if (key === "__proto__" || key === "constructor") {
      continue;
    }
    const value = baseObject[key];
    if (value === null || value === void 0) {
      continue;
    }
    if (merger && merger(object, key, value, namespace)) {
      continue;
    }
    if (Array.isArray(value) && Array.isArray(object[key])) {
      object[key] = [...value, ...object[key]];
    } else if (isObject(value) && isObject(object[key])) {
      object[key] = _defu(
        value,
        object[key],
        (namespace ? `${namespace}.` : "") + key.toString(),
        merger
      );
    } else {
      object[key] = value;
    }
  }
  return object;
}
function createDefu(merger) {
  return (...arguments_) => (
    // eslint-disable-next-line unicorn/no-array-reduce
    arguments_.reduce((p, c) => _defu(p, c, "", merger), {})
  );
}
const defu = createDefu();

function isPlainObject(obj) {
  return Object.prototype.toString.call(obj) === "[object Object]";
}
function isLogObj(arg) {
  if (!isPlainObject(arg)) {
    return false;
  }
  if (!arg.message && !arg.args) {
    return false;
  }
  if (arg.stack) {
    return false;
  }
  return true;
}

let paused = false;
const queue = [];
class Consola {
  constructor(options = {}) {
    const types = options.types || LogTypes;
    this.options = defu(
      {
        ...options,
        defaults: { ...options.defaults },
        level: _normalizeLogLevel(options.level, types),
        reporters: [...options.reporters || []]
      },
      {
        types: LogTypes,
        throttle: 1e3,
        throttleMin: 5,
        formatOptions: {
          date: true,
          colors: false,
          compact: true
        }
      }
    );
    for (const type in types) {
      const defaults = {
        type,
        ...this.options.defaults,
        ...types[type]
      };
      this[type] = this._wrapLogFn(defaults);
      this[type].raw = this._wrapLogFn(
        defaults,
        true
      );
    }
    if (this.options.mockFn) {
      this.mockTypes();
    }
    this._lastLog = {};
  }
  get level() {
    return this.options.level;
  }
  set level(level) {
    this.options.level = _normalizeLogLevel(
      level,
      this.options.types,
      this.options.level
    );
  }
  prompt(message, opts) {
    if (!this.options.prompt) {
      throw new Error("prompt is not supported!");
    }
    return this.options.prompt(message, opts);
  }
  create(options) {
    const instance = new Consola({
      ...this.options,
      ...options
    });
    if (this._mockFn) {
      instance.mockTypes(this._mockFn);
    }
    return instance;
  }
  withDefaults(defaults) {
    return this.create({
      ...this.options,
      defaults: {
        ...this.options.defaults,
        ...defaults
      }
    });
  }
  withTag(tag) {
    return this.withDefaults({
      tag: this.options.defaults.tag ? this.options.defaults.tag + ":" + tag : tag
    });
  }
  addReporter(reporter) {
    this.options.reporters.push(reporter);
    return this;
  }
  removeReporter(reporter) {
    if (reporter) {
      const i = this.options.reporters.indexOf(reporter);
      if (i >= 0) {
        return this.options.reporters.splice(i, 1);
      }
    } else {
      this.options.reporters.splice(0);
    }
    return this;
  }
  setReporters(reporters) {
    this.options.reporters = Array.isArray(reporters) ? reporters : [reporters];
    return this;
  }
  wrapAll() {
    this.wrapConsole();
    this.wrapStd();
  }
  restoreAll() {
    this.restoreConsole();
    this.restoreStd();
  }
  wrapConsole() {
    for (const type in this.options.types) {
      if (!console["__" + type]) {
        console["__" + type] = console[type];
      }
      console[type] = this[type].raw;
    }
  }
  restoreConsole() {
    for (const type in this.options.types) {
      if (console["__" + type]) {
        console[type] = console["__" + type];
        delete console["__" + type];
      }
    }
  }
  wrapStd() {
    this._wrapStream(this.options.stdout, "log");
    this._wrapStream(this.options.stderr, "log");
  }
  _wrapStream(stream, type) {
    if (!stream) {
      return;
    }
    if (!stream.__write) {
      stream.__write = stream.write;
    }
    stream.write = (data) => {
      this[type].raw(String(data).trim());
    };
  }
  restoreStd() {
    this._restoreStream(this.options.stdout);
    this._restoreStream(this.options.stderr);
  }
  _restoreStream(stream) {
    if (!stream) {
      return;
    }
    if (stream.__write) {
      stream.write = stream.__write;
      delete stream.__write;
    }
  }
  pauseLogs() {
    paused = true;
  }
  resumeLogs() {
    paused = false;
    const _queue = queue.splice(0);
    for (const item of _queue) {
      item[0]._logFn(item[1], item[2]);
    }
  }
  mockTypes(mockFn) {
    const _mockFn = mockFn || this.options.mockFn;
    this._mockFn = _mockFn;
    if (typeof _mockFn !== "function") {
      return;
    }
    for (const type in this.options.types) {
      this[type] = _mockFn(type, this.options.types[type]) || this[type];
      this[type].raw = this[type];
    }
  }
  _wrapLogFn(defaults, isRaw) {
    return (...args) => {
      if (paused) {
        queue.push([this, defaults, args, isRaw]);
        return;
      }
      return this._logFn(defaults, args, isRaw);
    };
  }
  _logFn(defaults, args, isRaw) {
    if ((defaults.level || 0) > this.level) {
      return false;
    }
    const logObj = {
      date: /* @__PURE__ */ new Date(),
      args: [],
      ...defaults,
      level: _normalizeLogLevel(defaults.level, this.options.types)
    };
    if (!isRaw && args.length === 1 && isLogObj(args[0])) {
      Object.assign(logObj, args[0]);
    } else {
      logObj.args = [...args];
    }
    if (logObj.message) {
      logObj.args.unshift(logObj.message);
      delete logObj.message;
    }
    if (logObj.additional) {
      if (!Array.isArray(logObj.additional)) {
        logObj.additional = logObj.additional.split("\n");
      }
      logObj.args.push("\n" + logObj.additional.join("\n"));
      delete logObj.additional;
    }
    logObj.type = typeof logObj.type === "string" ? logObj.type.toLowerCase() : "log";
    logObj.tag = typeof logObj.tag === "string" ? logObj.tag : "";
    const resolveLog = (newLog = false) => {
      const repeated = (this._lastLog.count || 0) - this.options.throttleMin;
      if (this._lastLog.object && repeated > 0) {
        const args2 = [...this._lastLog.object.args];
        if (repeated > 1) {
          args2.push(`(repeated ${repeated} times)`);
        }
        this._log({ ...this._lastLog.object, args: args2 });
        this._lastLog.count = 1;
      }
      if (newLog) {
        this._lastLog.object = logObj;
        this._log(logObj);
      }
    };
    clearTimeout(this._lastLog.timeout);
    const diffTime = this._lastLog.time && logObj.date ? logObj.date.getTime() - this._lastLog.time.getTime() : 0;
    this._lastLog.time = logObj.date;
    if (diffTime < this.options.throttle) {
      try {
        const serializedLog = JSON.stringify([
          logObj.type,
          logObj.tag,
          logObj.args
        ]);
        const isSameLog = this._lastLog.serialized === serializedLog;
        this._lastLog.serialized = serializedLog;
        if (isSameLog) {
          this._lastLog.count = (this._lastLog.count || 0) + 1;
          if (this._lastLog.count > this.options.throttleMin) {
            this._lastLog.timeout = setTimeout(
              resolveLog,
              this.options.throttle
            );
            return;
          }
        }
      } catch {
      }
    }
    resolveLog(true);
  }
  _log(logObj) {
    for (const reporter of this.options.reporters) {
      reporter.log(logObj, {
        options: this.options
      });
    }
  }
}
function _normalizeLogLevel(input, types = {}, defaultLevel = 3) {
  if (input === void 0) {
    return defaultLevel;
  }
  if (typeof input === "number") {
    return input;
  }
  if (types[input] && types[input].level !== void 0) {
    return types[input].level;
  }
  return defaultLevel;
}
Consola.prototype.add = Consola.prototype.addReporter;
Consola.prototype.remove = Consola.prototype.removeReporter;
Consola.prototype.clear = Consola.prototype.removeReporter;
Consola.prototype.withScope = Consola.prototype.withTag;
Consola.prototype.mock = Consola.prototype.mockTypes;
Consola.prototype.pause = Consola.prototype.pauseLogs;
Consola.prototype.resume = Consola.prototype.resumeLogs;
function createConsola(options = {}) {
  return new Consola(options);
}

/**
 * Marker used to append a `customId` to the incoming file data in `.middleware()`
 * @example
 * ```ts
 * .middleware((opts) => {
 *   return {
 *     [UTFiles]: opts.files.map((file) => ({
 *       ...file,
 *       customId: generateId(),
 *     }))
 *   };
 * })
 * ```
 */ const UTFiles = Symbol("uploadthing-custom-id-symbol");
/**
 * Valid options for the `?actionType` query param
 */ const VALID_ACTION_TYPES = [
    "upload",
    "failure",
    "multipart-complete"
];

var version = "6.9.0";
function defaultErrorFormatter(error) {
  return {
    message: error.message
  };
}
function formatError(error, router) {
  const errorFormatter = router[Object.keys(router)[0]]?._def.errorFormatter ?? defaultErrorFormatter;
  return errorFormatter(error);
}
const colorize = (str, level) => {
  switch (level) {
    case "error":
    case "fatal":
      return `\x1B[41m\x1B[30m${str}\x1B[0m`;
    case "warn":
      return `\x1B[43m\x1B[30m${str}\x1B[0m`;
    case "info":
    case "log":
      return `\x1B[44m\x1B[30m${str}\x1B[0m`;
    case "debug":
      return `\x1B[47m\x1B[30m${str}\x1B[0m`;
    case "trace":
      return `\x1B[47m\x1B[30m${str}\x1B[0m`;
    case "success":
      return `\x1B[42m\x1B[30m${str}\x1B[0m`;
    default:
      return str;
  }
};
const icons = {
  fatal: "⨯",
  error: "⨯",
  warn: "⚠️",
  info: "ℹ",
  log: "ℹ",
  debug: "⚙",
  trace: "→",
  success: "✓"
};
function formatStack(stack) {
  const cwd = "cwd" in w && typeof w.cwd === "function" ? w.cwd() : "__UnknownCWD__";
  return "  " + stack.split("\n").splice(1).map((l) => l.trim().replace("file://", "").replace(cwd + "/", "")).join("\n  ");
}
function formatArgs(args) {
  const fmtArgs = args.map((arg) => {
    if (isObject$1(arg) && typeof arg.stack === "string") {
      return arg.message + "\n" + formatStack(arg.stack);
    }
    return arg;
  });
  return fmtArgs.map((arg) => {
    if (typeof arg === "string") {
      return arg;
    }
    return JSON.stringify(arg, null, 4);
  });
}
const logger = createConsola({
  reporters: [
    {
      log: (logObj) => {
        const { type, tag, date, args } = logObj;
        const icon = icons[type];
        const logPrefix = colorize(` ${icon} ${tag} ${date.toLocaleTimeString()} `, type);
        const lines = formatArgs(args).join(" ").split("\n").map((l) => logPrefix + " " + l).join("\n");
        console.log(lines);
      }
    }
  ],
  defaults: {
    tag: "UPLOADTHING"
  }
});
const initLogger = (level) => {
  logger.level = LogLevels[level ?? "info"];
};
const isValidResponse = (response) => {
  if (!response.ok)
    return false;
  if (response.status >= 400)
    return false;
  if (!response.headers.has("x-uploadthing-version"))
    return false;
  return true;
};
const conditionalDevServer = async (opts) => {
  const fileData = await pollForFileData({
    url: generateUploadThingURL(`/api/pollUpload/${opts.fileKey}`),
    apiKey: opts.apiKey,
    sdkVersion: version,
    fetch: opts.fetch
  }, async (json) => {
    const file = json.fileData;
    let callbackUrl = file.callbackUrl + `?slug=${file.callbackSlug}`;
    if (!callbackUrl.startsWith("http"))
      callbackUrl = "http://" + callbackUrl;
    logger.info("SIMULATING FILE UPLOAD WEBHOOK CALLBACK", callbackUrl);
    const payload = JSON.stringify({
      status: "uploaded",
      metadata: JSON.parse(file.metadata ?? "{}"),
      file: {
        url: `https://utfs.io/f/${encodeURIComponent(opts.fileKey)}`,
        key: opts.fileKey,
        name: file.fileName,
        size: file.fileSize,
        type: file.fileType,
        customId: file.customId
      }
    });
    const signature = await signPayload(payload, opts.apiKey);
    try {
      const response = await opts.fetch(callbackUrl, {
        method: "POST",
        body: payload,
        headers: {
          "content-type": "application/json",
          "uploadthing-hook": "callback",
          "x-uploadthing-signature": signature
        }
      });
      if (isValidResponse(response)) {
        logger.success("Successfully simulated callback for file", opts.fileKey);
      } else {
        throw new Error("Invalid response");
      }
    } catch (e) {
      logger.error(`Failed to simulate callback for file '${opts.fileKey}'. Is your webhook configured correctly?`);
      logger.error(`  - Make sure the URL '${callbackUrl}' is accessible without any authentication. You can verify this by running 'curl -X POST ${callbackUrl}' in your terminal`);
      logger.error(`  - Still facing issues? Read https://docs.uploadthing.com/faq for common issues`);
    }
    return file;
  });
  if (fileData !== void 0)
    return fileData;
  logger.error(`Failed to simulate callback for file ${opts.fileKey}`);
  throw new UploadThingError({
    code: "UPLOAD_FAILED",
    message: "File took too long to upload"
  });
};
function getParseFn(parser) {
  if (typeof parser.parse === "function") {
    return parser.parse;
  }
  throw new Error("Invalid parser");
}
const createUTFetch = (apiKey, fetch, fePackage, beAdapter) => {
  return async (endpoint, payload) => {
    const response = await fetch(generateUploadThingURL(endpoint), {
      method: "POST",
      body: JSON.stringify(payload),
      headers: {
        "Content-Type": "application/json",
        "x-uploadthing-api-key": apiKey,
        "x-uploadthing-version": version,
        "x-uploadthing-fe-package": fePackage,
        "x-uploadthing-be-adapter": beAdapter
      }
    });
    return response;
  };
};
const fileCountBoundsCheck = (files, routeConfig) => {
  const counts = files.reduce((acc, file) => {
    const type = getTypeFromFileName(file.name, objectKeys(routeConfig));
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});
  for (const _key in counts) {
    const key = _key;
    const config = routeConfig[key];
    if (!config) {
      throw new UploadThingError({
        code: "BAD_REQUEST",
        message: `Invalid config during file count - missing ${key}`,
        cause: `Expected route config to have a config for key ${key} but none was found.`
      });
    }
    const count = counts[key];
    const min = config.minFileCount;
    const max = config.maxFileCount;
    if (min > max) {
      throw new UploadThingError({
        code: "BAD_REQUEST",
        message: "Invalid config during file count - minFileCount > maxFileCount",
        cause: `minFileCount must be less than maxFileCount for key ${key}. got: ${min} > ${max}`
      });
    }
    if (count < min || count > max) {
      return {
        minCount: min,
        minCountHit: count < min,
        maxCount: max,
        maxCountHit: count > max,
        count,
        type: key
      };
    }
  }
  return {
    minCountHit: false,
    maxCountHit: false
  };
};
const buildRequestHandler = (opts, adapter) => {
  return async (input) => {
    const isDev = opts.config?.isDev ?? v;
    const fetch = opts.config?.fetch ?? globalThis.fetch;
    if (isDev) {
      logger.info("UploadThing dev server is now running!");
    }
    const { router, config } = opts;
    const preferredOrEnvSecret = config?.uploadthingSecret ?? w.env.UPLOADTHING_SECRET;
    const req = input.req;
    const url = new URL(req.url);
    const params = url.searchParams;
    const uploadthingHook = req.headers.get("uploadthing-hook") ?? void 0;
    const slug = params.get("slug") ?? void 0;
    const actionType = params.get("actionType") ?? void 0;
    const utFrontendPackage = req.headers.get("x-uploadthing-package") ?? "unknown";
    const clientVersion = req.headers.get("x-uploadthing-version");
    if (clientVersion != null && clientVersion !== version) {
      logger.error("Client version mismatch");
      return new UploadThingError({
        code: "BAD_REQUEST",
        message: "Client version mismatch",
        cause: `Server version: ${version}, Client version: ${clientVersion}`
      });
    }
    if (!slug) {
      logger.error("No slug provided in params:", params);
      return new UploadThingError({
        code: "BAD_REQUEST",
        message: "No slug provided in params"
      });
    }
    if (slug && typeof slug !== "string") {
      const msg = `Expected slug to be of type 'string', got '${typeof slug}'`;
      logger.error(msg);
      return new UploadThingError({
        code: "BAD_REQUEST",
        message: "`slug` must be a string",
        cause: msg
      });
    }
    if (actionType && typeof actionType !== "string") {
      const msg = `Expected actionType to be of type 'string', got '${typeof actionType}'`;
      logger.error(msg);
      return new UploadThingError({
        code: "BAD_REQUEST",
        message: "`actionType` must be a string",
        cause: msg
      });
    }
    if (uploadthingHook && typeof uploadthingHook !== "string") {
      const msg = `Expected uploadthingHook to be of type 'string', got '${typeof uploadthingHook}'`;
      return new UploadThingError({
        code: "BAD_REQUEST",
        message: "`uploadthingHook` must be a string",
        cause: msg
      });
    }
    if (!preferredOrEnvSecret) {
      const msg = `No secret provided, please set UPLOADTHING_SECRET in your env file or in the config`;
      logger.error(msg);
      return new UploadThingError({
        code: "MISSING_ENV",
        message: `No secret provided`,
        cause: msg
      });
    }
    if (!preferredOrEnvSecret.startsWith("sk_")) {
      const msg = `Invalid secret provided, UPLOADTHING_SECRET must start with 'sk_'`;
      logger.error(msg);
      return new UploadThingError({
        code: "MISSING_ENV",
        message: "Invalid API key. API keys must start with 'sk_'.",
        cause: msg
      });
    }
    if (utFrontendPackage && typeof utFrontendPackage !== "string") {
      const msg = `Expected x-uploadthing-package to be of type 'string', got '${typeof utFrontendPackage}'`;
      logger.error(msg);
      return new UploadThingError({
        code: "BAD_REQUEST",
        message: "`x-uploadthing-package` must be a string. eg. '@uploadthing/react'",
        cause: msg
      });
    }
    const uploadable = router[slug];
    if (!uploadable) {
      const msg = `No file route found for slug ${slug}`;
      logger.error(msg);
      return new UploadThingError({
        code: "NOT_FOUND",
        message: msg
      });
    }
    const utFetch = createUTFetch(preferredOrEnvSecret, fetch, utFrontendPackage, adapter);
    logger.debug("All request input is valid", {
      slug,
      actionType,
      uploadthingHook
    });
    if (uploadthingHook === "callback") {
      const maybeReqBody = await safeParseJSON(req);
      logger.debug("Handling callback request with input:", maybeReqBody);
      if (maybeReqBody instanceof Error) {
        logger.error("Invalid request body", maybeReqBody);
        return new UploadThingError({
          code: "BAD_REQUEST",
          message: "Invalid request body",
          cause: maybeReqBody
        });
      }
      const verified = await verifySignature(JSON.stringify(maybeReqBody), req.headers.get("x-uploadthing-signature"), preferredOrEnvSecret);
      logger.debug("Signature verified:", verified);
      if (!verified) {
        logger.error("Invalid signature");
        return new UploadThingError({
          code: "BAD_REQUEST",
          message: "Invalid signature"
        });
      }
      const resolverArgs = {
        file: maybeReqBody.file,
        metadata: maybeReqBody.metadata
      };
      logger.debug("Running 'onUploadComplete' callback with input:", resolverArgs);
      const res = await uploadable.resolver(resolverArgs);
      const payload = {
        fileKey: maybeReqBody.file.key,
        callbackData: res ?? null
      };
      logger.debug("'onUploadComplete' callback finished. Sending response to UploadThing:", payload);
      const callbackResponse = await utFetch("/api/serverCallback", payload);
      logger.debug("UploadThing responded with status:", callbackResponse.status);
      return {
        status: 200,
        body: null
      };
    }
    if (!actionType || !VALID_ACTION_TYPES.includes(actionType)) {
      const msg = `Expected ${VALID_ACTION_TYPES.map((x) => `"${x}"`).join(", ").replace(/,(?!.*,)/, " or")} but got "${actionType}"`;
      logger.error("Invalid action type.", msg);
      return new UploadThingError({
        code: "BAD_REQUEST",
        cause: `Invalid action type ${actionType}`,
        message: msg
      });
    }
    switch (actionType) {
      case "upload": {
        const maybeInput = await safeParseJSON(req);
        if (maybeInput instanceof Error) {
          logger.error("Invalid request body", maybeInput);
          return new UploadThingError({
            code: "BAD_REQUEST",
            message: "Invalid request body",
            cause: maybeInput
          });
        }
        logger.debug("Handling upload request with input:", maybeInput);
        const { files, input: userInput } = maybeInput;
        if (!Array.isArray(files) || !files.every((f) => isObject$1(f) && typeof f.name === "string" && typeof f.size === "number" && typeof f.type === "string")) {
          const msg = `Expected files to be of type '{name:string, size:number, type:string}[]', got '${JSON.stringify(files)}'`;
          logger.error(msg);
          return new UploadThingError({
            code: "BAD_REQUEST",
            message: "Files must be an array of objects with name and size",
            cause: msg
          });
        }
        let parsedInput = {};
        try {
          logger.debug("Parsing input");
          const inputParser = uploadable._def.inputParser;
          parsedInput = await getParseFn(inputParser)(userInput);
          logger.debug("Input parsed successfully", parsedInput);
        } catch (error) {
          logger.error("An error occurred trying to parse input:", error);
          return new UploadThingError({
            code: "BAD_REQUEST",
            message: "Invalid input.",
            cause: error
          });
        }
        let metadata = {};
        try {
          logger.debug("Running middleware");
          metadata = await uploadable._def.middleware({
            ...input.middlewareArgs,
            input: parsedInput,
            files
          });
          logger.debug("Middleware finished successfully with:", metadata);
        } catch (error) {
          logger.error("An error occurred in your middleware function:", error);
          if (error instanceof UploadThingError)
            return error;
          return new UploadThingError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to run middleware.",
            cause: error
          });
        }
        if (metadata[UTFiles] && metadata[UTFiles].length !== files.length) {
          const msg = `Expected files override to have the same length as original files, got ${metadata[UTFiles].length} but expected ${files.length}`;
          logger.error(msg);
          return new UploadThingError({
            code: "BAD_REQUEST",
            message: "Files override must have the same length as files",
            cause: msg
          });
        }
        const filesWithCustomIds = files.map((file, idx) => {
          const theirs = metadata[UTFiles]?.[idx];
          if (theirs && theirs.size !== file.size) {
            logger.warn("File size mismatch. Reverting to original size");
          }
          return {
            name: theirs?.name ?? file.name,
            size: file.size,
            customId: theirs?.customId
          };
        });
        let parsedConfig;
        try {
          logger.debug("Parsing route config", uploadable._def.routerConfig);
          parsedConfig = fillInputRouteConfig(uploadable._def.routerConfig);
          logger.debug("Route config parsed successfully", parsedConfig);
        } catch (error) {
          logger.error("Invalid route config", error);
          return new UploadThingError({
            code: "BAD_REQUEST",
            message: "Invalid config.",
            cause: error
          });
        }
        try {
          logger.debug("Checking file count bounds", files);
          const { minCount, minCountHit, maxCount, maxCountHit, count, type } = fileCountBoundsCheck(files, parsedConfig);
          if (maxCountHit || minCountHit) {
            const errorMessage = maxCountHit ? `You uploaded ${count} file(s) of type '${type}', but the limit for that type is ${maxCount}` : `You uploaded ${count} file(s) of type '${type}', but the minimum for that type is ${minCount}`;
            logger.error(errorMessage);
            return new UploadThingError({
              code: "BAD_REQUEST",
              message: maxCountHit ? "Maximum file count not met" : "Minimum file count not met",
              cause: errorMessage
            });
          }
          logger.debug("File count bounds check passed");
        } catch (error) {
          logger.error("Invalid route config", error);
          return new UploadThingError({
            code: "BAD_REQUEST",
            message: "Invalid config.",
            cause: error
          });
        }
        const callbackUrl = resolveCallbackUrl({
          config,
          req,
          url,
          isDev
        });
        logger.debug("Retrieving presigned URLs from UploadThing. Callback URL is:", callbackUrl.href);
        const uploadthingApiResponse = await utFetch("/api/prepareUpload", {
          files: filesWithCustomIds,
          routeConfig: parsedConfig,
          metadata,
          callbackUrl: callbackUrl.origin + callbackUrl.pathname,
          callbackSlug: slug
        });
        const parsedResponse = await safeParseJSON(uploadthingApiResponse);
        if (!uploadthingApiResponse.ok || parsedResponse instanceof Error) {
          logger.error("Unable to get presigned URLs", parsedResponse);
          return new UploadThingError({
            code: "URL_GENERATION_FAILED",
            message: "Unable to get presigned urls",
            cause: parsedResponse
          });
        }
        logger.debug("UploadThing responded with:", parsedResponse);
        logger.debug("Sending presigned URLs to client");
        let promise = void 0;
        if (isDev) {
          promise = Promise.all(parsedResponse.map((file) => conditionalDevServer({
            fileKey: file.key,
            apiKey: preferredOrEnvSecret,
            fetch
          }).catch((error) => {
            logger.error("Err", error);
          })));
        }
        return {
          cleanup: promise,
          body: parsedResponse,
          status: 200
        };
      }
      case "multipart-complete": {
        const maybeReqBody = await safeParseJSON(req);
        if (maybeReqBody instanceof Error) {
          logger.error("Invalid request body", maybeReqBody);
          return new UploadThingError({
            code: "BAD_REQUEST",
            message: "Invalid request body",
            cause: maybeReqBody
          });
        }
        logger.debug("Handling multipart-complete request with input:", maybeReqBody);
        logger.debug("Notifying UploadThing that multipart upload is complete");
        const completeRes = await utFetch("/api/completeMultipart", {
          fileKey: maybeReqBody.fileKey,
          uploadId: maybeReqBody.uploadId,
          etags: maybeReqBody.etags
        });
        if (!completeRes.ok) {
          logger.error("Failed to notify UploadThing that multipart upload is complete");
          return new UploadThingError({
            code: "UPLOAD_FAILED",
            message: "Failed to complete multipart upload",
            cause: completeRes
          });
        }
        logger.debug("UploadThing responded with:", completeRes.status);
        return {
          status: 200,
          body: null
        };
      }
      case "failure": {
        const maybeReqBody = await safeParseJSON(req);
        if (maybeReqBody instanceof Error) {
          logger.error("Invalid request body", maybeReqBody);
          return new UploadThingError({
            code: "BAD_REQUEST",
            message: "Invalid request body",
            cause: maybeReqBody
          });
        }
        const { fileKey, uploadId } = maybeReqBody;
        logger.debug("Handling failure request with input:", maybeReqBody);
        logger.debug("Notifying UploadThing that upload failed");
        const uploadthingApiResponse = await utFetch("/api/failureCallback", {
          fileKey,
          uploadId
        });
        if (!uploadthingApiResponse.ok) {
          const parsedResponse = await safeParseJSON(uploadthingApiResponse);
          logger.error("Failed to mark upload as failed", parsedResponse);
          return new UploadThingError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Unable to mark upload as failed",
            cause: parsedResponse
          });
        }
        logger.debug("UploadThing responded with:", uploadthingApiResponse);
        logger.debug("Running 'onUploadError' callback");
        try {
          uploadable._def.onUploadError({
            error: new UploadThingError({
              code: "UPLOAD_FAILED",
              message: `Upload failed for ${fileKey}`
            }),
            fileKey
          });
        } catch (error) {
          logger.error("Failed to run onUploadError callback. You probably shouldn't be throwing errors in your callback.", error);
          return new UploadThingError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to run onUploadError callback",
            cause: error
          });
        }
        return {
          status: 200,
          body: null
        };
      }
      default: {
        return new UploadThingError({
          code: "BAD_REQUEST",
          message: `Invalid action type`
        });
      }
    }
  };
};
function resolveCallbackUrl(opts) {
  let callbackUrl = opts.url;
  if (opts.config?.callbackUrl) {
    callbackUrl = resolveMaybeUrlArg(opts.config.callbackUrl);
  } else if (w.env.UPLOADTHING_URL) {
    callbackUrl = resolveMaybeUrlArg(w.env.UPLOADTHING_URL);
  }
  if (opts.isDev || !callbackUrl.host.includes("localhost")) {
    return callbackUrl;
  }
  const headers = opts.req.headers;
  let parsedFromHeaders = headers.get("origin") ?? headers.get("referer") ?? headers.get("host") ?? headers.get("x-forwarded-host");
  if (parsedFromHeaders && !parsedFromHeaders.includes("http")) {
    parsedFromHeaders = (headers.get("x-forwarded-proto") ?? "https") + "://" + parsedFromHeaders;
  }
  if (!parsedFromHeaders || parsedFromHeaders.includes("localhost")) {
    logger.warn("You are using a localhost callback url in production which is not supported.", "Read more and learn how to fix it here: https://docs.uploadthing.com/faq#my-callback-runs-in-development-but-not-in-production");
    return callbackUrl;
  }
  return resolveMaybeUrlArg(parsedFromHeaders);
}
const buildPermissionsInfoHandler = (opts) => {
  return () => {
    const r = opts.router;
    const permissions = Object.keys(r).map((k) => {
      const route = r[k];
      const config = fillInputRouteConfig(route._def.routerConfig);
      return {
        slug: k,
        config
      };
    });
    return permissions;
  };
};
function incompatibleNodeGuard() {
  if (typeof w === "undefined")
    return;
  let major;
  let minor;
  const maybeNodeVersion = w.versions?.node?.split(".");
  if (maybeNodeVersion) {
    [major, minor] = maybeNodeVersion.map((v) => parseInt(v, 10));
  }
  const maybeNodePath = w.env?.NODE;
  if (!major && maybeNodePath) {
    const nodeVersion = /v(\d+)\.(\d+)\.(\d+)/.exec(maybeNodePath)?.[0];
    if (nodeVersion) {
      [major, minor] = nodeVersion.substring(1).split(".").map((v) => parseInt(v, 10));
    }
  }
  if (!major || !minor)
    return;
  if (major > 18)
    return;
  if (major === 18 && minor >= 13)
    return;
  logger.fatal(`YOU ARE USING A LEGACY (${major}.${minor}) NODE VERSION WHICH ISN'T OFFICIALLY SUPPORTED. PLEASE UPGRADE TO NODE ^18.13.`);
  w.exit?.(1);
}
function internalCreateBuilder(initDef = {}) {
  const _def = {
    // Default router config
    routerConfig: {
      image: {
        maxFileSize: "4MB"
      }
    },
    inputParser: {
      parse: () => void 0,
      _input: void 0,
      _output: void 0
    },
    middleware: () => ({}),
    onUploadError: () => ({}),
    errorFormatter: initDef.errorFormatter ?? defaultErrorFormatter,
    // Overload with properties passed in
    ...initDef
  };
  return {
    input(userParser) {
      return internalCreateBuilder({
        ..._def,
        inputParser: userParser
      });
    },
    middleware(userMiddleware) {
      return internalCreateBuilder({
        ..._def,
        middleware: userMiddleware
      });
    },
    onUploadComplete(userUploadComplete) {
      return {
        _def,
        resolver: userUploadComplete
      };
    },
    onUploadError(userOnUploadError) {
      return internalCreateBuilder({
        ..._def,
        onUploadError: userOnUploadError
      });
    }
  };
}
function createBuilder(opts) {
  return (input) => {
    return internalCreateBuilder({
      routerConfig: input,
      ...opts
    });
  };
}
const maybeParseResponseXML = (maybeXml) => {
  const codeMatch = maybeXml.match(/<Code>(.*?)<\/Code>/s);
  const messageMatch = maybeXml.match(/<Message>(.*?)<\/Message>/s);
  const code = codeMatch?.[1];
  const message = messageMatch?.[1];
  if (!code || !message)
    return null;
  return {
    code: s3CodeToUploadThingCode[code] ?? DEFAULT_ERROR_CODE,
    message
  };
};
const DEFAULT_ERROR_CODE = "UPLOAD_FAILED";
const s3CodeToUploadThingCode = {
  AccessDenied: "FORBIDDEN",
  EntityTooSmall: "TOO_SMALL",
  EntityTooLarge: "TOO_LARGE",
  ExpiredToken: "FORBIDDEN",
  IncorrectNumberOfFilesInPostRequest: "TOO_MANY_FILES",
  InternalError: "INTERNAL_SERVER_ERROR",
  KeyTooLongError: "KEY_TOO_LONG",
  MaxMessageLengthExceeded: "TOO_LARGE"
};
async function uploadPart(opts, retryCount = 0) {
  const s3Res = await opts.fetch(opts.url, {
    method: "PUT",
    body: opts.chunk,
    headers: {
      "Content-Type": opts.contentType,
      "Content-Disposition": contentDisposition(opts.contentDisposition, opts.fileName)
    }
  });
  if (s3Res.ok) {
    const etag = s3Res.headers.get("Etag");
    if (!etag) {
      throw new UploadThingError({
        code: "UPLOAD_FAILED",
        message: "Missing Etag header from uploaded part"
      });
    }
    return etag.replace(/"/g, "");
  }
  if (retryCount < opts.maxRetries) {
    const delay = 2 ** retryCount * 1e3;
    await new Promise((r) => setTimeout(r, delay));
    return uploadPart(opts, retryCount++);
  }
  await opts.fetch(generateUploadThingURL("/api/failureCallback"), {
    method: "POST",
    body: JSON.stringify({
      fileKey: opts.key
    }),
    headers: opts.utRequestHeaders
  });
  const text = await s3Res.text();
  const parsed = maybeParseResponseXML(text);
  if (parsed?.message) {
    throw new UploadThingError({
      code: "UPLOAD_FAILED",
      message: parsed.message
    });
  }
  throw new UploadThingError({
    code: "UPLOAD_FAILED",
    message: "Failed to upload file to storage provider",
    cause: s3Res
  });
}
function guardServerOnly() {
  if (typeof window !== "undefined") {
    throw new UploadThingError({
      code: "INTERNAL_SERVER_ERROR",
      message: "The `utapi` can only be used on the server."
    });
  }
}
function getApiKeyOrThrow(apiKey) {
  if (apiKey)
    return apiKey;
  if (w.env.UPLOADTHING_SECRET)
    return w.env.UPLOADTHING_SECRET;
  throw new UploadThingError({
    code: "MISSING_ENV",
    message: "Missing `UPLOADTHING_SECRET` env variable."
  });
}
const uploadFilesInternal = async (data, opts) => {
  const fileData = data.files.map((file) => ({
    name: file.name ?? "unnamed-blob",
    type: file.type,
    size: file.size,
    ..."customId" in file ? {
      customId: file.customId
    } : {}
  }));
  logger.debug("Getting presigned URLs for files", fileData);
  const res = await opts.fetch(generateUploadThingURL("/api/uploadFiles"), {
    method: "POST",
    headers: opts.utRequestHeaders,
    cache: "no-store",
    body: JSON.stringify({
      files: fileData,
      metadata: data.metadata,
      contentDisposition: data.contentDisposition,
      acl: data.acl
    })
  });
  if (!res.ok) {
    const error = await UploadThingError.fromResponse(res);
    logger.debug("Failed getting presigned URLs:", error);
    throw error;
  }
  const json = await res.json();
  logger.debug("Got presigned URLs:", json.data);
  logger.debug("Starting uploads...");
  const uploads = await Promise.allSettled(data.files.map(async (file, i) => {
    const presigned = json.data[i];
    if (!presigned) {
      logger.error("Failed to generate presigned URL for file:", file, presigned);
      throw new UploadThingError({
        code: "URL_GENERATION_FAILED",
        message: "Failed to generate presigned URL",
        cause: JSON.stringify(presigned)
      });
    }
    if ("urls" in presigned) {
      await uploadMultipart(file, presigned, {
        ...opts
      });
    } else {
      await uploadPresignedPost(file, presigned, {
        ...opts
      });
    }
    logger.debug("Polling for file data...");
    await pollForFileData({
      url: generateUploadThingURL(`/api/pollUpload/${presigned.key}`),
      apiKey: opts.utRequestHeaders["x-uploadthing-api-key"],
      sdkVersion: version,
      fetch: opts.fetch
    });
    logger.debug("Polling complete.");
    return {
      key: presigned.key,
      url: presigned.fileUrl,
      name: file.name,
      size: file.size,
      type: file.type,
      customId: "customId" in file ? file.customId ?? null : null
    };
  }));
  logger.debug("All uploads complete, aggregating results...");
  return uploads.map((upload) => {
    if (upload.status === "fulfilled") {
      const data2 = upload.value;
      return {
        data: data2,
        error: null
      };
    }
    const reason = upload.reason;
    const error = UploadThingError.toObject(reason);
    return {
      data: null,
      error
    };
  });
};
async function uploadMultipart(file, presigned, opts) {
  logger.debug("Uploading file", file.name, "with", presigned.urls.length, "chunks of size", presigned.chunkSize, "bytes each");
  const etags = await Promise.all(presigned.urls.map(async (url, index) => {
    const offset = presigned.chunkSize * index;
    const end = Math.min(offset + presigned.chunkSize, file.size);
    const chunk = file.slice(offset, end);
    const etag = await uploadPart({
      fetch: opts.fetch,
      url,
      chunk,
      contentDisposition: presigned.contentDisposition,
      contentType: file.type,
      fileName: file.name,
      maxRetries: 10,
      key: presigned.key,
      utRequestHeaders: opts.utRequestHeaders
    });
    logger.debug("Part", index + 1, "uploaded successfully:", etag);
    return {
      tag: etag,
      partNumber: index + 1
    };
  }));
  logger.debug("File", file.name, "uploaded successfully. Notifying UploadThing to complete multipart upload.");
  const completionRes = await opts.fetch(generateUploadThingURL("/api/completeMultipart"), {
    method: "POST",
    body: JSON.stringify({
      fileKey: presigned.key,
      uploadId: presigned.uploadId,
      etags
    }),
    headers: opts.utRequestHeaders
  });
  logger.debug("UploadThing responsed with status:", completionRes.status);
}
async function uploadPresignedPost(file, presigned, opts) {
  logger.debug("Uploading file", file.name, "using presigned POST URL");
  const formData = new FormData();
  Object.entries(presigned.fields).forEach(([k, v]) => formData.append(k, v));
  formData.append("file", file);
  const res = await opts.fetch(presigned.url, {
    method: "POST",
    body: formData,
    headers: new Headers({
      Accept: "application/xml"
    })
  });
  if (!res.ok) {
    const text = await res.text();
    logger.error("Failed to upload file:", text);
    throw new UploadThingError({
      code: "UPLOAD_FAILED",
      message: "Failed to upload file",
      cause: text
    });
  }
  logger.debug("File", file.name, "uploaded successfully");
}
function parseTimeToSeconds(time) {
  const match = time.toString().split(/(\d+)/).filter(Boolean);
  const num = Number(match[0]);
  const unit = (match[1] ?? "s").trim().slice(0, 1);
  const multiplier = {
    s: 1,
    m: 60,
    h: 3600,
    d: 86400
  }[unit];
  return num * multiplier;
}
class UTFile extends Blob {
  constructor(parts, name, options) {
    const optionsWithDefaults = {
      ...options,
      type: options?.type ?? (lookup(name) || void 0),
      lastModified: options?.lastModified ?? Date.now()
    };
    super(parts, optionsWithDefaults);
    this.name = name;
    this.customId = optionsWithDefaults.customId;
    this.lastModified = optionsWithDefaults.lastModified;
  }
}
class UTApi {
  constructor(opts) {
    this.deleteFiles = async (keys, opts2) => {
      guardServerOnly();
      const { keyType = this.defaultKeyType } = opts2 ?? {};
      return this.requestUploadThing("/api/deleteFile", keyType === "fileKey" ? {
        fileKeys: asArray(keys)
      } : {
        customIds: asArray(keys)
      }, "An unknown error occurred while deleting files.");
    };
    this.getFileUrls = async (keys, opts2) => {
      guardServerOnly();
      const { keyType = this.defaultKeyType } = opts2 ?? {};
      const json = await this.requestUploadThing("/api/getFileUrl", keyType === "fileKey" ? {
        fileKeys: asArray(keys)
      } : {
        customIds: asArray(keys)
      }, "An unknown error occurred while retrieving file URLs.");
      return json.data;
    };
    this.listFiles = async (opts2) => {
      guardServerOnly();
      const json = await this.requestUploadThing("/api/listFiles", {
        ...opts2
      }, "An unknown error occurred while listing files.");
      return json.files;
    };
    this.renameFiles = async (updates) => {
      guardServerOnly();
      return this.requestUploadThing("/api/renameFiles", {
        updates: asArray(updates)
      }, "An unknown error occurred while renaming files.");
    };
    this.renameFile = this.renameFiles;
    this.getUsageInfo = async () => {
      guardServerOnly();
      return this.requestUploadThing("/api/getUsageInfo", {}, "An unknown error occurred while getting usage info.");
    };
    this.getSignedURL = async (key, opts2) => {
      guardServerOnly();
      const expiresIn = opts2?.expiresIn ? parseTimeToSeconds(opts2.expiresIn) : void 0;
      const { keyType = this.defaultKeyType } = opts2 ?? {};
      if (opts2?.expiresIn && isNaN(expiresIn)) {
        throw new UploadThingError({
          code: "BAD_REQUEST",
          message: "expiresIn must be a valid time string, for example '1d', '2 days', or a number of seconds."
        });
      }
      if (expiresIn && expiresIn > 86400 * 7) {
        throw new UploadThingError({
          code: "BAD_REQUEST",
          message: "expiresIn must be less than 7 days (604800 seconds)."
        });
      }
      const json = await this.requestUploadThing("/api/requestFileAccess", keyType === "fileKey" ? {
        fileKey: key,
        expiresIn
      } : {
        customId: key,
        expiresIn
      }, "An unknown error occurred while retrieving presigned URLs.");
      return json.url;
    };
    this.updateACL = (keys, acl, opts2) => {
      guardServerOnly();
      const { keyType = this.defaultKeyType } = opts2 ?? {};
      const updates = asArray(keys).map((key) => {
        return keyType === "fileKey" ? {
          fileKey: key,
          acl
        } : {
          customId: key,
          acl
        };
      });
      return this.requestUploadThing("/api/updateACL", {
        updates
      }, "An unknown error occurred while updating ACLs.");
    };
    this.fetch = opts?.fetch ?? globalThis.fetch;
    this.apiKey = opts?.apiKey ?? w.env.UPLOADTHING_SECRET;
    this.defaultHeaders = {
      "Content-Type": "application/json",
      "x-uploadthing-api-key": this.apiKey,
      "x-uploadthing-version": version,
      "x-uploadthing-be-adapter": "server-sdk"
    };
    this.defaultKeyType = opts?.defaultKeyType ?? "fileKey";
    initLogger(opts?.logLevel);
    guardServerOnly();
    getApiKeyOrThrow(this.apiKey);
    if (!this.apiKey?.startsWith("sk_")) {
      throw new UploadThingError({
        code: "MISSING_ENV",
        message: "Invalid API key. API keys must start with `sk_`."
      });
    }
    incompatibleNodeGuard();
  }
  async requestUploadThing(pathname, body, fallbackErrorMessage) {
    const url = generateUploadThingURL(pathname);
    logger.debug("Requesting UploadThing:", {
      url,
      body,
      headers: this.defaultHeaders
    });
    const res = await this.fetch(url, {
      method: "POST",
      cache: "no-store",
      headers: this.defaultHeaders,
      body: JSON.stringify(body)
    });
    logger.debug("UploadThing responsed with status:", res.status);
    const json = await res.json();
    if (!res.ok || "error" in json) {
      logger.error("Error:", json);
      throw new UploadThingError({
        code: "INTERNAL_SERVER_ERROR",
        message: "error" in json && typeof json.error === "string" ? json.error : fallbackErrorMessage
      });
    }
    logger.debug("UploadThing response:", json);
    return json;
  }
  async uploadFiles(files, opts) {
    guardServerOnly();
    const uploads = await uploadFilesInternal({
      files: asArray(files),
      metadata: opts?.metadata ?? {},
      contentDisposition: opts?.contentDisposition ?? "inline",
      acl: opts?.acl
    }, {
      fetch: this.fetch,
      utRequestHeaders: this.defaultHeaders
    });
    const uploadFileResponse = Array.isArray(files) ? uploads : uploads[0];
    logger.debug("Finished uploading:", uploadFileResponse);
    return uploadFileResponse;
  }
  async uploadFilesFromUrl(urls, opts) {
    guardServerOnly();
    const formData = new FormData();
    formData.append("metadata", JSON.stringify(opts?.metadata ?? {}));
    const downloadErrors = {};
    const files = await Promise.all(asArray(urls).map(async (_url, index) => {
      let url = isObject$1(_url) ? _url.url : _url;
      if (typeof url === "string") {
        if (url.startsWith("data:")) {
          downloadErrors[index] = UploadThingError.toObject(new UploadThingError({
            code: "BAD_REQUEST",
            message: "Please use uploadFiles() for data URLs. uploadFilesFromUrl() is intended for use with remote URLs only."
          }));
          return void 0;
        }
        url = new URL(url);
      }
      const { name = url.pathname.split("/").pop() ?? "unknown-filename", customId = void 0 } = isObject$1(_url) ? _url : {};
      logger.debug("Downloading file:", url);
      const fileResponse = await this.fetch(url);
      if (!fileResponse.ok) {
        downloadErrors[index] = UploadThingError.toObject(new UploadThingError({
          code: "BAD_REQUEST",
          message: "Failed to download requested file.",
          cause: fileResponse
        }));
        return void 0;
      }
      logger.debug("Finished downloading file. Reading blob...");
      const blob = await fileResponse.blob();
      logger.debug("Finished reading blob.");
      return new UTFile([
        blob
      ], name, {
        customId
      });
    })).then((files2) => files2.filter((x) => x !== void 0));
    logger.debug("Uploading files:", files);
    const uploads = await uploadFilesInternal({
      files,
      metadata: opts?.metadata ?? {},
      contentDisposition: opts?.contentDisposition ?? "inline",
      acl: opts?.acl
    }, {
      fetch: this.fetch,
      utRequestHeaders: this.defaultHeaders
    });
    const responses = asArray(urls).map((_, index) => {
      if (downloadErrors[index]) {
        return {
          data: null,
          error: downloadErrors[index]
        };
      }
      return uploads.shift();
    });
    const uploadFileResponse = Array.isArray(urls) ? responses : responses[0];
    logger.debug("Finished uploading:", uploadFileResponse);
    return uploadFileResponse;
  }
}
const createUploadthing = (opts) => createBuilder(opts);
const INTERNAL_DO_NOT_USE_createRouteHandlerCore = (opts, adapter) => {
  initLogger(opts.config?.logLevel);
  incompatibleNodeGuard();
  const requestHandler = buildRequestHandler(opts, adapter);
  const getBuildPerms = buildPermissionsInfoHandler(opts);
  const POST = async (request) => {
    const req = request instanceof Request ? request : request.request;
    const response = await requestHandler({
      req,
      middlewareArgs: {
        req,
        res: void 0,
        event: void 0
      }
    });
    if (response instanceof UploadThingError) {
      return new Response(JSON.stringify(formatError(response, opts.router)), {
        status: getStatusCodeFromError(response),
        headers: {
          "x-uploadthing-version": version
        }
      });
    }
    if (response.status !== 200) {
      return new Response("An unknown error occurred", {
        status: 500,
        headers: {
          "x-uploadthing-version": version
        }
      });
    }
    const res = new Response(JSON.stringify(response.body), {
      status: response.status,
      headers: {
        "x-uploadthing-version": version
      }
    });
    res.cleanup = response.cleanup;
    return res;
  };
  const GET = (request) => {
    return new Response(JSON.stringify(getBuildPerms()), {
      status: 200,
      headers: {
        "x-uploadthing-version": version
      }
    });
  };
  return {
    GET,
    POST
  };
};
const createRouteHandler = (opts) => INTERNAL_DO_NOT_USE_createRouteHandlerCore(opts, "server");

const inputItem = z.object({
  id: z.string(),
  name: z.string()
});
const inputSchema$2 = inputItem.or(z.array(inputItem));
const outputItem = z.object({
  name: z.string()
});
const outputSchema$2 = outputItem.or(z.array(outputItem));
const deleteCVProcedure = publicProcedure.input(inputSchema$2).output(outputSchema$2).mutation(async ({ input }) => {
  try {
    const queries = [];
    const results = [];
    const utapi = new UTApi({ apiKey: "sk_live_41657a9ccbef098cf6fbd0e2bd8ee6171bcfa90d890a19945436aff2c7f4d6d0" });
    const inputs = Array.isArray(input) ? input : [input];
    for (const item of inputs) {
      const { id, name } = item;
      const attachments = await db.select().from(ATTACHMENTS).where(eq(ATTACHMENTS.cvId, id));
      await utapi.deleteFiles(attachments.map((a) => a.key));
      for (let a of attachments) {
        queries.push(db.delete(ATTACHMENTS).where(eq(ATTACHMENTS.id, a.id)));
      }
      queries.push(db.delete(CVS).where(eq(CVS.id, id)));
      results.push({ name });
    }
    await db.batch(queries);
    return Array.isArray(input) ? results : results[0];
  } catch (e) {
    console.log(e);
    throw new TRPCError({ code: "BAD_REQUEST" });
  }
});

const filterSchema = z.object({
  id: z.enum(["place", "position", "status"]),
  value: z.string().or(z.number())
});
const dateFilterSchema = z.object({
  type: z.literal("single"),
  date: z.string()
}).optional().or(
  z.object({
    type: z.literal("range"),
    from: z.string(),
    to: z.string()
  }).optional()
);
const sortSchema = z.object({
  id: z.enum(["name", "email", "createdAt"]),
  desc: z.boolean()
});
const inputSchema$1 = z.object({
  filters: z.array(filterSchema).optional(),
  dateFilters: dateFilterSchema,
  search: z.object({
    id: z.enum(["name", "email"]),
    value: z.string()
  }).optional(),
  sorting: z.array(sortSchema).max(1, { message: "Only one sorting" }),
  pagination: z.object({
    page: z.number().default(1),
    limit: z.number().default(10)
  })
});
const cvSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  status: z.number(),
  place: z.string(),
  position: z.string(),
  createdAt: z.string(),
  attachments: z.array(
    z.object({
      name: z.string(),
      url: z.string(),
      type: z.string()
    })
  )
});
const outputSchema$1 = z.object({
  cvs: z.array(cvSchema),
  pages: z.array(z.number())
});
const getAllCVSProcedure = publicProcedure.input(inputSchema$1).output(outputSchema$1).query(async ({ input }) => {
  const { pagination, sorting, filters, dateFilters, search } = input;
  console.log(input);
  let cvsQuery = db.select().from(CVS).$dynamic();
  let totalPagesQuery = db.select({ count: count() }).from(CVS).$dynamic();
  if (filters) {
    const filterConditions = [];
    filters.forEach((filter) => {
      const { id, value } = filter;
      switch (id) {
        case "place":
          filterConditions.push(like(CVS.place, `%${value}%`));
          break;
        case "position":
          filterConditions.push(like(CVS.position, `%${value}%`));
          break;
        case "status":
          filterConditions.push(like(CVS.status, `${value}`));
          break;
        default:
          throw new TRPCError({ code: "BAD_REQUEST" });
      }
    });
    if (filterConditions.length > 0) {
      const filterCondition = and(...filterConditions);
      cvsQuery = cvsQuery.where(filterCondition);
      totalPagesQuery = totalPagesQuery.where(filterCondition);
    }
  }
  if (dateFilters) {
    const { type } = dateFilters;
    switch (type) {
      case "single":
        const { date } = dateFilters;
        const singleDate = new Date(date);
        const nextDay = new Date(singleDate.getTime() + 864e5);
        cvsQuery = cvsQuery.where(
          and(gte(CVS.createdAt, singleDate), lt(CVS.createdAt, nextDay))
        );
        totalPagesQuery = totalPagesQuery.where(
          and(gte(CVS.createdAt, singleDate), lt(CVS.createdAt, nextDay))
        );
        break;
      case "range": {
        const { from, to } = dateFilters;
        const fromDate = new Date(from);
        const toDate = new Date(to);
        cvsQuery = cvsQuery.where(
          and(gte(CVS.createdAt, fromDate), lt(CVS.createdAt, toDate))
        );
        totalPagesQuery = totalPagesQuery.where(
          and(gte(CVS.createdAt, fromDate), lt(CVS.createdAt, toDate))
        );
        break;
      }
      default:
        throw new TRPCError({ code: "BAD_REQUEST" });
    }
  }
  if (search) {
    const { id, value } = search;
    switch (id) {
      case "name":
        cvsQuery = cvsQuery.where(like(CVS.name, `%${value}%`));
        totalPagesQuery = totalPagesQuery.where(like(CVS.name, `%${value}%`));
        break;
      case "email":
        cvsQuery = cvsQuery.where(like(CVS.email, `%${value}%`));
        totalPagesQuery = totalPagesQuery.where(
          like(CVS.email, `%${value}%`)
        );
        break;
      default:
        throw new TRPCError({ code: "BAD_REQUEST" });
    }
  }
  if (!sorting.length) {
    cvsQuery.orderBy(desc(CVS.createdAt));
    totalPagesQuery.orderBy(desc(CVS.createdAt));
  } else {
    const { id, desc: desc$1 } = sorting[0];
    switch (id) {
      case "name":
        cvsQuery.orderBy(desc$1 ? desc(CVS.name) : asc(CVS.name));
        totalPagesQuery.orderBy(desc$1 ? desc(CVS.name) : asc(CVS.name));
        break;
      case "email":
        cvsQuery.orderBy(desc$1 ? desc(CVS.email) : asc(CVS.email));
        totalPagesQuery.orderBy(desc$1 ? desc(CVS.email) : asc(CVS.email));
        break;
      case "createdAt":
        cvsQuery.orderBy(desc$1 ? desc(CVS.createdAt) : asc(CVS.createdAt));
        totalPagesQuery.orderBy(
          desc$1 ? desc(CVS.createdAt) : asc(CVS.createdAt)
        );
        break;
      default:
        throw new TRPCError({ code: "BAD_REQUEST" });
    }
  }
  const { page, limit } = pagination;
  const offset = (page - 1) * limit;
  cvsQuery.offset(offset).limit(pagination.limit);
  const cvsStartTime = Date.now();
  console.log(cvsQuery.toString());
  const cvsResults = await cvsQuery.all();
  const cvsEndTime = Date.now();
  console.log(`CVs query took ${cvsEndTime - cvsStartTime} ms`);
  const cvsIDs = cvsResults.map((cv) => cv.id);
  const attachmentsStartTime = Date.now();
  const attachmentsResults = cvsIDs.length > 0 ? await db.select().from(ATTACHMENTS).where(inArray(ATTACHMENTS.cvId, cvsIDs)) : [];
  const attachmentsEndTime = Date.now();
  console.log(
    `Attachments query took ${attachmentsEndTime - attachmentsStartTime} ms`
  );
  const cvs = cvsResults.map((cv) => {
    const attachments = attachmentsResults.filter(
      (attachment) => attachment.cvId === cv.id
    );
    return {
      id: cv.id,
      name: cv.name,
      email: cv.email,
      status: cv.status,
      place: cv.place,
      position: cv.position,
      createdAt: cv.createdAt.toISOString(),
      attachments: attachments.map((attachment) => ({
        name: attachment.name,
        url: attachment.url,
        type: attachment.type
      }))
    };
  });
  const rowsCount = (await totalPagesQuery.all())[0].count;
  const totalPages = Math.ceil(rowsCount / pagination.limit);
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  return {
    pages,
    cvs
  };
});

const outputSchema = z.object({
  storageInUse: z.number()
});
const getStorageInUseProcedure = publicProcedure.output(outputSchema).query(async () => {
  try {
    const sizeSum = await db.select({ value: sum(ATTACHMENTS.size) }).from(ATTACHMENTS);
    const sumString = sizeSum[0].value;
    if (!sumString)
      throw new TRPCError({ code: "BAD_REQUEST" });
    const storageInKB = Number(sumString);
    return {
      storageInUse: storageInKB
    };
  } catch (e) {
    throw new TRPCError({ code: "BAD_REQUEST" });
  }
});

function byteToBinary(byte) {
    return byte.toString(2).padStart(8, "0");
}
function bytesToBinary(bytes) {
    return [...bytes].map((val) => byteToBinary(val)).join("");
}
function bytesToInteger(bytes) {
    return parseInt(bytesToBinary(bytes), 2);
}

function generateRandomInteger(max) {
    if (max < 0 || !Number.isInteger(max)) {
        throw new Error("Argument 'max' must be an integer greater than or equal to 0");
    }
    const bitLength = (max - 1).toString(2).length;
    const shift = bitLength % 8;
    const bytes = new Uint8Array(Math.ceil(bitLength / 8));
    crypto.getRandomValues(bytes);
    // This zeroes bits that can be ignored to increase the chance `result` < `max`.
    // For example, if `max` can be represented with 10 bits, the leading 6 bits of the random 16 bits (2 bytes) can be ignored.
    if (shift !== 0) {
        bytes[0] &= (1 << shift) - 1;
    }
    let result = bytesToInteger(bytes);
    while (result >= max) {
        crypto.getRandomValues(bytes);
        if (shift !== 0) {
            bytes[0] &= (1 << shift) - 1;
        }
        result = bytesToInteger(bytes);
    }
    return result;
}
function generateRandomString(length, alphabet) {
    let result = "";
    for (let i = 0; i < length; i++) {
        result += alphabet[generateRandomInteger(alphabet.length)];
    }
    return result;
}
function alphabet(...patterns) {
    const patternSet = new Set(patterns);
    let result = "";
    for (const pattern of patternSet) {
        if (pattern === "a-z") {
            result += "abcdefghijklmnopqrstuvwxyz";
        }
        else if (pattern === "A-Z") {
            result += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        }
        else if (pattern === "0-9") {
            result += "0123456789";
        }
        else {
            result += pattern;
        }
    }
    return result;
}

function generateId(length) {
    return generateRandomString(length, alphabet("0-9", "a-z"));
}

const nameSchema = z.string().min(2, {
  message: "Nombre debe tener al menos 2 caracteres."
});
const emailSchema = z.string().email({
  message: "Email no es válido."
});
const placeSchema = z.enum([
  "Andújar",
  "Brenes",
  "Bollullos Par del Condado",
  "Cádiz",
  "Coria del Rio",
  "Estepa",
  "Gilena",
  "Hytasa",
  "La Carolina",
  "Lantejuela",
  "Moguer",
  "Osuna",
  "Sanlúcar de Barrameda",
  "Sevilla",
  "Utrera"
]);
const positionSchema = z.enum([
  "Carnicería",
  "Charcutería",
  "Pescadería",
  "Frutería",
  "Panadería",
  "Pastelería",
  "Cajero",
  "Reponedor",
  "Limpieza"
]);
const uploadedFileSchema = z.object({
  name: z.string(),
  url: z.string(),
  key: z.string(),
  size: z.number(),
  type: z.string()
});
const inputSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  place: placeSchema,
  position: positionSchema,
  attachments: z.array(uploadedFileSchema)
});
const insertCVProdedure = publicProcedure.input(inputSchema).mutation(async ({ input, ctx }) => {
  const queries = [];
  const cvId = generateId(15);
  queries.push(
    ctx.db.insert(ctx.CVS).values({
      id: cvId,
      name: input.name,
      email: input.email,
      place: input.place,
      position: input.position,
      createdAt: /* @__PURE__ */ new Date()
    })
  );
  for (const attachment of input.attachments) {
    queries.push(
      ctx.db.insert(ctx.ATTACHMENTS).values({
        name: attachment.name,
        url: attachment.url,
        size: attachment.size,
        type: attachment.type,
        key: attachment.key,
        cvId
      })
    );
  }
  await ctx.db.batch(queries);
});

const appRouter = t$1.router({
  insertCV: insertCVProdedure,
  getAllCVS: getAllCVSProcedure,
  changeStatus: changeStatusProcedure,
  delete: deleteCVProcedure,
  getStorageInUse: getStorageInUseProcedure
});

const ALL = ({ request }) => {
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req: request,
    router: appRouter,
    createContext,
    onError: (error) => {
      console.error("trpc error", error);
    }
  });
};

const _trpc_ = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
   __proto__: null,
   ALL
}, Symbol.toStringTag, { value: 'Module' }));

export { INTERNAL_DO_NOT_USE__fatalClientError as I, UploadThingError as U, _trpc_ as _, createRecursiveProxy as a, contentDisposition as b, createFlatProxy as c, semverLite as d, generatePermittedFileTypes as e, styleFieldToClassName as f, getCauseFromUnknown as g, styleFieldToCssObject as h, contentFieldToContent as i, generateMimeTypes as j, allowedContentTextLabelGenerator as k, generateClientDropzoneAccept as l, generateId as m, nameSchema as n, emailSchema as o, placeSchema as p, positionSchema as q, resolveMaybeUrlArg as r, safeParseJSON as s, createUploadthing as t, createRouteHandler as u, withExponentialBackoff as w, z };

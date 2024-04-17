globalThis.process ??= {}; globalThis.process.env ??= {};
import { R as React, r as reactExports, j as jsxRuntimeExports, t as twMerge, _ as __awaiter, a as __generator, b as __spreadArray, c as __read, $ as $8927f6f2acc4f386$export$250ffa63cdc0d034, d as _extends, e as cn, f as cva, g as $5e63c961fc1ce211$export$8c6ed5c666ac1360, h as $c512c27ab02ef895$export$50c7b4e9d9f19c1, i as $cf1ac5d9fe0e8206$export$722aac194ae923, k as $921a889cee6df7e8$export$99c2b779aa4e8b8b, l as $6ed0406888f73fc4$export$c7b2cbe3552a0d05, m as $5cb92bef7577960e$export$177fb62ff3ec1f22, n as $cf1ac5d9fe0e8206$export$7c6e2c02157bb7d2, o as $5e63c961fc1ce211$export$d9f1ccf0bdb05d45, p as $ea1ef594cf570d83$export$be92b6f5f03c0fe9, q as $1746a345f3d73bb7$export$f680877a34711e37, s as $71cd76cc60e0454e$export$6f32135080cb4c3, u as $cf1ac5d9fe0e8206$export$be92b6f5f03c0fe9, v as $cf1ac5d9fe0e8206$export$b688253958b8dfe7, w as $e42e1063c40fb3ef$export$b9ecd428b558ff10, P as Pause, B as Button, S as Square, x as SwitchCamera, D as Download, y as Plus, I as Input, z as Select, A as SelectTrigger, C as SelectValue, E as SelectContent, F as places, G as SelectItem, H as positions, J as trpcReact, K as ReloadIcon, Q as QueryClient, L as httpBatchLink, M as QueryClientProvider, N as $$Base } from './cvs_qudRXU8T.mjs';
import { r as resolveMaybeUrlArg, U as UploadThingError, w as withExponentialBackoff, b as contentDisposition, s as safeParseJSON, d as semverLite, e as generatePermittedFileTypes, f as styleFieldToClassName, h as styleFieldToCssObject, i as contentFieldToContent, I as INTERNAL_DO_NOT_USE__fatalClientError, j as generateMimeTypes, k as allowedContentTextLabelGenerator, l as generateClientDropzoneAccept, m as generateId, z, n as nameSchema, o as emailSchema, p as placeSchema, q as positionSchema } from './_trpc__GIzfMcGy.mjs';
/* empty css                        */
import { b as createAstro, d as createComponent, e as renderTemplate, k as renderComponent } from '../astro_BO0wYrHs.mjs';

var version$1 = "6.9.0";

const maybeParseResponseXML = (maybeXml)=>{
    const codeMatch = maybeXml.match(/<Code>(.*?)<\/Code>/s);
    const messageMatch = maybeXml.match(/<Message>(.*?)<\/Message>/s);
    const code = codeMatch?.[1];
    const message = messageMatch?.[1];
    if (!code || !message) return null;
    return {
        code: s3CodeToUploadThingCode[code] ?? DEFAULT_ERROR_CODE,
        message
    };
};
/**
 * Map S3 error codes to UploadThing error codes
 *
 * This is a subset of the S3 error codes, based on what seemed most likely to
 * occur in uploadthing. For a full list of S3 error codes, see:
 * https://docs.aws.amazon.com/AmazonS3/latest/API/ErrorResponses.html
 */ const DEFAULT_ERROR_CODE = "UPLOAD_FAILED";
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

/**
 * Used by client uploads where progress is needed.
 * Uses XMLHttpRequest.
 */ async function uploadPartWithProgress(opts, retryCount = 0) {
    return new Promise((resolve, reject)=>{
        const xhr = new XMLHttpRequest();
        xhr.open("PUT", opts.url, true);
        xhr.setRequestHeader("Content-Type", opts.fileType);
        xhr.setRequestHeader("Content-Disposition", contentDisposition(opts.contentDisposition, opts.fileName));
        xhr.onload = async ()=>{
            if (xhr.status >= 200 && xhr.status < 300) {
                const etag = xhr.getResponseHeader("Etag");
                etag ? resolve(etag) : reject("NO ETAG");
            } else if (retryCount < opts.maxRetries) {
                // Add a delay before retrying (exponential backoff can be used)
                const delay = Math.pow(2, retryCount) * 1000;
                await new Promise((res)=>setTimeout(res, delay));
                resolve(await uploadPartWithProgress(opts, retryCount + 1)); // Retry the request
            } else {
                reject("Max retries exceeded");
            }
        };
        let lastProgress = 0;
        xhr.onerror = async ()=>{
            lastProgress = 0;
            if (retryCount < opts.maxRetries) {
                // Add a delay before retrying (exponential backoff can be used)
                const delay = Math.pow(2, retryCount) * 100;
                await new Promise((res)=>setTimeout(res, delay));
                await uploadPartWithProgress(opts, retryCount + 1); // Retry the request
            } else {
                reject("Max retries exceeded");
            }
        };
        xhr.upload.onprogress = (e)=>{
            const delta = e.loaded - lastProgress;
            lastProgress += delta;
            opts.onProgress(delta);
        };
        xhr.send(opts.chunk);
    });
}

const createAPIRequestUrl = (config)=>{
    const url = new URL(config.url);
    const queryParams = new URLSearchParams(url.search);
    queryParams.set("actionType", config.actionType);
    queryParams.set("slug", config.slug);
    url.search = queryParams.toString();
    return url;
};
/**
 * Creates a "client" for reporting events to the UploadThing server via the user's API endpoint.
 * Events are handled in "./handler.ts starting at L200"
 */ const createUTReporter = (cfg)=>{
    return async (type, payload)=>{
        const url = createAPIRequestUrl({
            url: cfg.url,
            slug: cfg.endpoint,
            actionType: type
        });
        let customHeaders = typeof cfg.headers === "function" ? cfg.headers() : cfg.headers;
        if (customHeaders instanceof Promise) customHeaders = await customHeaders;
        const response = await cfg.fetch(url, {
            method: "POST",
            body: JSON.stringify(payload),
            headers: {
                "Content-Type": "application/json",
                "x-uploadthing-package": cfg.package,
                "x-uploadthing-version": version$1,
                ...customHeaders
            }
        });
        switch(type){
            case "failure":
                {
                    // why isn't this narrowed automatically?
                    const p = payload;
                    const parsed = maybeParseResponseXML(p.s3Error ?? "");
                    if (parsed?.message) {
                        throw new UploadThingError({
                            code: parsed.code,
                            message: parsed.message
                        });
                    } else {
                        throw new UploadThingError({
                            code: "UPLOAD_FAILED",
                            message: `Failed to upload file ${p.fileName} to S3`,
                            cause: p.s3Error
                        });
                    }
                }
        }
        if (!response.ok) {
            const error = await UploadThingError.fromResponse(response);
            throw error;
        }
        const jsonOrError = await safeParseJSON(response);
        if (jsonOrError instanceof Error) {
            throw new UploadThingError({
                code: "BAD_REQUEST",
                message: jsonOrError.message,
                cause: response
            });
        }
        return jsonOrError;
    };
};

// Don't want to ship our logger to the client, keep size down
const version = version$1;
const uploadFilesInternal = async (endpoint, opts)=>{
    // Fine to use global fetch in browser
    const fetch = globalThis.fetch.bind(globalThis);
    const reportEventToUT = createUTReporter({
        endpoint: String(endpoint),
        url: opts.url,
        package: opts.package,
        fetch,
        headers: opts.headers
    });
    // Get presigned URL for S3 upload
    const s3ConnectionRes = await reportEventToUT("upload", {
        input: "input" in opts ? opts.input : null,
        files: opts.files.map((f)=>({
                name: f.name,
                size: f.size,
                type: f.type
            }))
    });
    if (!s3ConnectionRes || !Array.isArray(s3ConnectionRes)) {
        throw new UploadThingError({
            code: "BAD_REQUEST",
            message: "No URL. How did you even get here?",
            cause: s3ConnectionRes
        });
    }
    const fileUploadPromises = s3ConnectionRes.map(async (presigned)=>{
        const file = opts.files.find((f)=>f.name === presigned.fileName);
        if (!file) {
            console.error("No file found for presigned URL", presigned);
            throw new UploadThingError({
                code: "NOT_FOUND",
                message: "No file found for presigned URL",
                cause: `Expected file with name ${presigned.fileName} but got '${opts.files.join(",")}'`
            });
        }
        opts.onUploadBegin?.({
            file: file.name
        });
        if ("urls" in presigned) {
            await uploadMultipart(file, presigned, {
                reportEventToUT,
                ...opts
            });
            // wait a bit as it's unsreasonable to expect the server to be done by now
            await new Promise((r)=>setTimeout(r, 750));
        } else {
            await uploadPresignedPost(file, presigned, {
                reportEventToUT,
                ...opts
            });
        }
        let serverData = null;
        if (!opts.skipPolling) {
            serverData = await withExponentialBackoff(async ()=>{
                const res = await fetch(presigned.pollingUrl, {
                    headers: {
                        authorization: presigned.pollingJwt
                    }
                }).then((r)=>r.json());
                // eslint-disable-next-line @typescript-eslint/no-unsafe-return
                return res.status === "done" ? res.callbackData : undefined;
            });
        }
        return {
            name: file.name,
            size: file.size,
            type: file.type,
            key: presigned.key,
            url: "https://utfs.io/f/" + presigned.key,
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            serverData: serverData,
            customId: presigned.customId
        };
    });
    return Promise.all(fileUploadPromises);
};
const genUploader = (initOpts)=>{
    return (endpoint, opts)=>// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        uploadFilesInternal(endpoint, {
            ...opts,
            url: resolveMaybeUrlArg(initOpts?.url),
            package: initOpts.package
        });
};
async function uploadMultipart(file, presigned, opts) {
    let etags;
    let uploadedBytes = 0;
    try {
        etags = await Promise.all(presigned.urls.map(async (url, index)=>{
            const offset = presigned.chunkSize * index;
            const end = Math.min(offset + presigned.chunkSize, file.size);
            const chunk = file.slice(offset, end);
            const etag = await uploadPartWithProgress({
                url,
                chunk: chunk,
                contentDisposition: presigned.contentDisposition,
                fileType: file.type,
                fileName: file.name,
                maxRetries: 10,
                onProgress: (delta)=>{
                    uploadedBytes += delta;
                    const percent = uploadedBytes / file.size * 100;
                    opts.onUploadProgress?.({
                        file: file.name,
                        progress: percent
                    });
                }
            });
            return {
                tag: etag,
                partNumber: index + 1
            };
        }));
    } catch (error) {
        await opts.reportEventToUT("failure", {
            fileKey: presigned.key,
            uploadId: presigned.uploadId,
            fileName: file.name,
            s3Error: error.toString()
        });
        throw "unreachable"; // failure event will throw for us
    }
    // Tell the server that the upload is complete
    await opts.reportEventToUT("multipart-complete", {
        uploadId: presigned.uploadId,
        fileKey: presigned.key,
        etags
    }).catch((res)=>{
        console.log("Failed to alert UT of upload completion");
        throw new UploadThingError({
            code: "UPLOAD_FAILED",
            message: "Failed to alert UT of upload completion",
            cause: res
        });
    });
}
async function uploadPresignedPost(file, presigned, opts) {
    const formData = new FormData();
    Object.entries(presigned.fields).forEach(([k, v])=>formData.append(k, v));
    formData.append("file", file); // File data **MUST GO LAST**
    const response = await new Promise((resolve, reject)=>{
        const xhr = new XMLHttpRequest();
        xhr.open("POST", presigned.url);
        xhr.setRequestHeader("Accept", "application/xml");
        xhr.upload.onprogress = (p)=>{
            opts.onUploadProgress?.({
                file: file.name,
                progress: p.loaded / p.total * 100
            });
        };
        xhr.onload = ()=>resolve({
                status: xhr.status
            });
        xhr.onerror = (e)=>reject(e);
        xhr.send(formData);
    }).catch(async (error)=>{
        await opts.reportEventToUT("failure", {
            fileKey: presigned.key,
            uploadId: null,
            fileName: file.name,
            s3Error: error.toString()
        });
        throw "unreachable"; // failure event will throw for us
    });
    if (response.status > 299 || response.status < 200) {
        await opts.reportEventToUT("failure", {
            fileKey: presigned.key,
            uploadId: null,
            fileName: file.name
        });
    }
}

var peerDependencies = {
	next: "*",
	react: "^17.0.2 || ^18.0.0",
	uploadthing: "^6.5.1"
};

// Ripped from https://github.com/scottrippey/react-use-event-hook
const noop$1 = ()=>void 0;
/**
 * Suppress the warning when using useLayoutEffect with SSR. (https://reactjs.org/link/uselayouteffect-ssr)
 * Make use of useInsertionEffect if available.
 */ const useInsertionEffect = typeof window !== "undefined" ? React.useInsertionEffect || React.useLayoutEffect : noop$1;
/**
 * Similar to useCallback, with a few subtle differences:
 * - The returned function is a stable reference, and will always be the same between renders
 * - No dependency lists required
 * - Properties or state accessed within the callback will always be "current"
 */ function useEvent(callback) {
    // Keep track of the latest callback:
    const latestRef = React.useRef(// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    useEvent_shouldNotBeInvokedBeforeMount);
    useInsertionEffect(()=>{
        latestRef.current = callback;
    }, [
        callback
    ]);
    // Create a stable callback that always calls the latest callback:
    // using useRef instead of useCallback avoids creating and empty array on every render
    const stableRef = React.useRef();
    if (!stableRef.current) {
        stableRef.current = function() {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-return, prefer-rest-params, @typescript-eslint/no-unsafe-argument
            return latestRef.current.apply(this, arguments);
        };
    }
    return stableRef.current;
}
/**
 * Render methods should be pure, especially when concurrency is used,
 * so we will throw this error if the callback is called while rendering.
 */ function useEvent_shouldNotBeInvokedBeforeMount() {
    throw new Error("INVALID_USEEVENT_INVOCATION: the callback from useEvent cannot be invoked before the component has mounted.");
}

// Ripped from https://usehooks-ts.com/react-hook/use-fetch
function useFetch(url, options) {
    const cache = reactExports.useRef({});
    // Used to prevent state update if the component is unmounted
    const cancelRequest = reactExports.useRef(false);
    const initialState = {
        error: undefined,
        data: undefined
    };
    // Keep state logic separated
    const fetchReducer = (state, action)=>{
        switch(action.type){
            case "loading":
                return {
                    ...initialState
                };
            case "fetched":
                return {
                    ...initialState,
                    data: action.payload
                };
            case "error":
                return {
                    ...initialState,
                    error: action.payload
                };
            default:
                return state;
        }
    };
    const [state, dispatch] = reactExports.useReducer(fetchReducer, initialState);
    reactExports.useEffect(()=>{
        // Do nothing if the url is not given
        if (!url) return;
        cancelRequest.current = false;
        const fetchData = async ()=>{
            dispatch({
                type: "loading"
            });
            // If a cache exists for this url, return it
            if (cache.current[url]) {
                dispatch({
                    type: "fetched",
                    payload: cache.current[url]
                });
                return;
            }
            try {
                const response = await fetch(url, options);
                if (!response.ok) {
                    throw new Error(response.statusText);
                }
                const dataOrError = await safeParseJSON(response);
                if (dataOrError instanceof Error) {
                    throw dataOrError;
                }
                cache.current[url] = dataOrError;
                if (cancelRequest.current) return;
                dispatch({
                    type: "fetched",
                    payload: dataOrError
                });
            } catch (error) {
                if (cancelRequest.current) return;
                dispatch({
                    type: "error",
                    payload: error
                });
            }
        };
        void fetchData();
        // Use the cleanup function for avoiding a possibly...
        // ...state update after the component was unmounted
        return ()=>{
            cancelRequest.current = true;
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        url
    ]);
    return state;
}

const useEndpointMetadata = (url, endpoint)=>{
    const maybeServerData = globalThis.__UPLOADTHING;
    const { data } = useFetch(// Don't fetch if we already have the data
    maybeServerData ? undefined : url.href);
    return (maybeServerData ?? data)?.find((x)=>x.slug === endpoint);
};
const INTERNAL_uploadthingHookGen = (initOpts)=>{
    if (!semverLite(peerDependencies.uploadthing, version)) {
        console.error(`!!!WARNING::: @uploadthing/react requires "uploadthing@${peerDependencies.uploadthing}", but version "${version}" is installed`);
    }
    const uploadFiles = genUploader({
        url: initOpts.url,
        package: "@uploadthing/react"
    });
    const useUploadThing = (endpoint, opts)=>{
        const [isUploading, setUploading] = reactExports.useState(false);
        const uploadProgress = reactExports.useRef(0);
        const fileProgress = reactExports.useRef(new Map());
        const permittedFileInfo = useEndpointMetadata(initOpts.url, endpoint);
        const startUpload = useEvent(async (...args)=>{
            const files = await opts?.onBeforeUploadBegin?.(args[0]) ?? args[0];
            const input = args[1];
            setUploading(true);
            opts?.onUploadProgress?.(0);
            try {
                const res = await uploadFiles(endpoint, {
                    headers: opts?.headers,
                    files,
                    skipPolling: opts?.skipPolling,
                    onUploadProgress: (progress)=>{
                        if (!opts?.onUploadProgress) return;
                        fileProgress.current.set(progress.file, progress.progress);
                        let sum = 0;
                        fileProgress.current.forEach((p)=>{
                            sum += p;
                        });
                        const averageProgress = Math.floor(sum / fileProgress.current.size / 10) * 10;
                        if (averageProgress !== uploadProgress.current) {
                            opts?.onUploadProgress?.(averageProgress);
                            uploadProgress.current = averageProgress;
                        }
                    },
                    onUploadBegin ({ file }) {
                        if (!opts?.onUploadBegin) return;
                        opts.onUploadBegin(file);
                    },
                    // @ts-expect-error - input may not be defined on the type
                    input
                });
                opts?.onClientUploadComplete?.(res);
                return res;
            } catch (e) {
                let error;
                if (e instanceof UploadThingError) {
                    error = e;
                } else {
                    error = INTERNAL_DO_NOT_USE__fatalClientError(e);
                    console.error("Something went wrong. Please contact UploadThing and provide the following cause:", error.cause instanceof Error ? error.cause.toString() : error.cause);
                }
                opts?.onUploadError?.(error);
            } finally{
                setUploading(false);
                fileProgress.current = new Map();
                uploadProgress.current = 0;
            }
        });
        return {
            startUpload,
            isUploading,
            permittedFileInfo
        };
    };
    return useUploadThing;
};
const generateReactHelpers = (initOpts)=>{
    const url = resolveMaybeUrlArg(initOpts?.url);
    return {
        useUploadThing: INTERNAL_uploadthingHookGen({
            url
        }),
        uploadFiles: genUploader({
            url,
            package: "@uploadthing/react"
        })
    };
};

function getFilesFromClipboardEvent(event) {
    const dataTransferItems = event.clipboardData?.items;
    if (!dataTransferItems) return;
    const files = Array.from(dataTransferItems).reduce((acc, curr)=>{
        const f = curr.getAsFile();
        return f ? [
            ...acc,
            f
        ] : acc;
    }, []);
    return files;
}
function Spinner() {
    return /*#__PURE__*/ jsxRuntimeExports.jsx("svg", {
        className: "z-10 block h-5 w-5 animate-spin align-middle text-white",
        xmlns: "http://www.w3.org/2000/svg",
        fill: "none",
        viewBox: "0 0 576 512",
        children: /*#__PURE__*/ jsxRuntimeExports.jsx("path", {
            fill: "currentColor",
            d: "M256 32C256 14.33 270.3 0 288 0C429.4 0 544 114.6 544 256C544 302.6 531.5 346.4 509.7 384C500.9 399.3 481.3 404.6 465.1 395.7C450.7 386.9 445.5 367.3 454.3 351.1C470.6 323.8 480 291 480 255.1C480 149.1 394 63.1 288 63.1C270.3 63.1 256 49.67 256 31.1V32z"
        })
    });
}
const progressWidths = {
    0: "after:w-0",
    10: "after:w-[10%]",
    20: "after:w-[20%]",
    30: "after:w-[30%]",
    40: "after:w-[40%]",
    50: "after:w-[50%]",
    60: "after:w-[60%]",
    70: "after:w-[70%]",
    80: "after:w-[80%]",
    90: "after:w-[90%]",
    100: "after:w-[100%]"
};

/**
 * @example
 * <UploadButton<OurFileRouter>
 *   endpoint="someEndpoint"
 *   onUploadComplete={(res) => console.log(res)}
 *   onUploadError={(err) => console.log(err)}
 * />
 */ function UploadButton(props) {
    // Cast back to UploadthingComponentProps<TRouter> to get the correct type
    // since the ErrorMessage messes it up otherwise
    const $props = props;
    const { mode = "auto", appendOnPaste = false } = $props.config ?? {};
    const useUploadThing = INTERNAL_uploadthingHookGen({
        url: resolveMaybeUrlArg($props.url)
    });
    const fileInputRef = reactExports.useRef(null);
    const labelRef = reactExports.useRef(null);
    const [uploadProgressState, setUploadProgress] = reactExports.useState($props.__internal_upload_progress ?? 0);
    const [files, setFiles] = reactExports.useState([]);
    const [isManualTriggerDisplayed, setIsManualTriggerDisplayed] = reactExports.useState(false);
    const uploadProgress = $props.__internal_upload_progress ?? uploadProgressState;
    const { startUpload, isUploading, permittedFileInfo } = useUploadThing($props.endpoint, {
        headers: $props.headers,
        skipPolling: !$props?.onClientUploadComplete ? true : $props?.skipPolling,
        onClientUploadComplete: (res)=>{
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
            setIsManualTriggerDisplayed(false);
            setFiles([]);
            $props.onClientUploadComplete?.(res);
            setUploadProgress(0);
        },
        onUploadProgress: (p)=>{
            setUploadProgress(p);
            $props.onUploadProgress?.(p);
        },
        onUploadError: $props.onUploadError,
        onUploadBegin: $props.onUploadBegin,
        onBeforeUploadBegin: $props.onBeforeUploadBegin
    });
    const { fileTypes, multiple } = generatePermittedFileTypes(permittedFileInfo?.config);
    const ready = $props.__internal_ready ?? ($props.__internal_state === "ready" || fileTypes.length > 0);
    reactExports.useEffect(()=>{
        const handlePaste = (event)=>{
            if (!appendOnPaste) return;
            if (document.activeElement !== labelRef.current) return;
            const pastedFiles = getFilesFromClipboardEvent(event);
            if (!pastedFiles) return;
            setFiles((prev)=>[
                    ...prev,
                    ...pastedFiles
                ]);
            if (mode === "auto") {
                const input = "input" in $props ? $props.input : undefined;
                void startUpload(files, input);
            }
        };
        window.addEventListener("paste", handlePaste);
        return ()=>{
            window.removeEventListener("paste", handlePaste);
        };
    }, [
        startUpload,
        appendOnPaste,
        $props,
        files,
        mode,
        fileTypes
    ]);
    const getUploadButtonText = (fileTypes)=>{
        if (isManualTriggerDisplayed) return `Upload ${files.length} file${files.length === 1 ? "" : "s"}`;
        if (fileTypes.length === 0) return "Loading...";
        return `Choose File${multiple ? `(s)` : ``}`;
    };
    const getUploadButtonContents = (fileTypes)=>{
        if (state !== "uploading") {
            return getUploadButtonText(fileTypes);
        }
        if (uploadProgress === 100) {
            return /*#__PURE__*/ jsxRuntimeExports.jsx(Spinner, {});
        }
        return /*#__PURE__*/ jsxRuntimeExports.jsxs("span", {
            className: "z-50",
            children: [
                uploadProgress,
                "%"
            ]
        });
    };
    const getInputProps = ()=>({
            type: "file",
            ref: fileInputRef,
            multiple,
            accept: generateMimeTypes(fileTypes ?? [])?.join(", "),
            onChange: (e)=>{
                if (!e.target.files) return;
                const selectedFiles = Array.from(e.target.files);
                if (mode === "manual") {
                    setFiles(selectedFiles);
                    setIsManualTriggerDisplayed(true);
                    return;
                }
                const input = "input" in $props ? $props.input : undefined;
                void startUpload(selectedFiles, input);
            },
            disabled: $props.__internal_button_disabled ?? !ready,
            ...!($props.__internal_button_disabled ?? !ready) ? {
                tabIndex: 0
            } : {}
        });
    const styleFieldArg = {
        ready: ready,
        isUploading: $props.__internal_state === "uploading" || isUploading,
        uploadProgress,
        fileTypes
    };
    const state = (()=>{
        if ($props.__internal_state) return $props.__internal_state;
        if (!ready) return "readying";
        if (ready && !isUploading) return "ready";
        return "uploading";
    })();
    const renderClearButton = ()=>/*#__PURE__*/ jsxRuntimeExports.jsx("button", {
            onClick: ()=>{
                setFiles([]);
                setIsManualTriggerDisplayed(false);
                if (fileInputRef.current) {
                    fileInputRef.current.value = "";
                }
            },
            className: twMerge("h-[1.25rem] cursor-pointer rounded border-none bg-transparent text-gray-500 transition-colors hover:bg-slate-200 hover:text-gray-600", styleFieldToClassName($props.appearance?.clearBtn, styleFieldArg)),
            style: styleFieldToCssObject($props.appearance?.clearBtn, styleFieldArg),
            "data-state": state,
            "data-ut-element": "clear-btn",
            children: contentFieldToContent($props.content?.clearBtn, styleFieldArg) ?? "Clear"
        });
    const renderAllowedContent = ()=>/*#__PURE__*/ jsxRuntimeExports.jsx("div", {
            className: twMerge("h-[1.25rem]  text-xs leading-5 text-gray-600", styleFieldToClassName($props.appearance?.allowedContent, styleFieldArg)),
            style: styleFieldToCssObject($props.appearance?.allowedContent, styleFieldArg),
            "data-state": state,
            "data-ut-element": "allowed-content",
            children: contentFieldToContent($props.content?.allowedContent, styleFieldArg) ?? allowedContentTextLabelGenerator(permittedFileInfo?.config)
        });
    return /*#__PURE__*/ jsxRuntimeExports.jsxs("div", {
        className: twMerge("flex flex-col items-center justify-center gap-1", $props.className, styleFieldToClassName($props.appearance?.container, styleFieldArg)),
        style: styleFieldToCssObject($props.appearance?.container, styleFieldArg),
        "data-state": state,
        children: [
            /*#__PURE__*/ jsxRuntimeExports.jsxs("label", {
                className: twMerge("relative flex h-10 w-36 cursor-pointer items-center justify-center overflow-hidden rounded-md text-white after:transition-[width] after:duration-500 focus-within:ring-2 focus-within:ring-blue-600 focus-within:ring-offset-2", state === "readying" && "cursor-not-allowed bg-blue-400", state === "uploading" && `bg-blue-400 after:absolute after:left-0 after:h-full after:bg-blue-600 after:content-[''] ${progressWidths[uploadProgress]}`, state === "ready" && "bg-blue-600", styleFieldToClassName($props.appearance?.button, styleFieldArg)),
                style: styleFieldToCssObject($props.appearance?.button, styleFieldArg),
                "data-state": state,
                "data-ut-element": "button",
                ref: labelRef,
                onClick: (e)=>{
                    if (isManualTriggerDisplayed) {
                        e.preventDefault();
                        e.stopPropagation();
                        const input = "input" in $props ? $props.input : undefined;
                        void startUpload(files, input);
                    }
                },
                children: [
                    /*#__PURE__*/ jsxRuntimeExports.jsx("input", {
                        ...getInputProps(),
                        className: "sr-only"
                    }),
                    contentFieldToContent($props.content?.button, styleFieldArg) ?? getUploadButtonContents(fileTypes)
                ]
            }),
            mode === "manual" && files.length > 0 ? renderClearButton() : renderAllowedContent()
        ]
    });
}

var COMMON_MIME_TYPES = new Map([
    // https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types/Common_types
    ['aac', 'audio/aac'],
    ['abw', 'application/x-abiword'],
    ['arc', 'application/x-freearc'],
    ['avif', 'image/avif'],
    ['avi', 'video/x-msvideo'],
    ['azw', 'application/vnd.amazon.ebook'],
    ['bin', 'application/octet-stream'],
    ['bmp', 'image/bmp'],
    ['bz', 'application/x-bzip'],
    ['bz2', 'application/x-bzip2'],
    ['cda', 'application/x-cdf'],
    ['csh', 'application/x-csh'],
    ['css', 'text/css'],
    ['csv', 'text/csv'],
    ['doc', 'application/msword'],
    ['docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    ['eot', 'application/vnd.ms-fontobject'],
    ['epub', 'application/epub+zip'],
    ['gz', 'application/gzip'],
    ['gif', 'image/gif'],
    ['heic', 'image/heic'],
    ['heif', 'image/heif'],
    ['htm', 'text/html'],
    ['html', 'text/html'],
    ['ico', 'image/vnd.microsoft.icon'],
    ['ics', 'text/calendar'],
    ['jar', 'application/java-archive'],
    ['jpeg', 'image/jpeg'],
    ['jpg', 'image/jpeg'],
    ['js', 'text/javascript'],
    ['json', 'application/json'],
    ['jsonld', 'application/ld+json'],
    ['mid', 'audio/midi'],
    ['midi', 'audio/midi'],
    ['mjs', 'text/javascript'],
    ['mp3', 'audio/mpeg'],
    ['mp4', 'video/mp4'],
    ['mpeg', 'video/mpeg'],
    ['mpkg', 'application/vnd.apple.installer+xml'],
    ['odp', 'application/vnd.oasis.opendocument.presentation'],
    ['ods', 'application/vnd.oasis.opendocument.spreadsheet'],
    ['odt', 'application/vnd.oasis.opendocument.text'],
    ['oga', 'audio/ogg'],
    ['ogv', 'video/ogg'],
    ['ogx', 'application/ogg'],
    ['opus', 'audio/opus'],
    ['otf', 'font/otf'],
    ['png', 'image/png'],
    ['pdf', 'application/pdf'],
    ['php', 'application/x-httpd-php'],
    ['ppt', 'application/vnd.ms-powerpoint'],
    ['pptx', 'application/vnd.openxmlformats-officedocument.presentationml.presentation'],
    ['rar', 'application/vnd.rar'],
    ['rtf', 'application/rtf'],
    ['sh', 'application/x-sh'],
    ['svg', 'image/svg+xml'],
    ['swf', 'application/x-shockwave-flash'],
    ['tar', 'application/x-tar'],
    ['tif', 'image/tiff'],
    ['tiff', 'image/tiff'],
    ['ts', 'video/mp2t'],
    ['ttf', 'font/ttf'],
    ['txt', 'text/plain'],
    ['vsd', 'application/vnd.visio'],
    ['wav', 'audio/wav'],
    ['weba', 'audio/webm'],
    ['webm', 'video/webm'],
    ['webp', 'image/webp'],
    ['woff', 'font/woff'],
    ['woff2', 'font/woff2'],
    ['xhtml', 'application/xhtml+xml'],
    ['xls', 'application/vnd.ms-excel'],
    ['xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
    ['xml', 'application/xml'],
    ['xul', 'application/vnd.mozilla.xul+xml'],
    ['zip', 'application/zip'],
    ['7z', 'application/x-7z-compressed'],
    // Others
    ['mkv', 'video/x-matroska'],
    ['mov', 'video/quicktime'],
    ['msg', 'application/vnd.ms-outlook']
]);
function toFileWithPath(file, path) {
    var f = withMimeType(file);
    if (typeof f.path !== 'string') { // on electron, path is already set to the absolute path
        var webkitRelativePath = file.webkitRelativePath;
        Object.defineProperty(f, 'path', {
            value: typeof path === 'string'
                ? path
                // If <input webkitdirectory> is set,
                // the File will have a {webkitRelativePath} property
                // https://developer.mozilla.org/en-US/docs/Web/API/HTMLInputElement/webkitdirectory
                : typeof webkitRelativePath === 'string' && webkitRelativePath.length > 0
                    ? webkitRelativePath
                    : file.name,
            writable: false,
            configurable: false,
            enumerable: true
        });
    }
    return f;
}
function withMimeType(file) {
    var name = file.name;
    var hasExtension = name && name.lastIndexOf('.') !== -1;
    if (hasExtension && !file.type) {
        var ext = name.split('.')
            .pop().toLowerCase();
        var type = COMMON_MIME_TYPES.get(ext);
        if (type) {
            Object.defineProperty(file, 'type', {
                value: type,
                writable: false,
                configurable: false,
                enumerable: true
            });
        }
    }
    return file;
}

var FILES_TO_IGNORE = [
    // Thumbnail cache files for macOS and Windows
    '.DS_Store',
    'Thumbs.db' // Windows
];
/**
 * Convert a DragEvent's DataTrasfer object to a list of File objects
 * NOTE: If some of the items are folders,
 * everything will be flattened and placed in the same list but the paths will be kept as a {path} property.
 *
 * EXPERIMENTAL: A list of https://developer.mozilla.org/en-US/docs/Web/API/FileSystemHandle objects can also be passed as an arg
 * and a list of File objects will be returned.
 *
 * @param evt
 */
function fromEvent(evt) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            if (isObject$1(evt) && isDataTransfer(evt.dataTransfer)) {
                return [2 /*return*/, getDataTransferFiles(evt.dataTransfer, evt.type)];
            }
            else if (isChangeEvt(evt)) {
                return [2 /*return*/, getInputFiles(evt)];
            }
            else if (Array.isArray(evt) && evt.every(function (item) { return 'getFile' in item && typeof item.getFile === 'function'; })) {
                return [2 /*return*/, getFsHandleFiles(evt)];
            }
            return [2 /*return*/, []];
        });
    });
}
function isDataTransfer(value) {
    return isObject$1(value);
}
function isChangeEvt(value) {
    return isObject$1(value) && isObject$1(value.target);
}
function isObject$1(v) {
    return typeof v === 'object' && v !== null;
}
function getInputFiles(evt) {
    return fromList(evt.target.files).map(function (file) { return toFileWithPath(file); });
}
// Ee expect each handle to be https://developer.mozilla.org/en-US/docs/Web/API/FileSystemFileHandle
function getFsHandleFiles(handles) {
    return __awaiter(this, void 0, void 0, function () {
        var files;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, Promise.all(handles.map(function (h) { return h.getFile(); }))];
                case 1:
                    files = _a.sent();
                    return [2 /*return*/, files.map(function (file) { return toFileWithPath(file); })];
            }
        });
    });
}
function getDataTransferFiles(dt, type) {
    return __awaiter(this, void 0, void 0, function () {
        var items, files;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!dt.items) return [3 /*break*/, 2];
                    items = fromList(dt.items)
                        .filter(function (item) { return item.kind === 'file'; });
                    // According to https://html.spec.whatwg.org/multipage/dnd.html#dndevents,
                    // only 'dragstart' and 'drop' has access to the data (source node)
                    if (type !== 'drop') {
                        return [2 /*return*/, items];
                    }
                    return [4 /*yield*/, Promise.all(items.map(toFilePromises))];
                case 1:
                    files = _a.sent();
                    return [2 /*return*/, noIgnoredFiles(flatten(files))];
                case 2: return [2 /*return*/, noIgnoredFiles(fromList(dt.files)
                        .map(function (file) { return toFileWithPath(file); }))];
            }
        });
    });
}
function noIgnoredFiles(files) {
    return files.filter(function (file) { return FILES_TO_IGNORE.indexOf(file.name) === -1; });
}
// IE11 does not support Array.from()
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/from#Browser_compatibility
// https://developer.mozilla.org/en-US/docs/Web/API/FileList
// https://developer.mozilla.org/en-US/docs/Web/API/DataTransferItemList
function fromList(items) {
    if (items === null) {
        return [];
    }
    var files = [];
    // tslint:disable: prefer-for-of
    for (var i = 0; i < items.length; i++) {
        var file = items[i];
        files.push(file);
    }
    return files;
}
// https://developer.mozilla.org/en-US/docs/Web/API/DataTransferItem
function toFilePromises(item) {
    if (typeof item.webkitGetAsEntry !== 'function') {
        return fromDataTransferItem(item);
    }
    var entry = item.webkitGetAsEntry();
    // Safari supports dropping an image node from a different window and can be retrieved using
    // the DataTransferItem.getAsFile() API
    // NOTE: FileSystemEntry.file() throws if trying to get the file
    if (entry && entry.isDirectory) {
        return fromDirEntry(entry);
    }
    return fromDataTransferItem(item);
}
function flatten(items) {
    return items.reduce(function (acc, files) { return __spreadArray(__spreadArray([], __read(acc), false), __read((Array.isArray(files) ? flatten(files) : [files])), false); }, []);
}
function fromDataTransferItem(item) {
    var file = item.getAsFile();
    if (!file) {
        return Promise.reject("".concat(item, " is not a File"));
    }
    var fwp = toFileWithPath(file);
    return Promise.resolve(fwp);
}
// https://developer.mozilla.org/en-US/docs/Web/API/FileSystemEntry
function fromEntry(entry) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, entry.isDirectory ? fromDirEntry(entry) : fromFileEntry(entry)];
        });
    });
}
// https://developer.mozilla.org/en-US/docs/Web/API/FileSystemDirectoryEntry
function fromDirEntry(entry) {
    var reader = entry.createReader();
    return new Promise(function (resolve, reject) {
        var entries = [];
        function readEntries() {
            var _this = this;
            // https://developer.mozilla.org/en-US/docs/Web/API/FileSystemDirectoryEntry/createReader
            // https://developer.mozilla.org/en-US/docs/Web/API/FileSystemDirectoryReader/readEntries
            reader.readEntries(function (batch) { return __awaiter(_this, void 0, void 0, function () {
                var files, err_1, items;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!!batch.length) return [3 /*break*/, 5];
                            _a.label = 1;
                        case 1:
                            _a.trys.push([1, 3, , 4]);
                            return [4 /*yield*/, Promise.all(entries)];
                        case 2:
                            files = _a.sent();
                            resolve(files);
                            return [3 /*break*/, 4];
                        case 3:
                            err_1 = _a.sent();
                            reject(err_1);
                            return [3 /*break*/, 4];
                        case 4: return [3 /*break*/, 6];
                        case 5:
                            items = Promise.all(batch.map(fromEntry));
                            entries.push(items);
                            // Continue reading
                            readEntries();
                            _a.label = 6;
                        case 6: return [2 /*return*/];
                    }
                });
            }); }, function (err) {
                reject(err);
            });
        }
        readEntries();
    });
}
// https://developer.mozilla.org/en-US/docs/Web/API/FileSystemFileEntry
function fromFileEntry(entry) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, new Promise(function (resolve, reject) {
                    entry.file(function (file) {
                        var fwp = toFileWithPath(file, entry.fullPath);
                        resolve(fwp);
                    }, function (err) {
                        reject(err);
                    });
                })];
        });
    });
}

/**
 * This is a forked version of the react-dropzone package, that's been minified
 * to suit UploadThing's needs and be easily portable to other frameworks than React.
 * See original source here: https://github.com/react-dropzone/react-dropzone
 * The original package is licensed under the MIT license.
 */ /**
 * Copyright (c) (MIT License) 2015 Andrey Okonetchnikov
 * https://github.com/react-dropzone/attr-accept/blob/master/src/index.js
 */ function accepts(file, acceptedFiles) {
    if (file && acceptedFiles) {
        const acceptedFilesArray = Array.isArray(acceptedFiles) ? acceptedFiles : acceptedFiles.split(",");
        const fileName = file.name ?? "";
        const mimeType = (file.type ?? "").toLowerCase();
        const baseMimeType = mimeType.replace(/\/.*$/, "");
        return acceptedFilesArray.some((type)=>{
            const validType = type.trim().toLowerCase();
            if (validType.startsWith(".")) {
                return fileName.toLowerCase().endsWith(validType);
            } else if (validType.endsWith("/*")) {
                // This is something like a image/* mime type
                return baseMimeType === validType.replace(/\/.*$/, "");
            }
            return mimeType === validType;
        });
    }
    return true;
}
// Firefox versions prior to 53 return a bogus MIME type for every file drag, so dragovers with
// that MIME type will always be accepted
function isFileAccepted(file, accept) {
    return file.type === "application/x-moz-file" || accepts(file, accept);
}
function isEnterOrSpace(event) {
    return "key" in event && (event.key === " " || event.key === "Enter") || "keyCode" in event && (event.keyCode === 32 || event.keyCode === 13);
}
const isDefined = (v)=>v != null;
function isValidSize(file, minSize, maxSize) {
    if (!isDefined(file.size)) return true;
    if (isDefined(minSize) && isDefined(maxSize)) {
        return file.size >= minSize && file.size <= maxSize;
    }
    if (isDefined(minSize) && file.size < minSize) return false;
    if (isDefined(maxSize) && file.size > maxSize) return false;
    return true;
}
function isValidQuantity(files, multiple, maxFiles) {
    if (!multiple && files.length > 1) return false;
    if (multiple && maxFiles >= 1 && files.length > maxFiles) return false;
    return true;
}
function allFilesAccepted({ files, accept, minSize, maxSize, multiple, maxFiles }) {
    if (!isValidQuantity(files, multiple, maxFiles)) return false;
    return files.every((file)=>isFileAccepted(file, accept) && isValidSize(file, minSize, maxSize));
}
function isEventWithFiles(event) {
    if (!("dataTransfer" in event && event.dataTransfer !== null)) {
        return !!event.target && "files" in event.target && !!event.target.files;
    }
    // https://developer.mozilla.org/en-US/docs/Web/API/DataTransfer/types
    // https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API/Recommended_drag_types#file
    return Array.prototype.some.call(// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    event.dataTransfer?.types, (type)=>type === "Files" || type === "application/x-moz-file");
}
function isIeOrEdge(ua = window.navigator.userAgent) {
    return ua.indexOf("MSIE ") > -1 || ua.indexOf("Trident/") > -1 || ua.indexOf("Edge/") > -1;
}
function isMIMEType(v) {
    return v === "audio/*" || v === "video/*" || v === "image/*" || v === "text/*" || /\w+\/[-+.\w]+/g.test(v);
}
function isExt(v) {
    return /^.*\.[\w]+$/.test(v);
}
/**
 * Convert the `{accept}` dropzone prop to an array of MIME types/extensions.
 */ function acceptPropAsAcceptAttr(accept) {
    if (isDefined(accept)) {
        return Object.entries(accept).reduce((a, [mimeType, ext])=>[
                ...a,
                mimeType,
                ...ext
            ], [])// Silently discard invalid entries as pickerOptionsFromAccept warns about these
        .filter((v)=>isMIMEType(v) || isExt(v)).join(",");
    }
    return undefined;
}
function noop() {
// noop
}
const initialState = {
    isFocused: false,
    isFileDialogActive: false,
    isDragActive: false,
    isDragAccept: false,
    isDragReject: false,
    acceptedFiles: []
};
function reducer(state, action) {
    switch(action.type){
        case "focus":
            return {
                ...state,
                isFocused: true
            };
        case "blur":
            return {
                ...state,
                isFocused: false
            };
        case "openDialog":
            return {
                ...initialState,
                isFileDialogActive: true
            };
        case "closeDialog":
            return {
                ...state,
                isFileDialogActive: false
            };
        case "setDraggedFiles":
            return {
                ...state,
                ...action.payload
            };
        case "setFiles":
            return {
                ...state,
                ...action.payload
            };
        case "reset":
            return initialState;
        default:
            return state;
    }
}

/**
 * A React hook that creates a drag 'n' drop area.
 *
 * ### Example
 *
 * ```tsx
 * function MyDropzone() {
 *   const { getRootProps, getInputProps } = useDropzone({
 *     onDrop: acceptedFiles => {
 *       // do something with the File objects, e.g. upload to some server
 *     }
 *   });
 *
 *   return (
 *     <div {...getRootProps()}>
 *       <input {...getInputProps()} />
 *       <p>Drag and drop some files here, or click to select files</p>
 *     </div>
 *   )
 * }
 * ```
 */ function useDropzone({ accept, disabled = false, maxSize = Number.POSITIVE_INFINITY, minSize = 0, multiple = true, maxFiles = 0, onDrop }) {
    const acceptAttr = reactExports.useMemo(()=>acceptPropAsAcceptAttr(accept), [
        accept
    ]);
    const rootRef = reactExports.useRef(null);
    const inputRef = reactExports.useRef(null);
    const dragTargetsRef = reactExports.useRef([]);
    const [state, dispatch] = reactExports.useReducer(reducer, initialState);
    reactExports.useEffect(()=>{
        // Update file dialog active state when the window is focused on
        const onWindowFocus = ()=>{
            // Execute the timeout only if the file dialog is opened in the browser
            if (state.isFileDialogActive) {
                setTimeout(()=>{
                    if (inputRef.current) {
                        const { files } = inputRef.current;
                        if (!files?.length) {
                            dispatch({
                                type: "closeDialog"
                            });
                        }
                    }
                }, 300);
            }
        };
        window.addEventListener("focus", onWindowFocus, false);
        return ()=>{
            window.removeEventListener("focus", onWindowFocus, false);
        };
    }, [
        state.isFileDialogActive
    ]);
    reactExports.useEffect(()=>{
        const onDocumentDrop = (event)=>{
            // If we intercepted an event for our instance, let it propagate down to the instance's onDrop handler
            if (rootRef.current?.contains(event.target)) return;
            event.preventDefault();
            dragTargetsRef.current = [];
        };
        const onDocumentDragOver = (e)=>e.preventDefault();
        document.addEventListener("dragover", onDocumentDragOver, false);
        document.addEventListener("drop", onDocumentDrop, false);
        return ()=>{
            document.removeEventListener("dragover", onDocumentDragOver);
            document.removeEventListener("drop", onDocumentDrop);
        };
    }, []);
    const onDragEnter = reactExports.useCallback((event)=>{
        event.preventDefault();
        event.persist();
        dragTargetsRef.current = [
            ...dragTargetsRef.current,
            event.target
        ];
        if (isEventWithFiles(event)) {
            Promise.resolve(fromEvent(event)).then((files)=>{
                if (event.isPropagationStopped()) return;
                const fileCount = files.length;
                const isDragAccept = fileCount > 0 && allFilesAccepted({
                    files: files,
                    accept: acceptAttr,
                    minSize,
                    maxSize,
                    multiple,
                    maxFiles
                });
                const isDragReject = fileCount > 0 && !isDragAccept;
                dispatch({
                    type: "setDraggedFiles",
                    payload: {
                        isDragAccept,
                        isDragReject,
                        isDragActive: true
                    }
                });
            }).catch(noop);
        }
    }, [
        acceptAttr,
        maxFiles,
        maxSize,
        minSize,
        multiple
    ]);
    const onDragOver = reactExports.useCallback((event)=>{
        event.preventDefault();
        event.persist();
        const hasFiles = isEventWithFiles(event);
        if (hasFiles && event.dataTransfer !== null) {
            try {
                event.dataTransfer.dropEffect = "copy";
            } catch  {
            }
        }
        return false;
    }, []);
    const onDragLeave = reactExports.useCallback((event)=>{
        event.preventDefault();
        event.persist();
        // Only deactivate once the dropzone and all children have been left
        const targets = dragTargetsRef.current.filter((target)=>rootRef.current?.contains(target));
        // Make sure to remove a target present multiple times only once
        // (Firefox may fire dragenter/dragleave multiple times on the same element)
        const targetIdx = targets.indexOf(event.target);
        if (targetIdx !== -1) targets.splice(targetIdx, 1);
        dragTargetsRef.current = targets;
        if (targets.length > 0) return;
        dispatch({
            type: "setDraggedFiles",
            payload: {
                isDragActive: false,
                isDragAccept: false,
                isDragReject: false
            }
        });
    }, []);
    const setFiles = reactExports.useCallback((files)=>{
        const acceptedFiles = [];
        files.forEach((file)=>{
            const accepted = isFileAccepted(file, acceptAttr);
            const sizeMatch = isValidSize(file, minSize, maxSize);
            if (accepted && sizeMatch) {
                acceptedFiles.push(file);
            }
        });
        if (!isValidQuantity(acceptedFiles, multiple, maxFiles)) {
            acceptedFiles.splice(0);
        }
        dispatch({
            type: "setFiles",
            payload: {
                acceptedFiles
            }
        });
        onDrop(acceptedFiles);
    }, [
        acceptAttr,
        maxFiles,
        maxSize,
        minSize,
        multiple,
        onDrop
    ]);
    const onDropCb = reactExports.useCallback((event)=>{
        event.preventDefault();
        event.persist();
        dragTargetsRef.current = [];
        if (isEventWithFiles(event)) {
            Promise.resolve(fromEvent(event)).then((files)=>{
                if (event.isPropagationStopped()) return;
                setFiles(files);
            }).catch(noop);
        }
        dispatch({
            type: "reset"
        });
    }, [
        setFiles
    ]);
    const openFileDialog = reactExports.useCallback(()=>{
        if (inputRef.current) {
            dispatch({
                type: "openDialog"
            });
            inputRef.current.value = "";
            inputRef.current.click();
        }
    }, []);
    // Cb to open the file dialog when SPACE/ENTER occurs on the dropzone
    const onKeyDown = reactExports.useCallback((event)=>{
        // Ignore keyboard events bubbling up the DOM tree
        if (!rootRef.current?.isEqualNode(event.target)) return;
        if (isEnterOrSpace(event)) {
            event.preventDefault();
            openFileDialog();
        }
    }, [
        openFileDialog
    ]);
    const onInputElementClick = reactExports.useCallback((e)=>{
        e.stopPropagation();
    }, []);
    // Update focus state for the dropzone
    const onFocus = reactExports.useCallback(()=>dispatch({
            type: "focus"
        }), []);
    const onBlur = reactExports.useCallback(()=>dispatch({
            type: "blur"
        }), []);
    const onClick = reactExports.useCallback(()=>{
        // In IE11/Edge the file-browser dialog is blocking, therefore,
        // use setTimeout() to ensure React can handle state changes
        isIeOrEdge() ? setTimeout(openFileDialog, 0) : openFileDialog();
    }, [
        openFileDialog
    ]);
    const getRootProps = reactExports.useMemo(()=>()=>({
                ref: rootRef,
                role: "presentation",
                ...!disabled ? {
                    tabIndex: 0,
                    onKeyDown,
                    onFocus,
                    onBlur,
                    onClick,
                    onDragEnter,
                    onDragOver,
                    onDragLeave,
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                    onDrop: onDropCb
                } : {}
            }), [
        disabled,
        onBlur,
        onClick,
        onDragEnter,
        onDragLeave,
        onDragOver,
        onDropCb,
        onFocus,
        onKeyDown
    ]);
    const getInputProps = reactExports.useMemo(()=>()=>({
                ref: inputRef,
                type: "file",
                style: {
                    display: "none"
                },
                accept: acceptAttr,
                multiple,
                tabIndex: -1,
                ...!disabled ? {
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                    onChange: onDropCb,
                    onClick: onInputElementClick
                } : {}
            }), [
        acceptAttr,
        multiple,
        onDropCb,
        onInputElementClick,
        disabled
    ]);
    return {
        ...state,
        getRootProps,
        getInputProps,
        rootRef
    };
}

function UploadDropzone(props) {
    // Cast back to UploadthingComponentProps<TRouter> to get the correct type
    // since the ErrorMessage messes it up otherwise
    const $props = props;
    const { mode = "manual", appendOnPaste = false } = $props.config ?? {};
    const useUploadThing = INTERNAL_uploadthingHookGen({
        url: resolveMaybeUrlArg($props.url)
    });
    const [files, setFiles] = reactExports.useState([]);
    const [uploadProgressState, setUploadProgress] = reactExports.useState($props.__internal_upload_progress ?? 0);
    const uploadProgress = $props.__internal_upload_progress ?? uploadProgressState;
    const { startUpload, isUploading, permittedFileInfo } = useUploadThing($props.endpoint, {
        headers: $props.headers,
        skipPolling: !$props?.onClientUploadComplete ? true : $props?.skipPolling,
        onClientUploadComplete: (res)=>{
            setFiles([]);
            $props.onClientUploadComplete?.(res);
            setUploadProgress(0);
        },
        onUploadProgress: (p)=>{
            setUploadProgress(p);
            $props.onUploadProgress?.(p);
        },
        onUploadError: $props.onUploadError,
        onUploadBegin: $props.onUploadBegin,
        onBeforeUploadBegin: $props.onBeforeUploadBegin
    });
    const { fileTypes, multiple } = generatePermittedFileTypes(permittedFileInfo?.config);
    const onDrop = reactExports.useCallback((acceptedFiles)=>{
        setFiles(acceptedFiles);
        // If mode is auto, start upload immediately
        if (mode === "auto") {
            const input = "input" in $props ? $props.input : undefined;
            void startUpload(acceptedFiles, input);
            return;
        }
    }, [
        $props,
        mode,
        startUpload
    ]);
    const { getRootProps, getInputProps, isDragActive, rootRef } = useDropzone({
        onDrop,
        multiple,
        accept: fileTypes ? generateClientDropzoneAccept(fileTypes) : undefined,
        disabled: $props.__internal_dropzone_disabled
    });
    const ready = $props.__internal_ready ?? ($props.__internal_state === "ready" || fileTypes.length > 0);
    const onUploadClick = (e)=>{
        e.preventDefault();
        e.stopPropagation();
        if (!files) return;
        const input = "input" in $props ? $props.input : undefined;
        void startUpload(files, input);
    };
    reactExports.useEffect(()=>{
        const handlePaste = (event)=>{
            if (!appendOnPaste) return;
            if (document.activeElement !== rootRef.current) return;
            const pastedFiles = getFilesFromClipboardEvent(event);
            if (!pastedFiles?.length) return;
            let filesToUpload = pastedFiles;
            setFiles((prev)=>{
                filesToUpload = [
                    ...prev,
                    ...pastedFiles
                ];
                return filesToUpload;
            });
            if (mode === "auto") {
                const input = "input" in $props ? $props.input : undefined;
                void startUpload(filesToUpload, input);
            }
        };
        window.addEventListener("paste", handlePaste);
        return ()=>{
            window.removeEventListener("paste", handlePaste);
        };
    }, [
        startUpload,
        $props,
        appendOnPaste,
        mode,
        fileTypes,
        rootRef,
        files
    ]);
    const getUploadButtonText = (fileTypes)=>{
        if (files.length > 0) return `Upload ${files.length} file${files.length === 1 ? "" : "s"}`;
        if (fileTypes.length === 0) return "Loading...";
        return `Choose File${multiple ? `(s)` : ``}`;
    };
    const getUploadButtonContents = (fileTypes)=>{
        if (state !== "uploading") {
            return getUploadButtonText(fileTypes);
        }
        if (uploadProgress === 100) {
            return /*#__PURE__*/ jsxRuntimeExports.jsx(Spinner, {});
        }
        return /*#__PURE__*/ jsxRuntimeExports.jsxs("span", {
            className: "z-50",
            children: [
                uploadProgress,
                "%"
            ]
        });
    };
    const styleFieldArg = {
        fileTypes,
        isDragActive,
        isUploading,
        ready,
        uploadProgress
    };
    const state = (()=>{
        if ($props.__internal_state) return $props.__internal_state;
        if (!ready) return "readying";
        if (ready && !isUploading) return "ready";
        return "uploading";
    })();
    return /*#__PURE__*/ jsxRuntimeExports.jsxs("div", {
        className: twMerge("mt-2 flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-900/25 px-6 py-10 text-center", isDragActive && "bg-blue-600/10", $props.className, styleFieldToClassName($props.appearance?.container, styleFieldArg)),
        ...getRootProps(),
        style: styleFieldToCssObject($props.appearance?.container, styleFieldArg),
        "data-state": state,
        children: [
            contentFieldToContent($props.content?.uploadIcon, styleFieldArg) ?? /*#__PURE__*/ jsxRuntimeExports.jsx("svg", {
                xmlns: "http://www.w3.org/2000/svg",
                viewBox: "0 0 20 20",
                className: twMerge("mx-auto block h-12 w-12 align-middle text-gray-400", styleFieldToClassName($props.appearance?.uploadIcon, styleFieldArg)),
                style: styleFieldToCssObject($props.appearance?.uploadIcon, styleFieldArg),
                "data-ut-element": "upload-icon",
                "data-state": state,
                children: /*#__PURE__*/ jsxRuntimeExports.jsx("path", {
                    fill: "currentColor",
                    fillRule: "evenodd",
                    d: "M5.5 17a4.5 4.5 0 0 1-1.44-8.765a4.5 4.5 0 0 1 8.302-3.046a3.5 3.5 0 0 1 4.504 4.272A4 4 0 0 1 15 17H5.5Zm3.75-2.75a.75.75 0 0 0 1.5 0V9.66l1.95 2.1a.75.75 0 1 0 1.1-1.02l-3.25-3.5a.75.75 0 0 0-1.1 0l-3.25 3.5a.75.75 0 1 0 1.1 1.02l1.95-2.1v4.59Z",
                    clipRule: "evenodd"
                })
            }),
            /*#__PURE__*/ jsxRuntimeExports.jsxs("label", {
                className: twMerge("relative mt-4 flex w-64 cursor-pointer items-center justify-center text-sm font-semibold leading-6 text-gray-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-600 focus-within:ring-offset-2 hover:text-blue-500", ready ? "text-blue-600" : "text-gray-500", styleFieldToClassName($props.appearance?.label, styleFieldArg)),
                style: styleFieldToCssObject($props.appearance?.label, styleFieldArg),
                "data-ut-element": "label",
                "data-state": state,
                children: [
                    /*#__PURE__*/ jsxRuntimeExports.jsx("input", {
                        className: "sr-only",
                        ...getInputProps()
                    }),
                    contentFieldToContent($props.content?.label, styleFieldArg) ?? (ready ? `Choose files or drag and drop` : `Loading...`)
                ]
            }),
            /*#__PURE__*/ jsxRuntimeExports.jsx("div", {
                className: twMerge("m-0 h-[1.25rem] text-xs leading-5 text-gray-600", styleFieldToClassName($props.appearance?.allowedContent, styleFieldArg)),
                style: styleFieldToCssObject($props.appearance?.allowedContent, styleFieldArg),
                "data-ut-element": "allowed-content",
                "data-state": state,
                children: contentFieldToContent($props.content?.allowedContent, styleFieldArg) ?? allowedContentTextLabelGenerator(permittedFileInfo?.config)
            }),
            /*#__PURE__*/ jsxRuntimeExports.jsx("button", {
                className: twMerge("relative mt-4 flex h-10 w-36 cursor-pointer items-center justify-center overflow-hidden rounded-md border-none text-base text-white after:transition-[width] after:duration-500 focus-within:ring-2 focus-within:ring-blue-600 focus-within:ring-offset-2", state === "readying" && "cursor-not-allowed bg-blue-400", state === "uploading" && `bg-blue-400 after:absolute after:left-0 after:h-full after:bg-blue-600 after:content-[''] ${progressWidths[uploadProgress]}`, state === "ready" && "bg-blue-600", "disabled:pointer-events-none", styleFieldToClassName($props.appearance?.button, styleFieldArg)),
                style: styleFieldToCssObject($props.appearance?.button, styleFieldArg),
                onClick: onUploadClick,
                "data-ut-element": "button",
                "data-state": state,
                type: "button",
                disabled: $props.__internal_button_disabled ?? (!files.length || state === "uploading"),
                children: contentFieldToContent($props.content?.button, styleFieldArg) ?? getUploadButtonContents(fileTypes)
            })
        ]
    });
}

const generateUploadButton = (opts)=>{
    const url = resolveMaybeUrlArg(opts?.url);
    const TypedButton = (props)=>/*#__PURE__*/ jsxRuntimeExports.jsx(UploadButton, {
            ...props,
            url: url
        });
    return TypedButton;
};
const generateUploadDropzone = (opts)=>{
    const url = resolveMaybeUrlArg(opts?.url);
    const TypedDropzone = (props)=>/*#__PURE__*/ jsxRuntimeExports.jsx(UploadDropzone, {
            ...props,
            url: url
        });
    return TypedDropzone;
};

generateUploadButton();
generateUploadDropzone();
const { useUploadThing } = generateReactHelpers();

var isCheckBoxInput = (element) => element.type === 'checkbox';

var isDateObject = (value) => value instanceof Date;

var isNullOrUndefined = (value) => value == null;

const isObjectType = (value) => typeof value === 'object';
var isObject = (value) => !isNullOrUndefined(value) &&
    !Array.isArray(value) &&
    isObjectType(value) &&
    !isDateObject(value);

var getEventValue = (event) => isObject(event) && event.target
    ? isCheckBoxInput(event.target)
        ? event.target.checked
        : event.target.value
    : event;

var getNodeParentName = (name) => name.substring(0, name.search(/\.\d+(\.|$)/)) || name;

var isNameInFieldArray = (names, name) => names.has(getNodeParentName(name));

var isPlainObject = (tempObject) => {
    const prototypeCopy = tempObject.constructor && tempObject.constructor.prototype;
    return (isObject(prototypeCopy) && prototypeCopy.hasOwnProperty('isPrototypeOf'));
};

var isWeb = typeof window !== 'undefined' &&
    typeof window.HTMLElement !== 'undefined' &&
    typeof document !== 'undefined';

function cloneObject(data) {
    let copy;
    const isArray = Array.isArray(data);
    if (data instanceof Date) {
        copy = new Date(data);
    }
    else if (data instanceof Set) {
        copy = new Set(data);
    }
    else if (!(isWeb && (data instanceof Blob || data instanceof FileList)) &&
        (isArray || isObject(data))) {
        copy = isArray ? [] : {};
        if (!isArray && !isPlainObject(data)) {
            copy = data;
        }
        else {
            for (const key in data) {
                if (data.hasOwnProperty(key)) {
                    copy[key] = cloneObject(data[key]);
                }
            }
        }
    }
    else {
        return data;
    }
    return copy;
}

var compact = (value) => Array.isArray(value) ? value.filter(Boolean) : [];

var isUndefined = (val) => val === undefined;

var get = (object, path, defaultValue) => {
    if (!path || !isObject(object)) {
        return defaultValue;
    }
    const result = compact(path.split(/[,[\].]+?/)).reduce((result, key) => isNullOrUndefined(result) ? result : result[key], object);
    return isUndefined(result) || result === object
        ? isUndefined(object[path])
            ? defaultValue
            : object[path]
        : result;
};

var isBoolean = (value) => typeof value === 'boolean';

const EVENTS = {
    BLUR: 'blur',
    FOCUS_OUT: 'focusout',
    CHANGE: 'change',
};
const VALIDATION_MODE = {
    onBlur: 'onBlur',
    onChange: 'onChange',
    onSubmit: 'onSubmit',
    onTouched: 'onTouched',
    all: 'all',
};
const INPUT_VALIDATION_RULES = {
    max: 'max',
    min: 'min',
    maxLength: 'maxLength',
    minLength: 'minLength',
    pattern: 'pattern',
    required: 'required',
    validate: 'validate',
};

const HookFormContext = React.createContext(null);
/**
 * This custom hook allows you to access the form context. useFormContext is intended to be used in deeply nested structures, where it would become inconvenient to pass the context as a prop. To be used with {@link FormProvider}.
 *
 * @remarks
 * [API](https://react-hook-form.com/docs/useformcontext) • [Demo](https://codesandbox.io/s/react-hook-form-v7-form-context-ytudi)
 *
 * @returns return all useForm methods
 *
 * @example
 * ```tsx
 * function App() {
 *   const methods = useForm();
 *   const onSubmit = data => console.log(data);
 *
 *   return (
 *     <FormProvider {...methods} >
 *       <form onSubmit={methods.handleSubmit(onSubmit)}>
 *         <NestedInput />
 *         <input type="submit" />
 *       </form>
 *     </FormProvider>
 *   );
 * }
 *
 *  function NestedInput() {
 *   const { register } = useFormContext(); // retrieve all hook methods
 *   return <input {...register("test")} />;
 * }
 * ```
 */
const useFormContext = () => React.useContext(HookFormContext);
/**
 * A provider component that propagates the `useForm` methods to all children components via [React Context](https://reactjs.org/docs/context.html) API. To be used with {@link useFormContext}.
 *
 * @remarks
 * [API](https://react-hook-form.com/docs/useformcontext) • [Demo](https://codesandbox.io/s/react-hook-form-v7-form-context-ytudi)
 *
 * @param props - all useForm methods
 *
 * @example
 * ```tsx
 * function App() {
 *   const methods = useForm();
 *   const onSubmit = data => console.log(data);
 *
 *   return (
 *     <FormProvider {...methods} >
 *       <form onSubmit={methods.handleSubmit(onSubmit)}>
 *         <NestedInput />
 *         <input type="submit" />
 *       </form>
 *     </FormProvider>
 *   );
 * }
 *
 *  function NestedInput() {
 *   const { register } = useFormContext(); // retrieve all hook methods
 *   return <input {...register("test")} />;
 * }
 * ```
 */
const FormProvider = (props) => {
    const { children, ...data } = props;
    return (React.createElement(HookFormContext.Provider, { value: data }, children));
};

var getProxyFormState = (formState, control, localProxyFormState, isRoot = true) => {
    const result = {
        defaultValues: control._defaultValues,
    };
    for (const key in formState) {
        Object.defineProperty(result, key, {
            get: () => {
                const _key = key;
                if (control._proxyFormState[_key] !== VALIDATION_MODE.all) {
                    control._proxyFormState[_key] = !isRoot || VALIDATION_MODE.all;
                }
                localProxyFormState && (localProxyFormState[_key] = true);
                return formState[_key];
            },
        });
    }
    return result;
};

var isEmptyObject = (value) => isObject(value) && !Object.keys(value).length;

var shouldRenderFormState = (formStateData, _proxyFormState, updateFormState, isRoot) => {
    updateFormState(formStateData);
    const { name, ...formState } = formStateData;
    return (isEmptyObject(formState) ||
        Object.keys(formState).length >= Object.keys(_proxyFormState).length ||
        Object.keys(formState).find((key) => _proxyFormState[key] ===
            (!isRoot || VALIDATION_MODE.all)));
};

var convertToArrayPayload = (value) => (Array.isArray(value) ? value : [value]);

var shouldSubscribeByName = (name, signalName, exact) => !name ||
    !signalName ||
    name === signalName ||
    convertToArrayPayload(name).some((currentName) => currentName &&
        (exact
            ? currentName === signalName
            : currentName.startsWith(signalName) ||
                signalName.startsWith(currentName)));

function useSubscribe(props) {
    const _props = React.useRef(props);
    _props.current = props;
    React.useEffect(() => {
        const subscription = !props.disabled &&
            _props.current.subject &&
            _props.current.subject.subscribe({
                next: _props.current.next,
            });
        return () => {
            subscription && subscription.unsubscribe();
        };
    }, [props.disabled]);
}

/**
 * This custom hook allows you to subscribe to each form state, and isolate the re-render at the custom hook level. It has its scope in terms of form state subscription, so it would not affect other useFormState and useForm. Using this hook can reduce the re-render impact on large and complex form application.
 *
 * @remarks
 * [API](https://react-hook-form.com/docs/useformstate) • [Demo](https://codesandbox.io/s/useformstate-75xly)
 *
 * @param props - include options on specify fields to subscribe. {@link UseFormStateReturn}
 *
 * @example
 * ```tsx
 * function App() {
 *   const { register, handleSubmit, control } = useForm({
 *     defaultValues: {
 *     firstName: "firstName"
 *   }});
 *   const { dirtyFields } = useFormState({
 *     control
 *   });
 *   const onSubmit = (data) => console.log(data);
 *
 *   return (
 *     <form onSubmit={handleSubmit(onSubmit)}>
 *       <input {...register("firstName")} placeholder="First Name" />
 *       {dirtyFields.firstName && <p>Field is dirty.</p>}
 *       <input type="submit" />
 *     </form>
 *   );
 * }
 * ```
 */
function useFormState(props) {
    const methods = useFormContext();
    const { control = methods.control, disabled, name, exact } = props || {};
    const [formState, updateFormState] = React.useState(control._formState);
    const _mounted = React.useRef(true);
    const _localProxyFormState = React.useRef({
        isDirty: false,
        isLoading: false,
        dirtyFields: false,
        touchedFields: false,
        validatingFields: false,
        isValidating: false,
        isValid: false,
        errors: false,
    });
    const _name = React.useRef(name);
    _name.current = name;
    useSubscribe({
        disabled,
        next: (value) => _mounted.current &&
            shouldSubscribeByName(_name.current, value.name, exact) &&
            shouldRenderFormState(value, _localProxyFormState.current, control._updateFormState) &&
            updateFormState({
                ...control._formState,
                ...value,
            }),
        subject: control._subjects.state,
    });
    React.useEffect(() => {
        _mounted.current = true;
        _localProxyFormState.current.isValid && control._updateValid(true);
        return () => {
            _mounted.current = false;
        };
    }, [control]);
    return getProxyFormState(formState, control, _localProxyFormState.current, false);
}

var isString = (value) => typeof value === 'string';

var generateWatchOutput = (names, _names, formValues, isGlobal, defaultValue) => {
    if (isString(names)) {
        isGlobal && _names.watch.add(names);
        return get(formValues, names, defaultValue);
    }
    if (Array.isArray(names)) {
        return names.map((fieldName) => (isGlobal && _names.watch.add(fieldName), get(formValues, fieldName)));
    }
    isGlobal && (_names.watchAll = true);
    return formValues;
};

/**
 * Custom hook to subscribe to field change and isolate re-rendering at the component level.
 *
 * @remarks
 *
 * [API](https://react-hook-form.com/docs/usewatch) • [Demo](https://codesandbox.io/s/react-hook-form-v7-ts-usewatch-h9i5e)
 *
 * @example
 * ```tsx
 * const { control } = useForm();
 * const values = useWatch({
 *   name: "fieldName"
 *   control,
 * })
 * ```
 */
function useWatch(props) {
    const methods = useFormContext();
    const { control = methods.control, name, defaultValue, disabled, exact, } = props || {};
    const _name = React.useRef(name);
    _name.current = name;
    useSubscribe({
        disabled,
        subject: control._subjects.values,
        next: (formState) => {
            if (shouldSubscribeByName(_name.current, formState.name, exact)) {
                updateValue(cloneObject(generateWatchOutput(_name.current, control._names, formState.values || control._formValues, false, defaultValue)));
            }
        },
    });
    const [value, updateValue] = React.useState(control._getWatch(name, defaultValue));
    React.useEffect(() => control._removeUnmounted());
    return value;
}

var isKey = (value) => /^\w*$/.test(value);

var stringToPath = (input) => compact(input.replace(/["|']|\]/g, '').split(/\.|\[/));

var set = (object, path, value) => {
    let index = -1;
    const tempPath = isKey(path) ? [path] : stringToPath(path);
    const length = tempPath.length;
    const lastIndex = length - 1;
    while (++index < length) {
        const key = tempPath[index];
        let newValue = value;
        if (index !== lastIndex) {
            const objValue = object[key];
            newValue =
                isObject(objValue) || Array.isArray(objValue)
                    ? objValue
                    : !isNaN(+tempPath[index + 1])
                        ? []
                        : {};
        }
        object[key] = newValue;
        object = object[key];
    }
    return object;
};

/**
 * Custom hook to work with controlled component, this function provide you with both form and field level state. Re-render is isolated at the hook level.
 *
 * @remarks
 * [API](https://react-hook-form.com/docs/usecontroller) • [Demo](https://codesandbox.io/s/usecontroller-0o8px)
 *
 * @param props - the path name to the form field value, and validation rules.
 *
 * @returns field properties, field and form state. {@link UseControllerReturn}
 *
 * @example
 * ```tsx
 * function Input(props) {
 *   const { field, fieldState, formState } = useController(props);
 *   return (
 *     <div>
 *       <input {...field} placeholder={props.name} />
 *       <p>{fieldState.isTouched && "Touched"}</p>
 *       <p>{formState.isSubmitted ? "submitted" : ""}</p>
 *     </div>
 *   );
 * }
 * ```
 */
function useController(props) {
    const methods = useFormContext();
    const { name, disabled, control = methods.control, shouldUnregister } = props;
    const isArrayField = isNameInFieldArray(control._names.array, name);
    const value = useWatch({
        control,
        name,
        defaultValue: get(control._formValues, name, get(control._defaultValues, name, props.defaultValue)),
        exact: true,
    });
    const formState = useFormState({
        control,
        name,
    });
    const _registerProps = React.useRef(control.register(name, {
        ...props.rules,
        value,
        ...(isBoolean(props.disabled) ? { disabled: props.disabled } : {}),
    }));
    React.useEffect(() => {
        const _shouldUnregisterField = control._options.shouldUnregister || shouldUnregister;
        const updateMounted = (name, value) => {
            const field = get(control._fields, name);
            if (field) {
                field._f.mount = value;
            }
        };
        updateMounted(name, true);
        if (_shouldUnregisterField) {
            const value = cloneObject(get(control._options.defaultValues, name));
            set(control._defaultValues, name, value);
            if (isUndefined(get(control._formValues, name))) {
                set(control._formValues, name, value);
            }
        }
        return () => {
            (isArrayField
                ? _shouldUnregisterField && !control._state.action
                : _shouldUnregisterField)
                ? control.unregister(name)
                : updateMounted(name, false);
        };
    }, [name, control, isArrayField, shouldUnregister]);
    React.useEffect(() => {
        if (get(control._fields, name)) {
            control._updateDisabledField({
                disabled,
                fields: control._fields,
                name,
                value: get(control._fields, name)._f.value,
            });
        }
    }, [disabled, name, control]);
    return {
        field: {
            name,
            value,
            ...(isBoolean(disabled) || formState.disabled
                ? { disabled: formState.disabled || disabled }
                : {}),
            onChange: React.useCallback((event) => _registerProps.current.onChange({
                target: {
                    value: getEventValue(event),
                    name: name,
                },
                type: EVENTS.CHANGE,
            }), [name]),
            onBlur: React.useCallback(() => _registerProps.current.onBlur({
                target: {
                    value: get(control._formValues, name),
                    name: name,
                },
                type: EVENTS.BLUR,
            }), [name, control]),
            ref: (elm) => {
                const field = get(control._fields, name);
                if (field && elm) {
                    field._f.ref = {
                        focus: () => elm.focus(),
                        select: () => elm.select(),
                        setCustomValidity: (message) => elm.setCustomValidity(message),
                        reportValidity: () => elm.reportValidity(),
                    };
                }
            },
        },
        formState,
        fieldState: Object.defineProperties({}, {
            invalid: {
                enumerable: true,
                get: () => !!get(formState.errors, name),
            },
            isDirty: {
                enumerable: true,
                get: () => !!get(formState.dirtyFields, name),
            },
            isTouched: {
                enumerable: true,
                get: () => !!get(formState.touchedFields, name),
            },
            isValidating: {
                enumerable: true,
                get: () => !!get(formState.validatingFields, name),
            },
            error: {
                enumerable: true,
                get: () => get(formState.errors, name),
            },
        }),
    };
}

/**
 * Component based on `useController` hook to work with controlled component.
 *
 * @remarks
 * [API](https://react-hook-form.com/docs/usecontroller/controller) • [Demo](https://codesandbox.io/s/react-hook-form-v6-controller-ts-jwyzw) • [Video](https://www.youtube.com/watch?v=N2UNk_UCVyA)
 *
 * @param props - the path name to the form field value, and validation rules.
 *
 * @returns provide field handler functions, field and form state.
 *
 * @example
 * ```tsx
 * function App() {
 *   const { control } = useForm<FormValues>({
 *     defaultValues: {
 *       test: ""
 *     }
 *   });
 *
 *   return (
 *     <form>
 *       <Controller
 *         control={control}
 *         name="test"
 *         render={({ field: { onChange, onBlur, value, ref }, formState, fieldState }) => (
 *           <>
 *             <input
 *               onChange={onChange} // send value to hook form
 *               onBlur={onBlur} // notify when input is touched
 *               value={value} // return updated value
 *               ref={ref} // set ref for focus management
 *             />
 *             <p>{formState.isSubmitted ? "submitted" : ""}</p>
 *             <p>{fieldState.isTouched ? "touched" : ""}</p>
 *           </>
 *         )}
 *       />
 *     </form>
 *   );
 * }
 * ```
 */
const Controller = (props) => props.render(useController(props));

var appendErrors = (name, validateAllFieldCriteria, errors, type, message) => validateAllFieldCriteria
    ? {
        ...errors[name],
        types: {
            ...(errors[name] && errors[name].types ? errors[name].types : {}),
            [type]: message || true,
        },
    }
    : {};

var getValidationModes = (mode) => ({
    isOnSubmit: !mode || mode === VALIDATION_MODE.onSubmit,
    isOnBlur: mode === VALIDATION_MODE.onBlur,
    isOnChange: mode === VALIDATION_MODE.onChange,
    isOnAll: mode === VALIDATION_MODE.all,
    isOnTouch: mode === VALIDATION_MODE.onTouched,
});

var isWatched = (name, _names, isBlurEvent) => !isBlurEvent &&
    (_names.watchAll ||
        _names.watch.has(name) ||
        [..._names.watch].some((watchName) => name.startsWith(watchName) &&
            /^\.\w+/.test(name.slice(watchName.length))));

const iterateFieldsByAction = (fields, action, fieldsNames, abortEarly) => {
    for (const key of fieldsNames || Object.keys(fields)) {
        const field = get(fields, key);
        if (field) {
            const { _f, ...currentField } = field;
            if (_f) {
                if (_f.refs && _f.refs[0] && action(_f.refs[0], key) && !abortEarly) {
                    break;
                }
                else if (_f.ref && action(_f.ref, _f.name) && !abortEarly) {
                    break;
                }
                else {
                    iterateFieldsByAction(currentField, action);
                }
            }
            else if (isObject(currentField)) {
                iterateFieldsByAction(currentField, action);
            }
        }
    }
};

var updateFieldArrayRootError = (errors, error, name) => {
    const fieldArrayErrors = compact(get(errors, name));
    set(fieldArrayErrors, 'root', error[name]);
    set(errors, name, fieldArrayErrors);
    return errors;
};

var isFileInput = (element) => element.type === 'file';

var isFunction = (value) => typeof value === 'function';

var isHTMLElement = (value) => {
    if (!isWeb) {
        return false;
    }
    const owner = value ? value.ownerDocument : 0;
    return (value instanceof
        (owner && owner.defaultView ? owner.defaultView.HTMLElement : HTMLElement));
};

var isMessage = (value) => isString(value);

var isRadioInput = (element) => element.type === 'radio';

var isRegex = (value) => value instanceof RegExp;

const defaultResult = {
    value: false,
    isValid: false,
};
const validResult = { value: true, isValid: true };
var getCheckboxValue = (options) => {
    if (Array.isArray(options)) {
        if (options.length > 1) {
            const values = options
                .filter((option) => option && option.checked && !option.disabled)
                .map((option) => option.value);
            return { value: values, isValid: !!values.length };
        }
        return options[0].checked && !options[0].disabled
            ? // @ts-expect-error expected to work in the browser
                options[0].attributes && !isUndefined(options[0].attributes.value)
                    ? isUndefined(options[0].value) || options[0].value === ''
                        ? validResult
                        : { value: options[0].value, isValid: true }
                    : validResult
            : defaultResult;
    }
    return defaultResult;
};

const defaultReturn = {
    isValid: false,
    value: null,
};
var getRadioValue = (options) => Array.isArray(options)
    ? options.reduce((previous, option) => option && option.checked && !option.disabled
        ? {
            isValid: true,
            value: option.value,
        }
        : previous, defaultReturn)
    : defaultReturn;

function getValidateError(result, ref, type = 'validate') {
    if (isMessage(result) ||
        (Array.isArray(result) && result.every(isMessage)) ||
        (isBoolean(result) && !result)) {
        return {
            type,
            message: isMessage(result) ? result : '',
            ref,
        };
    }
}

var getValueAndMessage = (validationData) => isObject(validationData) && !isRegex(validationData)
    ? validationData
    : {
        value: validationData,
        message: '',
    };

var validateField = async (field, formValues, validateAllFieldCriteria, shouldUseNativeValidation, isFieldArray) => {
    const { ref, refs, required, maxLength, minLength, min, max, pattern, validate, name, valueAsNumber, mount, disabled, } = field._f;
    const inputValue = get(formValues, name);
    if (!mount || disabled) {
        return {};
    }
    const inputRef = refs ? refs[0] : ref;
    const setCustomValidity = (message) => {
        if (shouldUseNativeValidation && inputRef.reportValidity) {
            inputRef.setCustomValidity(isBoolean(message) ? '' : message || '');
            inputRef.reportValidity();
        }
    };
    const error = {};
    const isRadio = isRadioInput(ref);
    const isCheckBox = isCheckBoxInput(ref);
    const isRadioOrCheckbox = isRadio || isCheckBox;
    const isEmpty = ((valueAsNumber || isFileInput(ref)) &&
        isUndefined(ref.value) &&
        isUndefined(inputValue)) ||
        (isHTMLElement(ref) && ref.value === '') ||
        inputValue === '' ||
        (Array.isArray(inputValue) && !inputValue.length);
    const appendErrorsCurry = appendErrors.bind(null, name, validateAllFieldCriteria, error);
    const getMinMaxMessage = (exceedMax, maxLengthMessage, minLengthMessage, maxType = INPUT_VALIDATION_RULES.maxLength, minType = INPUT_VALIDATION_RULES.minLength) => {
        const message = exceedMax ? maxLengthMessage : minLengthMessage;
        error[name] = {
            type: exceedMax ? maxType : minType,
            message,
            ref,
            ...appendErrorsCurry(exceedMax ? maxType : minType, message),
        };
    };
    if (isFieldArray
        ? !Array.isArray(inputValue) || !inputValue.length
        : required &&
            ((!isRadioOrCheckbox && (isEmpty || isNullOrUndefined(inputValue))) ||
                (isBoolean(inputValue) && !inputValue) ||
                (isCheckBox && !getCheckboxValue(refs).isValid) ||
                (isRadio && !getRadioValue(refs).isValid))) {
        const { value, message } = isMessage(required)
            ? { value: !!required, message: required }
            : getValueAndMessage(required);
        if (value) {
            error[name] = {
                type: INPUT_VALIDATION_RULES.required,
                message,
                ref: inputRef,
                ...appendErrorsCurry(INPUT_VALIDATION_RULES.required, message),
            };
            if (!validateAllFieldCriteria) {
                setCustomValidity(message);
                return error;
            }
        }
    }
    if (!isEmpty && (!isNullOrUndefined(min) || !isNullOrUndefined(max))) {
        let exceedMax;
        let exceedMin;
        const maxOutput = getValueAndMessage(max);
        const minOutput = getValueAndMessage(min);
        if (!isNullOrUndefined(inputValue) && !isNaN(inputValue)) {
            const valueNumber = ref.valueAsNumber ||
                (inputValue ? +inputValue : inputValue);
            if (!isNullOrUndefined(maxOutput.value)) {
                exceedMax = valueNumber > maxOutput.value;
            }
            if (!isNullOrUndefined(minOutput.value)) {
                exceedMin = valueNumber < minOutput.value;
            }
        }
        else {
            const valueDate = ref.valueAsDate || new Date(inputValue);
            const convertTimeToDate = (time) => new Date(new Date().toDateString() + ' ' + time);
            const isTime = ref.type == 'time';
            const isWeek = ref.type == 'week';
            if (isString(maxOutput.value) && inputValue) {
                exceedMax = isTime
                    ? convertTimeToDate(inputValue) > convertTimeToDate(maxOutput.value)
                    : isWeek
                        ? inputValue > maxOutput.value
                        : valueDate > new Date(maxOutput.value);
            }
            if (isString(minOutput.value) && inputValue) {
                exceedMin = isTime
                    ? convertTimeToDate(inputValue) < convertTimeToDate(minOutput.value)
                    : isWeek
                        ? inputValue < minOutput.value
                        : valueDate < new Date(minOutput.value);
            }
        }
        if (exceedMax || exceedMin) {
            getMinMaxMessage(!!exceedMax, maxOutput.message, minOutput.message, INPUT_VALIDATION_RULES.max, INPUT_VALIDATION_RULES.min);
            if (!validateAllFieldCriteria) {
                setCustomValidity(error[name].message);
                return error;
            }
        }
    }
    if ((maxLength || minLength) &&
        !isEmpty &&
        (isString(inputValue) || (isFieldArray && Array.isArray(inputValue)))) {
        const maxLengthOutput = getValueAndMessage(maxLength);
        const minLengthOutput = getValueAndMessage(minLength);
        const exceedMax = !isNullOrUndefined(maxLengthOutput.value) &&
            inputValue.length > +maxLengthOutput.value;
        const exceedMin = !isNullOrUndefined(minLengthOutput.value) &&
            inputValue.length < +minLengthOutput.value;
        if (exceedMax || exceedMin) {
            getMinMaxMessage(exceedMax, maxLengthOutput.message, minLengthOutput.message);
            if (!validateAllFieldCriteria) {
                setCustomValidity(error[name].message);
                return error;
            }
        }
    }
    if (pattern && !isEmpty && isString(inputValue)) {
        const { value: patternValue, message } = getValueAndMessage(pattern);
        if (isRegex(patternValue) && !inputValue.match(patternValue)) {
            error[name] = {
                type: INPUT_VALIDATION_RULES.pattern,
                message,
                ref,
                ...appendErrorsCurry(INPUT_VALIDATION_RULES.pattern, message),
            };
            if (!validateAllFieldCriteria) {
                setCustomValidity(message);
                return error;
            }
        }
    }
    if (validate) {
        if (isFunction(validate)) {
            const result = await validate(inputValue, formValues);
            const validateError = getValidateError(result, inputRef);
            if (validateError) {
                error[name] = {
                    ...validateError,
                    ...appendErrorsCurry(INPUT_VALIDATION_RULES.validate, validateError.message),
                };
                if (!validateAllFieldCriteria) {
                    setCustomValidity(validateError.message);
                    return error;
                }
            }
        }
        else if (isObject(validate)) {
            let validationResult = {};
            for (const key in validate) {
                if (!isEmptyObject(validationResult) && !validateAllFieldCriteria) {
                    break;
                }
                const validateError = getValidateError(await validate[key](inputValue, formValues), inputRef, key);
                if (validateError) {
                    validationResult = {
                        ...validateError,
                        ...appendErrorsCurry(key, validateError.message),
                    };
                    setCustomValidity(validateError.message);
                    if (validateAllFieldCriteria) {
                        error[name] = validationResult;
                    }
                }
            }
            if (!isEmptyObject(validationResult)) {
                error[name] = {
                    ref: inputRef,
                    ...validationResult,
                };
                if (!validateAllFieldCriteria) {
                    return error;
                }
            }
        }
    }
    setCustomValidity(true);
    return error;
};

function baseGet(object, updatePath) {
    const length = updatePath.slice(0, -1).length;
    let index = 0;
    while (index < length) {
        object = isUndefined(object) ? index++ : object[updatePath[index++]];
    }
    return object;
}
function isEmptyArray(obj) {
    for (const key in obj) {
        if (obj.hasOwnProperty(key) && !isUndefined(obj[key])) {
            return false;
        }
    }
    return true;
}
function unset(object, path) {
    const paths = Array.isArray(path)
        ? path
        : isKey(path)
            ? [path]
            : stringToPath(path);
    const childObject = paths.length === 1 ? object : baseGet(object, paths);
    const index = paths.length - 1;
    const key = paths[index];
    if (childObject) {
        delete childObject[key];
    }
    if (index !== 0 &&
        ((isObject(childObject) && isEmptyObject(childObject)) ||
            (Array.isArray(childObject) && isEmptyArray(childObject)))) {
        unset(object, paths.slice(0, -1));
    }
    return object;
}

var createSubject = () => {
    let _observers = [];
    const next = (value) => {
        for (const observer of _observers) {
            observer.next && observer.next(value);
        }
    };
    const subscribe = (observer) => {
        _observers.push(observer);
        return {
            unsubscribe: () => {
                _observers = _observers.filter((o) => o !== observer);
            },
        };
    };
    const unsubscribe = () => {
        _observers = [];
    };
    return {
        get observers() {
            return _observers;
        },
        next,
        subscribe,
        unsubscribe,
    };
};

var isPrimitive = (value) => isNullOrUndefined(value) || !isObjectType(value);

function deepEqual(object1, object2) {
    if (isPrimitive(object1) || isPrimitive(object2)) {
        return object1 === object2;
    }
    if (isDateObject(object1) && isDateObject(object2)) {
        return object1.getTime() === object2.getTime();
    }
    const keys1 = Object.keys(object1);
    const keys2 = Object.keys(object2);
    if (keys1.length !== keys2.length) {
        return false;
    }
    for (const key of keys1) {
        const val1 = object1[key];
        if (!keys2.includes(key)) {
            return false;
        }
        if (key !== 'ref') {
            const val2 = object2[key];
            if ((isDateObject(val1) && isDateObject(val2)) ||
                (isObject(val1) && isObject(val2)) ||
                (Array.isArray(val1) && Array.isArray(val2))
                ? !deepEqual(val1, val2)
                : val1 !== val2) {
                return false;
            }
        }
    }
    return true;
}

var isMultipleSelect = (element) => element.type === `select-multiple`;

var isRadioOrCheckbox = (ref) => isRadioInput(ref) || isCheckBoxInput(ref);

var live = (ref) => isHTMLElement(ref) && ref.isConnected;

var objectHasFunction = (data) => {
    for (const key in data) {
        if (isFunction(data[key])) {
            return true;
        }
    }
    return false;
};

function markFieldsDirty(data, fields = {}) {
    const isParentNodeArray = Array.isArray(data);
    if (isObject(data) || isParentNodeArray) {
        for (const key in data) {
            if (Array.isArray(data[key]) ||
                (isObject(data[key]) && !objectHasFunction(data[key]))) {
                fields[key] = Array.isArray(data[key]) ? [] : {};
                markFieldsDirty(data[key], fields[key]);
            }
            else if (!isNullOrUndefined(data[key])) {
                fields[key] = true;
            }
        }
    }
    return fields;
}
function getDirtyFieldsFromDefaultValues(data, formValues, dirtyFieldsFromValues) {
    const isParentNodeArray = Array.isArray(data);
    if (isObject(data) || isParentNodeArray) {
        for (const key in data) {
            if (Array.isArray(data[key]) ||
                (isObject(data[key]) && !objectHasFunction(data[key]))) {
                if (isUndefined(formValues) ||
                    isPrimitive(dirtyFieldsFromValues[key])) {
                    dirtyFieldsFromValues[key] = Array.isArray(data[key])
                        ? markFieldsDirty(data[key], [])
                        : { ...markFieldsDirty(data[key]) };
                }
                else {
                    getDirtyFieldsFromDefaultValues(data[key], isNullOrUndefined(formValues) ? {} : formValues[key], dirtyFieldsFromValues[key]);
                }
            }
            else {
                dirtyFieldsFromValues[key] = !deepEqual(data[key], formValues[key]);
            }
        }
    }
    return dirtyFieldsFromValues;
}
var getDirtyFields = (defaultValues, formValues) => getDirtyFieldsFromDefaultValues(defaultValues, formValues, markFieldsDirty(formValues));

var getFieldValueAs = (value, { valueAsNumber, valueAsDate, setValueAs }) => isUndefined(value)
    ? value
    : valueAsNumber
        ? value === ''
            ? NaN
            : value
                ? +value
                : value
        : valueAsDate && isString(value)
            ? new Date(value)
            : setValueAs
                ? setValueAs(value)
                : value;

function getFieldValue(_f) {
    const ref = _f.ref;
    if (_f.refs ? _f.refs.every((ref) => ref.disabled) : ref.disabled) {
        return;
    }
    if (isFileInput(ref)) {
        return ref.files;
    }
    if (isRadioInput(ref)) {
        return getRadioValue(_f.refs).value;
    }
    if (isMultipleSelect(ref)) {
        return [...ref.selectedOptions].map(({ value }) => value);
    }
    if (isCheckBoxInput(ref)) {
        return getCheckboxValue(_f.refs).value;
    }
    return getFieldValueAs(isUndefined(ref.value) ? _f.ref.value : ref.value, _f);
}

var getResolverOptions = (fieldsNames, _fields, criteriaMode, shouldUseNativeValidation) => {
    const fields = {};
    for (const name of fieldsNames) {
        const field = get(_fields, name);
        field && set(fields, name, field._f);
    }
    return {
        criteriaMode,
        names: [...fieldsNames],
        fields,
        shouldUseNativeValidation,
    };
};

var getRuleValue = (rule) => isUndefined(rule)
    ? rule
    : isRegex(rule)
        ? rule.source
        : isObject(rule)
            ? isRegex(rule.value)
                ? rule.value.source
                : rule.value
            : rule;

var hasValidation = (options) => options.mount &&
    (options.required ||
        options.min ||
        options.max ||
        options.maxLength ||
        options.minLength ||
        options.pattern ||
        options.validate);

function schemaErrorLookup(errors, _fields, name) {
    const error = get(errors, name);
    if (error || isKey(name)) {
        return {
            error,
            name,
        };
    }
    const names = name.split('.');
    while (names.length) {
        const fieldName = names.join('.');
        const field = get(_fields, fieldName);
        const foundError = get(errors, fieldName);
        if (field && !Array.isArray(field) && name !== fieldName) {
            return { name };
        }
        if (foundError && foundError.type) {
            return {
                name: fieldName,
                error: foundError,
            };
        }
        names.pop();
    }
    return {
        name,
    };
}

var skipValidation = (isBlurEvent, isTouched, isSubmitted, reValidateMode, mode) => {
    if (mode.isOnAll) {
        return false;
    }
    else if (!isSubmitted && mode.isOnTouch) {
        return !(isTouched || isBlurEvent);
    }
    else if (isSubmitted ? reValidateMode.isOnBlur : mode.isOnBlur) {
        return !isBlurEvent;
    }
    else if (isSubmitted ? reValidateMode.isOnChange : mode.isOnChange) {
        return isBlurEvent;
    }
    return true;
};

var unsetEmptyArray = (ref, name) => !compact(get(ref, name)).length && unset(ref, name);

const defaultOptions = {
    mode: VALIDATION_MODE.onSubmit,
    reValidateMode: VALIDATION_MODE.onChange,
    shouldFocusError: true,
};
function createFormControl(props = {}) {
    let _options = {
        ...defaultOptions,
        ...props,
    };
    let _formState = {
        submitCount: 0,
        isDirty: false,
        isLoading: isFunction(_options.defaultValues),
        isValidating: false,
        isSubmitted: false,
        isSubmitting: false,
        isSubmitSuccessful: false,
        isValid: false,
        touchedFields: {},
        dirtyFields: {},
        validatingFields: {},
        errors: _options.errors || {},
        disabled: _options.disabled || false,
    };
    let _fields = {};
    let _defaultValues = isObject(_options.defaultValues) || isObject(_options.values)
        ? cloneObject(_options.defaultValues || _options.values) || {}
        : {};
    let _formValues = _options.shouldUnregister
        ? {}
        : cloneObject(_defaultValues);
    let _state = {
        action: false,
        mount: false,
        watch: false,
    };
    let _names = {
        mount: new Set(),
        unMount: new Set(),
        array: new Set(),
        watch: new Set(),
    };
    let delayErrorCallback;
    let timer = 0;
    const _proxyFormState = {
        isDirty: false,
        dirtyFields: false,
        validatingFields: false,
        touchedFields: false,
        isValidating: false,
        isValid: false,
        errors: false,
    };
    const _subjects = {
        values: createSubject(),
        array: createSubject(),
        state: createSubject(),
    };
    const validationModeBeforeSubmit = getValidationModes(_options.mode);
    const validationModeAfterSubmit = getValidationModes(_options.reValidateMode);
    const shouldDisplayAllAssociatedErrors = _options.criteriaMode === VALIDATION_MODE.all;
    const debounce = (callback) => (wait) => {
        clearTimeout(timer);
        timer = setTimeout(callback, wait);
    };
    const _updateValid = async (shouldUpdateValid) => {
        if (_proxyFormState.isValid || shouldUpdateValid) {
            const isValid = _options.resolver
                ? isEmptyObject((await _executeSchema()).errors)
                : await executeBuiltInValidation(_fields, true);
            if (isValid !== _formState.isValid) {
                _subjects.state.next({
                    isValid,
                });
            }
        }
    };
    const _updateIsValidating = (names, isValidating) => {
        if (_proxyFormState.isValidating || _proxyFormState.validatingFields) {
            (names || Array.from(_names.mount)).forEach((name) => {
                if (name) {
                    isValidating
                        ? set(_formState.validatingFields, name, isValidating)
                        : unset(_formState.validatingFields, name);
                }
            });
            _subjects.state.next({
                validatingFields: _formState.validatingFields,
                isValidating: !isEmptyObject(_formState.validatingFields),
            });
        }
    };
    const _updateFieldArray = (name, values = [], method, args, shouldSetValues = true, shouldUpdateFieldsAndState = true) => {
        if (args && method) {
            _state.action = true;
            if (shouldUpdateFieldsAndState && Array.isArray(get(_fields, name))) {
                const fieldValues = method(get(_fields, name), args.argA, args.argB);
                shouldSetValues && set(_fields, name, fieldValues);
            }
            if (shouldUpdateFieldsAndState &&
                Array.isArray(get(_formState.errors, name))) {
                const errors = method(get(_formState.errors, name), args.argA, args.argB);
                shouldSetValues && set(_formState.errors, name, errors);
                unsetEmptyArray(_formState.errors, name);
            }
            if (_proxyFormState.touchedFields &&
                shouldUpdateFieldsAndState &&
                Array.isArray(get(_formState.touchedFields, name))) {
                const touchedFields = method(get(_formState.touchedFields, name), args.argA, args.argB);
                shouldSetValues && set(_formState.touchedFields, name, touchedFields);
            }
            if (_proxyFormState.dirtyFields) {
                _formState.dirtyFields = getDirtyFields(_defaultValues, _formValues);
            }
            _subjects.state.next({
                name,
                isDirty: _getDirty(name, values),
                dirtyFields: _formState.dirtyFields,
                errors: _formState.errors,
                isValid: _formState.isValid,
            });
        }
        else {
            set(_formValues, name, values);
        }
    };
    const updateErrors = (name, error) => {
        set(_formState.errors, name, error);
        _subjects.state.next({
            errors: _formState.errors,
        });
    };
    const _setErrors = (errors) => {
        _formState.errors = errors;
        _subjects.state.next({
            errors: _formState.errors,
            isValid: false,
        });
    };
    const updateValidAndValue = (name, shouldSkipSetValueAs, value, ref) => {
        const field = get(_fields, name);
        if (field) {
            const defaultValue = get(_formValues, name, isUndefined(value) ? get(_defaultValues, name) : value);
            isUndefined(defaultValue) ||
                (ref && ref.defaultChecked) ||
                shouldSkipSetValueAs
                ? set(_formValues, name, shouldSkipSetValueAs ? defaultValue : getFieldValue(field._f))
                : setFieldValue(name, defaultValue);
            _state.mount && _updateValid();
        }
    };
    const updateTouchAndDirty = (name, fieldValue, isBlurEvent, shouldDirty, shouldRender) => {
        let shouldUpdateField = false;
        let isPreviousDirty = false;
        const output = {
            name,
        };
        const disabledField = !!(get(_fields, name) && get(_fields, name)._f.disabled);
        if (!isBlurEvent || shouldDirty) {
            if (_proxyFormState.isDirty) {
                isPreviousDirty = _formState.isDirty;
                _formState.isDirty = output.isDirty = _getDirty();
                shouldUpdateField = isPreviousDirty !== output.isDirty;
            }
            const isCurrentFieldPristine = disabledField || deepEqual(get(_defaultValues, name), fieldValue);
            isPreviousDirty = !!(!disabledField && get(_formState.dirtyFields, name));
            isCurrentFieldPristine || disabledField
                ? unset(_formState.dirtyFields, name)
                : set(_formState.dirtyFields, name, true);
            output.dirtyFields = _formState.dirtyFields;
            shouldUpdateField =
                shouldUpdateField ||
                    (_proxyFormState.dirtyFields &&
                        isPreviousDirty !== !isCurrentFieldPristine);
        }
        if (isBlurEvent) {
            const isPreviousFieldTouched = get(_formState.touchedFields, name);
            if (!isPreviousFieldTouched) {
                set(_formState.touchedFields, name, isBlurEvent);
                output.touchedFields = _formState.touchedFields;
                shouldUpdateField =
                    shouldUpdateField ||
                        (_proxyFormState.touchedFields &&
                            isPreviousFieldTouched !== isBlurEvent);
            }
        }
        shouldUpdateField && shouldRender && _subjects.state.next(output);
        return shouldUpdateField ? output : {};
    };
    const shouldRenderByError = (name, isValid, error, fieldState) => {
        const previousFieldError = get(_formState.errors, name);
        const shouldUpdateValid = _proxyFormState.isValid &&
            isBoolean(isValid) &&
            _formState.isValid !== isValid;
        if (props.delayError && error) {
            delayErrorCallback = debounce(() => updateErrors(name, error));
            delayErrorCallback(props.delayError);
        }
        else {
            clearTimeout(timer);
            delayErrorCallback = null;
            error
                ? set(_formState.errors, name, error)
                : unset(_formState.errors, name);
        }
        if ((error ? !deepEqual(previousFieldError, error) : previousFieldError) ||
            !isEmptyObject(fieldState) ||
            shouldUpdateValid) {
            const updatedFormState = {
                ...fieldState,
                ...(shouldUpdateValid && isBoolean(isValid) ? { isValid } : {}),
                errors: _formState.errors,
                name,
            };
            _formState = {
                ..._formState,
                ...updatedFormState,
            };
            _subjects.state.next(updatedFormState);
        }
    };
    const _executeSchema = async (name) => {
        _updateIsValidating(name, true);
        const result = await _options.resolver(_formValues, _options.context, getResolverOptions(name || _names.mount, _fields, _options.criteriaMode, _options.shouldUseNativeValidation));
        _updateIsValidating(name);
        return result;
    };
    const executeSchemaAndUpdateState = async (names) => {
        const { errors } = await _executeSchema(names);
        if (names) {
            for (const name of names) {
                const error = get(errors, name);
                error
                    ? set(_formState.errors, name, error)
                    : unset(_formState.errors, name);
            }
        }
        else {
            _formState.errors = errors;
        }
        return errors;
    };
    const executeBuiltInValidation = async (fields, shouldOnlyCheckValid, context = {
        valid: true,
    }) => {
        for (const name in fields) {
            const field = fields[name];
            if (field) {
                const { _f, ...fieldValue } = field;
                if (_f) {
                    const isFieldArrayRoot = _names.array.has(_f.name);
                    _updateIsValidating([name], true);
                    const fieldError = await validateField(field, _formValues, shouldDisplayAllAssociatedErrors, _options.shouldUseNativeValidation && !shouldOnlyCheckValid, isFieldArrayRoot);
                    _updateIsValidating([name]);
                    if (fieldError[_f.name]) {
                        context.valid = false;
                        if (shouldOnlyCheckValid) {
                            break;
                        }
                    }
                    !shouldOnlyCheckValid &&
                        (get(fieldError, _f.name)
                            ? isFieldArrayRoot
                                ? updateFieldArrayRootError(_formState.errors, fieldError, _f.name)
                                : set(_formState.errors, _f.name, fieldError[_f.name])
                            : unset(_formState.errors, _f.name));
                }
                fieldValue &&
                    (await executeBuiltInValidation(fieldValue, shouldOnlyCheckValid, context));
            }
        }
        return context.valid;
    };
    const _removeUnmounted = () => {
        for (const name of _names.unMount) {
            const field = get(_fields, name);
            field &&
                (field._f.refs
                    ? field._f.refs.every((ref) => !live(ref))
                    : !live(field._f.ref)) &&
                unregister(name);
        }
        _names.unMount = new Set();
    };
    const _getDirty = (name, data) => (name && data && set(_formValues, name, data),
        !deepEqual(getValues(), _defaultValues));
    const _getWatch = (names, defaultValue, isGlobal) => generateWatchOutput(names, _names, {
        ...(_state.mount
            ? _formValues
            : isUndefined(defaultValue)
                ? _defaultValues
                : isString(names)
                    ? { [names]: defaultValue }
                    : defaultValue),
    }, isGlobal, defaultValue);
    const _getFieldArray = (name) => compact(get(_state.mount ? _formValues : _defaultValues, name, props.shouldUnregister ? get(_defaultValues, name, []) : []));
    const setFieldValue = (name, value, options = {}) => {
        const field = get(_fields, name);
        let fieldValue = value;
        if (field) {
            const fieldReference = field._f;
            if (fieldReference) {
                !fieldReference.disabled &&
                    set(_formValues, name, getFieldValueAs(value, fieldReference));
                fieldValue =
                    isHTMLElement(fieldReference.ref) && isNullOrUndefined(value)
                        ? ''
                        : value;
                if (isMultipleSelect(fieldReference.ref)) {
                    [...fieldReference.ref.options].forEach((optionRef) => (optionRef.selected = fieldValue.includes(optionRef.value)));
                }
                else if (fieldReference.refs) {
                    if (isCheckBoxInput(fieldReference.ref)) {
                        fieldReference.refs.length > 1
                            ? fieldReference.refs.forEach((checkboxRef) => (!checkboxRef.defaultChecked || !checkboxRef.disabled) &&
                                (checkboxRef.checked = Array.isArray(fieldValue)
                                    ? !!fieldValue.find((data) => data === checkboxRef.value)
                                    : fieldValue === checkboxRef.value))
                            : fieldReference.refs[0] &&
                                (fieldReference.refs[0].checked = !!fieldValue);
                    }
                    else {
                        fieldReference.refs.forEach((radioRef) => (radioRef.checked = radioRef.value === fieldValue));
                    }
                }
                else if (isFileInput(fieldReference.ref)) {
                    fieldReference.ref.value = '';
                }
                else {
                    fieldReference.ref.value = fieldValue;
                    if (!fieldReference.ref.type) {
                        _subjects.values.next({
                            name,
                            values: { ..._formValues },
                        });
                    }
                }
            }
        }
        (options.shouldDirty || options.shouldTouch) &&
            updateTouchAndDirty(name, fieldValue, options.shouldTouch, options.shouldDirty, true);
        options.shouldValidate && trigger(name);
    };
    const setValues = (name, value, options) => {
        for (const fieldKey in value) {
            const fieldValue = value[fieldKey];
            const fieldName = `${name}.${fieldKey}`;
            const field = get(_fields, fieldName);
            (_names.array.has(name) ||
                !isPrimitive(fieldValue) ||
                (field && !field._f)) &&
                !isDateObject(fieldValue)
                ? setValues(fieldName, fieldValue, options)
                : setFieldValue(fieldName, fieldValue, options);
        }
    };
    const setValue = (name, value, options = {}) => {
        const field = get(_fields, name);
        const isFieldArray = _names.array.has(name);
        const cloneValue = cloneObject(value);
        set(_formValues, name, cloneValue);
        if (isFieldArray) {
            _subjects.array.next({
                name,
                values: { ..._formValues },
            });
            if ((_proxyFormState.isDirty || _proxyFormState.dirtyFields) &&
                options.shouldDirty) {
                _subjects.state.next({
                    name,
                    dirtyFields: getDirtyFields(_defaultValues, _formValues),
                    isDirty: _getDirty(name, cloneValue),
                });
            }
        }
        else {
            field && !field._f && !isNullOrUndefined(cloneValue)
                ? setValues(name, cloneValue, options)
                : setFieldValue(name, cloneValue, options);
        }
        isWatched(name, _names) && _subjects.state.next({ ..._formState });
        _subjects.values.next({
            name: _state.mount ? name : undefined,
            values: { ..._formValues },
        });
    };
    const onChange = async (event) => {
        const target = event.target;
        let name = target.name;
        let isFieldValueUpdated = true;
        const field = get(_fields, name);
        const getCurrentFieldValue = () => target.type ? getFieldValue(field._f) : getEventValue(event);
        const _updateIsFieldValueUpdated = (fieldValue) => {
            isFieldValueUpdated =
                Number.isNaN(fieldValue) ||
                    fieldValue === get(_formValues, name, fieldValue);
        };
        if (field) {
            let error;
            let isValid;
            const fieldValue = getCurrentFieldValue();
            const isBlurEvent = event.type === EVENTS.BLUR || event.type === EVENTS.FOCUS_OUT;
            const shouldSkipValidation = (!hasValidation(field._f) &&
                !_options.resolver &&
                !get(_formState.errors, name) &&
                !field._f.deps) ||
                skipValidation(isBlurEvent, get(_formState.touchedFields, name), _formState.isSubmitted, validationModeAfterSubmit, validationModeBeforeSubmit);
            const watched = isWatched(name, _names, isBlurEvent);
            set(_formValues, name, fieldValue);
            if (isBlurEvent) {
                field._f.onBlur && field._f.onBlur(event);
                delayErrorCallback && delayErrorCallback(0);
            }
            else if (field._f.onChange) {
                field._f.onChange(event);
            }
            const fieldState = updateTouchAndDirty(name, fieldValue, isBlurEvent, false);
            const shouldRender = !isEmptyObject(fieldState) || watched;
            !isBlurEvent &&
                _subjects.values.next({
                    name,
                    type: event.type,
                    values: { ..._formValues },
                });
            if (shouldSkipValidation) {
                _proxyFormState.isValid && _updateValid();
                return (shouldRender &&
                    _subjects.state.next({ name, ...(watched ? {} : fieldState) }));
            }
            !isBlurEvent && watched && _subjects.state.next({ ..._formState });
            if (_options.resolver) {
                const { errors } = await _executeSchema([name]);
                _updateIsFieldValueUpdated(fieldValue);
                if (isFieldValueUpdated) {
                    const previousErrorLookupResult = schemaErrorLookup(_formState.errors, _fields, name);
                    const errorLookupResult = schemaErrorLookup(errors, _fields, previousErrorLookupResult.name || name);
                    error = errorLookupResult.error;
                    name = errorLookupResult.name;
                    isValid = isEmptyObject(errors);
                }
            }
            else {
                _updateIsValidating([name], true);
                error = (await validateField(field, _formValues, shouldDisplayAllAssociatedErrors, _options.shouldUseNativeValidation))[name];
                _updateIsValidating([name]);
                _updateIsFieldValueUpdated(fieldValue);
                if (isFieldValueUpdated) {
                    if (error) {
                        isValid = false;
                    }
                    else if (_proxyFormState.isValid) {
                        isValid = await executeBuiltInValidation(_fields, true);
                    }
                }
            }
            if (isFieldValueUpdated) {
                field._f.deps &&
                    trigger(field._f.deps);
                shouldRenderByError(name, isValid, error, fieldState);
            }
        }
    };
    const _focusInput = (ref, key) => {
        if (get(_formState.errors, key) && ref.focus) {
            ref.focus();
            return 1;
        }
        return;
    };
    const trigger = async (name, options = {}) => {
        let isValid;
        let validationResult;
        const fieldNames = convertToArrayPayload(name);
        if (_options.resolver) {
            const errors = await executeSchemaAndUpdateState(isUndefined(name) ? name : fieldNames);
            isValid = isEmptyObject(errors);
            validationResult = name
                ? !fieldNames.some((name) => get(errors, name))
                : isValid;
        }
        else if (name) {
            validationResult = (await Promise.all(fieldNames.map(async (fieldName) => {
                const field = get(_fields, fieldName);
                return await executeBuiltInValidation(field && field._f ? { [fieldName]: field } : field);
            }))).every(Boolean);
            !(!validationResult && !_formState.isValid) && _updateValid();
        }
        else {
            validationResult = isValid = await executeBuiltInValidation(_fields);
        }
        _subjects.state.next({
            ...(!isString(name) ||
                (_proxyFormState.isValid && isValid !== _formState.isValid)
                ? {}
                : { name }),
            ...(_options.resolver || !name ? { isValid } : {}),
            errors: _formState.errors,
        });
        options.shouldFocus &&
            !validationResult &&
            iterateFieldsByAction(_fields, _focusInput, name ? fieldNames : _names.mount);
        return validationResult;
    };
    const getValues = (fieldNames) => {
        const values = {
            ..._defaultValues,
            ...(_state.mount ? _formValues : {}),
        };
        return isUndefined(fieldNames)
            ? values
            : isString(fieldNames)
                ? get(values, fieldNames)
                : fieldNames.map((name) => get(values, name));
    };
    const getFieldState = (name, formState) => ({
        invalid: !!get((formState || _formState).errors, name),
        isDirty: !!get((formState || _formState).dirtyFields, name),
        isTouched: !!get((formState || _formState).touchedFields, name),
        isValidating: !!get((formState || _formState).validatingFields, name),
        error: get((formState || _formState).errors, name),
    });
    const clearErrors = (name) => {
        name &&
            convertToArrayPayload(name).forEach((inputName) => unset(_formState.errors, inputName));
        _subjects.state.next({
            errors: name ? _formState.errors : {},
        });
    };
    const setError = (name, error, options) => {
        const ref = (get(_fields, name, { _f: {} })._f || {}).ref;
        set(_formState.errors, name, {
            ...error,
            ref,
        });
        _subjects.state.next({
            name,
            errors: _formState.errors,
            isValid: false,
        });
        options && options.shouldFocus && ref && ref.focus && ref.focus();
    };
    const watch = (name, defaultValue) => isFunction(name)
        ? _subjects.values.subscribe({
            next: (payload) => name(_getWatch(undefined, defaultValue), payload),
        })
        : _getWatch(name, defaultValue, true);
    const unregister = (name, options = {}) => {
        for (const fieldName of name ? convertToArrayPayload(name) : _names.mount) {
            _names.mount.delete(fieldName);
            _names.array.delete(fieldName);
            if (!options.keepValue) {
                unset(_fields, fieldName);
                unset(_formValues, fieldName);
            }
            !options.keepError && unset(_formState.errors, fieldName);
            !options.keepDirty && unset(_formState.dirtyFields, fieldName);
            !options.keepTouched && unset(_formState.touchedFields, fieldName);
            !options.keepIsValidating &&
                unset(_formState.validatingFields, fieldName);
            !_options.shouldUnregister &&
                !options.keepDefaultValue &&
                unset(_defaultValues, fieldName);
        }
        _subjects.values.next({
            values: { ..._formValues },
        });
        _subjects.state.next({
            ..._formState,
            ...(!options.keepDirty ? {} : { isDirty: _getDirty() }),
        });
        !options.keepIsValid && _updateValid();
    };
    const _updateDisabledField = ({ disabled, name, field, fields, value, }) => {
        if (isBoolean(disabled)) {
            const inputValue = disabled
                ? undefined
                : isUndefined(value)
                    ? getFieldValue(field ? field._f : get(fields, name)._f)
                    : value;
            set(_formValues, name, inputValue);
            updateTouchAndDirty(name, inputValue, false, false, true);
        }
    };
    const register = (name, options = {}) => {
        let field = get(_fields, name);
        const disabledIsDefined = isBoolean(options.disabled);
        set(_fields, name, {
            ...(field || {}),
            _f: {
                ...(field && field._f ? field._f : { ref: { name } }),
                name,
                mount: true,
                ...options,
            },
        });
        _names.mount.add(name);
        if (field) {
            _updateDisabledField({
                field,
                disabled: options.disabled,
                name,
                value: options.value,
            });
        }
        else {
            updateValidAndValue(name, true, options.value);
        }
        return {
            ...(disabledIsDefined ? { disabled: options.disabled } : {}),
            ...(_options.progressive
                ? {
                    required: !!options.required,
                    min: getRuleValue(options.min),
                    max: getRuleValue(options.max),
                    minLength: getRuleValue(options.minLength),
                    maxLength: getRuleValue(options.maxLength),
                    pattern: getRuleValue(options.pattern),
                }
                : {}),
            name,
            onChange,
            onBlur: onChange,
            ref: (ref) => {
                if (ref) {
                    register(name, options);
                    field = get(_fields, name);
                    const fieldRef = isUndefined(ref.value)
                        ? ref.querySelectorAll
                            ? ref.querySelectorAll('input,select,textarea')[0] || ref
                            : ref
                        : ref;
                    const radioOrCheckbox = isRadioOrCheckbox(fieldRef);
                    const refs = field._f.refs || [];
                    if (radioOrCheckbox
                        ? refs.find((option) => option === fieldRef)
                        : fieldRef === field._f.ref) {
                        return;
                    }
                    set(_fields, name, {
                        _f: {
                            ...field._f,
                            ...(radioOrCheckbox
                                ? {
                                    refs: [
                                        ...refs.filter(live),
                                        fieldRef,
                                        ...(Array.isArray(get(_defaultValues, name)) ? [{}] : []),
                                    ],
                                    ref: { type: fieldRef.type, name },
                                }
                                : { ref: fieldRef }),
                        },
                    });
                    updateValidAndValue(name, false, undefined, fieldRef);
                }
                else {
                    field = get(_fields, name, {});
                    if (field._f) {
                        field._f.mount = false;
                    }
                    (_options.shouldUnregister || options.shouldUnregister) &&
                        !(isNameInFieldArray(_names.array, name) && _state.action) &&
                        _names.unMount.add(name);
                }
            },
        };
    };
    const _focusError = () => _options.shouldFocusError &&
        iterateFieldsByAction(_fields, _focusInput, _names.mount);
    const _disableForm = (disabled) => {
        if (isBoolean(disabled)) {
            _subjects.state.next({ disabled });
            iterateFieldsByAction(_fields, (ref, name) => {
                let requiredDisabledState = disabled;
                const currentField = get(_fields, name);
                if (currentField && isBoolean(currentField._f.disabled)) {
                    requiredDisabledState || (requiredDisabledState = currentField._f.disabled);
                }
                ref.disabled = requiredDisabledState;
            }, 0, false);
        }
    };
    const handleSubmit = (onValid, onInvalid) => async (e) => {
        let onValidError = undefined;
        if (e) {
            e.preventDefault && e.preventDefault();
            e.persist && e.persist();
        }
        let fieldValues = cloneObject(_formValues);
        _subjects.state.next({
            isSubmitting: true,
        });
        if (_options.resolver) {
            const { errors, values } = await _executeSchema();
            _formState.errors = errors;
            fieldValues = values;
        }
        else {
            await executeBuiltInValidation(_fields);
        }
        unset(_formState.errors, 'root');
        if (isEmptyObject(_formState.errors)) {
            _subjects.state.next({
                errors: {},
            });
            try {
                await onValid(fieldValues, e);
            }
            catch (error) {
                onValidError = error;
            }
        }
        else {
            if (onInvalid) {
                await onInvalid({ ..._formState.errors }, e);
            }
            _focusError();
            setTimeout(_focusError);
        }
        _subjects.state.next({
            isSubmitted: true,
            isSubmitting: false,
            isSubmitSuccessful: isEmptyObject(_formState.errors) && !onValidError,
            submitCount: _formState.submitCount + 1,
            errors: _formState.errors,
        });
        if (onValidError) {
            throw onValidError;
        }
    };
    const resetField = (name, options = {}) => {
        if (get(_fields, name)) {
            if (isUndefined(options.defaultValue)) {
                setValue(name, cloneObject(get(_defaultValues, name)));
            }
            else {
                setValue(name, options.defaultValue);
                set(_defaultValues, name, cloneObject(options.defaultValue));
            }
            if (!options.keepTouched) {
                unset(_formState.touchedFields, name);
            }
            if (!options.keepDirty) {
                unset(_formState.dirtyFields, name);
                _formState.isDirty = options.defaultValue
                    ? _getDirty(name, cloneObject(get(_defaultValues, name)))
                    : _getDirty();
            }
            if (!options.keepError) {
                unset(_formState.errors, name);
                _proxyFormState.isValid && _updateValid();
            }
            _subjects.state.next({ ..._formState });
        }
    };
    const _reset = (formValues, keepStateOptions = {}) => {
        const updatedValues = formValues ? cloneObject(formValues) : _defaultValues;
        const cloneUpdatedValues = cloneObject(updatedValues);
        const isEmptyResetValues = isEmptyObject(formValues);
        const values = isEmptyResetValues ? _defaultValues : cloneUpdatedValues;
        if (!keepStateOptions.keepDefaultValues) {
            _defaultValues = updatedValues;
        }
        if (!keepStateOptions.keepValues) {
            if (keepStateOptions.keepDirtyValues) {
                for (const fieldName of _names.mount) {
                    get(_formState.dirtyFields, fieldName)
                        ? set(values, fieldName, get(_formValues, fieldName))
                        : setValue(fieldName, get(values, fieldName));
                }
            }
            else {
                if (isWeb && isUndefined(formValues)) {
                    for (const name of _names.mount) {
                        const field = get(_fields, name);
                        if (field && field._f) {
                            const fieldReference = Array.isArray(field._f.refs)
                                ? field._f.refs[0]
                                : field._f.ref;
                            if (isHTMLElement(fieldReference)) {
                                const form = fieldReference.closest('form');
                                if (form) {
                                    form.reset();
                                    break;
                                }
                            }
                        }
                    }
                }
                _fields = {};
            }
            _formValues = props.shouldUnregister
                ? keepStateOptions.keepDefaultValues
                    ? cloneObject(_defaultValues)
                    : {}
                : cloneObject(values);
            _subjects.array.next({
                values: { ...values },
            });
            _subjects.values.next({
                values: { ...values },
            });
        }
        _names = {
            mount: keepStateOptions.keepDirtyValues ? _names.mount : new Set(),
            unMount: new Set(),
            array: new Set(),
            watch: new Set(),
            watchAll: false,
            focus: '',
        };
        _state.mount =
            !_proxyFormState.isValid ||
                !!keepStateOptions.keepIsValid ||
                !!keepStateOptions.keepDirtyValues;
        _state.watch = !!props.shouldUnregister;
        _subjects.state.next({
            submitCount: keepStateOptions.keepSubmitCount
                ? _formState.submitCount
                : 0,
            isDirty: isEmptyResetValues
                ? false
                : keepStateOptions.keepDirty
                    ? _formState.isDirty
                    : !!(keepStateOptions.keepDefaultValues &&
                        !deepEqual(formValues, _defaultValues)),
            isSubmitted: keepStateOptions.keepIsSubmitted
                ? _formState.isSubmitted
                : false,
            dirtyFields: isEmptyResetValues
                ? []
                : keepStateOptions.keepDirtyValues
                    ? keepStateOptions.keepDefaultValues && _formValues
                        ? getDirtyFields(_defaultValues, _formValues)
                        : _formState.dirtyFields
                    : keepStateOptions.keepDefaultValues && formValues
                        ? getDirtyFields(_defaultValues, formValues)
                        : {},
            touchedFields: keepStateOptions.keepTouched
                ? _formState.touchedFields
                : {},
            errors: keepStateOptions.keepErrors ? _formState.errors : {},
            isSubmitSuccessful: keepStateOptions.keepIsSubmitSuccessful
                ? _formState.isSubmitSuccessful
                : false,
            isSubmitting: false,
        });
    };
    const reset = (formValues, keepStateOptions) => _reset(isFunction(formValues)
        ? formValues(_formValues)
        : formValues, keepStateOptions);
    const setFocus = (name, options = {}) => {
        const field = get(_fields, name);
        const fieldReference = field && field._f;
        if (fieldReference) {
            const fieldRef = fieldReference.refs
                ? fieldReference.refs[0]
                : fieldReference.ref;
            if (fieldRef.focus) {
                fieldRef.focus();
                options.shouldSelect && fieldRef.select();
            }
        }
    };
    const _updateFormState = (updatedFormState) => {
        _formState = {
            ..._formState,
            ...updatedFormState,
        };
    };
    const _resetDefaultValues = () => isFunction(_options.defaultValues) &&
        _options.defaultValues().then((values) => {
            reset(values, _options.resetOptions);
            _subjects.state.next({
                isLoading: false,
            });
        });
    return {
        control: {
            register,
            unregister,
            getFieldState,
            handleSubmit,
            setError,
            _executeSchema,
            _getWatch,
            _getDirty,
            _updateValid,
            _removeUnmounted,
            _updateFieldArray,
            _updateDisabledField,
            _getFieldArray,
            _reset,
            _resetDefaultValues,
            _updateFormState,
            _disableForm,
            _subjects,
            _proxyFormState,
            _setErrors,
            get _fields() {
                return _fields;
            },
            get _formValues() {
                return _formValues;
            },
            get _state() {
                return _state;
            },
            set _state(value) {
                _state = value;
            },
            get _defaultValues() {
                return _defaultValues;
            },
            get _names() {
                return _names;
            },
            set _names(value) {
                _names = value;
            },
            get _formState() {
                return _formState;
            },
            set _formState(value) {
                _formState = value;
            },
            get _options() {
                return _options;
            },
            set _options(value) {
                _options = {
                    ..._options,
                    ...value,
                };
            },
        },
        trigger,
        register,
        handleSubmit,
        watch,
        setValue,
        getValues,
        reset,
        resetField,
        clearErrors,
        unregister,
        setError,
        setFocus,
        getFieldState,
    };
}

/**
 * Custom hook to manage the entire form.
 *
 * @remarks
 * [API](https://react-hook-form.com/docs/useform) • [Demo](https://codesandbox.io/s/react-hook-form-get-started-ts-5ksmm) • [Video](https://www.youtube.com/watch?v=RkXv4AXXC_4)
 *
 * @param props - form configuration and validation parameters.
 *
 * @returns methods - individual functions to manage the form state. {@link UseFormReturn}
 *
 * @example
 * ```tsx
 * function App() {
 *   const { register, handleSubmit, watch, formState: { errors } } = useForm();
 *   const onSubmit = data => console.log(data);
 *
 *   console.log(watch("example"));
 *
 *   return (
 *     <form onSubmit={handleSubmit(onSubmit)}>
 *       <input defaultValue="test" {...register("example")} />
 *       <input {...register("exampleRequired", { required: true })} />
 *       {errors.exampleRequired && <span>This field is required</span>}
 *       <button>Submit</button>
 *     </form>
 *   );
 * }
 * ```
 */
function useForm(props = {}) {
    const _formControl = React.useRef();
    const _values = React.useRef();
    const [formState, updateFormState] = React.useState({
        isDirty: false,
        isValidating: false,
        isLoading: isFunction(props.defaultValues),
        isSubmitted: false,
        isSubmitting: false,
        isSubmitSuccessful: false,
        isValid: false,
        submitCount: 0,
        dirtyFields: {},
        touchedFields: {},
        validatingFields: {},
        errors: props.errors || {},
        disabled: props.disabled || false,
        defaultValues: isFunction(props.defaultValues)
            ? undefined
            : props.defaultValues,
    });
    if (!_formControl.current) {
        _formControl.current = {
            ...createFormControl(props),
            formState,
        };
    }
    const control = _formControl.current.control;
    control._options = props;
    useSubscribe({
        subject: control._subjects.state,
        next: (value) => {
            if (shouldRenderFormState(value, control._proxyFormState, control._updateFormState, true)) {
                updateFormState({ ...control._formState });
            }
        },
    });
    React.useEffect(() => control._disableForm(props.disabled), [control, props.disabled]);
    React.useEffect(() => {
        if (control._proxyFormState.isDirty) {
            const isDirty = control._getDirty();
            if (isDirty !== formState.isDirty) {
                control._subjects.state.next({
                    isDirty,
                });
            }
        }
    }, [control, formState.isDirty]);
    React.useEffect(() => {
        if (props.values && !deepEqual(props.values, _values.current)) {
            control._reset(props.values, control._options.resetOptions);
            _values.current = props.values;
            updateFormState((state) => ({ ...state }));
        }
        else {
            control._resetDefaultValues();
        }
    }, [props.values, control]);
    React.useEffect(() => {
        if (props.errors) {
            control._setErrors(props.errors);
        }
    }, [props.errors, control]);
    React.useEffect(() => {
        if (!control._state.mount) {
            control._updateValid();
            control._state.mount = true;
        }
        if (control._state.watch) {
            control._state.watch = false;
            control._subjects.state.next({ ...control._formState });
        }
        control._removeUnmounted();
    });
    React.useEffect(() => {
        props.shouldUnregister &&
            control._subjects.values.next({
                values: control._getWatch(),
            });
    }, [props.shouldUnregister, control]);
    _formControl.current.formState = getProxyFormState(formState, control);
    return _formControl.current;
}

var t$1=function(e,t,i){if(e&&"reportValidity"in e){var n=get(i,t);e.setCustomValidity(n&&n.message||""),e.reportValidity();}},i=function(r,e){var i=function(i){var n=e.fields[i];n&&n.ref&&"reportValidity"in n.ref?t$1(n.ref,i,r):n.refs&&n.refs.forEach(function(e){return t$1(e,i,r)});};for(var n in e.fields)i(n);},n$1=function(t,n){n.shouldUseNativeValidation&&i(t,n);var f={};for(var a in t){var s=get(n.fields,a),u=Object.assign(t[a]||{},{ref:s&&s.ref});if(o(n.names||Object.keys(t),a)){var c=Object.assign({},get(f,a));set(c,"root",u),set(f,a,c);}else set(f,a,u);}return f},o=function(r,e){return r.some(function(r){return r.startsWith(e+".")})};

var n=function(e,o){for(var n={};e.length;){var t=e[0],s=t.code,i=t.message,a=t.path.join(".");if(!n[a])if("unionErrors"in t){var u=t.unionErrors[0].errors[0];n[a]={message:u.message,type:u.code};}else n[a]={message:i,type:s};if("unionErrors"in t&&t.unionErrors.forEach(function(r){return r.errors.forEach(function(r){return e.push(r)})}),o){var c=n[a].types,f=c&&c[t.code];n[a]=appendErrors(a,o,n,s,f?[].concat(f,t.message):t.message);}e.shift();}return n},t=function(r,t,s){return void 0===s&&(s={}),function(i$1,a,u){try{return Promise.resolve(function(o,n){try{var a=Promise.resolve(r["sync"===s.mode?"parse":"parseAsync"](i$1,t)).then(function(r){return u.shouldUseNativeValidation&&i({},u),{errors:{},values:s.raw?i$1:r}});}catch(r){return n(r)}return a&&a.then?a.then(void 0,n):a}(0,function(r){if(function(r){return null!=r.errors}(r))return {values:{},errors:n$1(n(r.errors,!u.shouldUseNativeValidation&&"all"===u.criteriaMode),u)};throw r}))}catch(r){return Promise.reject(r)}}};

const $b73a6c6685e72184$export$b04be29aa201d4f5 = /*#__PURE__*/ reactExports.forwardRef((props, forwardedRef)=>{
    return /*#__PURE__*/ reactExports.createElement($8927f6f2acc4f386$export$250ffa63cdc0d034.label, _extends({}, props, {
        ref: forwardedRef,
        onMouseDown: (event)=>{
            var _props$onMouseDown;
            (_props$onMouseDown = props.onMouseDown) === null || _props$onMouseDown === void 0 || _props$onMouseDown.call(props, event); // prevent text selection when double clicking label
            if (!event.defaultPrevented && event.detail > 1) event.preventDefault();
        }
    }));
});
/* -----------------------------------------------------------------------------------------------*/ const $b73a6c6685e72184$export$be92b6f5f03c0fe9 = $b73a6c6685e72184$export$b04be29aa201d4f5;

const labelVariants = cva(
  "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
);
const Label = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  $b73a6c6685e72184$export$be92b6f5f03c0fe9,
  {
    ref,
    className: cn(labelVariants(), className),
    ...props
  }
));
Label.displayName = $b73a6c6685e72184$export$be92b6f5f03c0fe9.displayName;

const Form = FormProvider;
const FormFieldContext = reactExports.createContext(
  {}
);
const FormField = ({
  ...props
}) => {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(FormFieldContext.Provider, { value: { name: props.name }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Controller, { ...props }) });
};
const useFormField = () => {
  const fieldContext = reactExports.useContext(FormFieldContext);
  const itemContext = reactExports.useContext(FormItemContext);
  const { getFieldState, formState } = useFormContext();
  const fieldState = getFieldState(fieldContext.name, formState);
  if (!fieldContext) {
    throw new Error("useFormField should be used within <FormField>");
  }
  const { id } = itemContext;
  return {
    id,
    name: fieldContext.name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    ...fieldState
  };
};
const FormItemContext = reactExports.createContext(
  {}
);
const FormItem = reactExports.forwardRef(({ className, ...props }, ref) => {
  const id = reactExports.useId();
  return /* @__PURE__ */ jsxRuntimeExports.jsx(FormItemContext.Provider, { value: { id }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { ref, className: cn("space-y-2", className), ...props }) });
});
FormItem.displayName = "FormItem";
const FormLabel = reactExports.forwardRef(({ className, ...props }, ref) => {
  const { error, formItemId } = useFormField();
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Label,
    {
      ref,
      className: cn(error && "text-destructive", className),
      htmlFor: formItemId,
      ...props
    }
  );
});
FormLabel.displayName = "FormLabel";
const FormControl = reactExports.forwardRef(({ ...props }, ref) => {
  const { error, formItemId, formDescriptionId, formMessageId } = useFormField();
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    $5e63c961fc1ce211$export$8c6ed5c666ac1360,
    {
      ref,
      id: formItemId,
      "aria-describedby": !error ? `${formDescriptionId}` : `${formDescriptionId} ${formMessageId}`,
      "aria-invalid": !!error,
      ...props
    }
  );
});
FormControl.displayName = "FormControl";
const FormDescription = reactExports.forwardRef(({ className, ...props }, ref) => {
  const { formDescriptionId } = useFormField();
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "p",
    {
      ref,
      id: formDescriptionId,
      className: cn("text-sm text-muted-foreground", className),
      ...props
    }
  );
});
FormDescription.displayName = "FormDescription";
const FormMessage = reactExports.forwardRef(({ className, children, ...props }, ref) => {
  const { error, formMessageId } = useFormField();
  const body = error ? String(error?.message) : children;
  if (!body) {
    return null;
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "p",
    {
      ref,
      id: formMessageId,
      className: cn("text-sm font-medium text-destructive", className),
      ...props,
      children: body
    }
  );
});
FormMessage.displayName = "FormMessage";

var __defProp = Object.defineProperty;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __async = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};
function createStore(store2) {
  return (stateUpdater, callbacks) => {
    return new Proxy(store2, {
      get(target, prop, receiver) {
        if (prop === "size") {
          return target.size;
        }
        const value = Reflect.get(target, prop, receiver);
        if (value instanceof Function) {
          return function(...args) {
            var _a2;
            const result = value.apply(target, args);
            const shouldTriggerUpdate = args[args.length - 1] === true;
            if (shouldTriggerUpdate) {
              stateUpdater((prev) => prev + 1);
            }
            if (prop === "set") {
              return result.get(args[0]);
            }
            if (callbacks && callbacks[prop]) {
              (_a2 = callbacks[prop]) == null ? void 0 : _a2.call(callbacks, result);
            }
            return result;
          };
        }
        return value;
      }
    });
  };
}
function useStore(store2, callbacks) {
  const [, forceUpdate] = reactExports.useState(0);
  const triggerUpdate = reactExports.useCallback(() => forceUpdate((prev) => prev + 1), []);
  const state = reactExports.useMemo(() => store2(triggerUpdate, callbacks), []);
  return {
    state
  };
}
var audioContainers = [
  "ogg",
  "aac",
  "flac",
  "wav",
  "mp4"
];
var videoContainers = [
  "webm",
  "mp4",
  "x-matroska",
  "3gpp",
  "3gpp2",
  "3gp2",
  "quicktime",
  "mpeg"
];
var audioCodecs = ["opus", "pcm", "aac", "mp4a"];
var videoCodecs = [
  "vp9",
  "vp8",
  "avc1",
  "av1",
  "h265",
  "h.264",
  "h264",
  "mpeg"
];
function getSupportedMediaFormats(containers, codecs, type) {
  return containers.reduce(
    (acc, container) => {
      codecs.forEach((codec) => {
        const mimeType = `${type}/${container};codecs=${codec}`;
        if (typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(mimeType)) {
          acc.mimeType.push(mimeType);
          acc.codec.push(codec);
          acc.container.push(container);
        }
      });
      return acc;
    },
    { mimeType: [], codec: [], container: [] }
  );
}
var supportedAudioCodecs = getSupportedMediaFormats(
  audioContainers,
  audioCodecs,
  "audio"
);
var supportedVideoCodecs = getSupportedMediaFormats(
  videoContainers,
  videoCodecs,
  "video"
);
var videoContainer = supportedVideoCodecs.container[0];
var videoCodec = supportedVideoCodecs.codec[0];
var _a;
var audioCodec = (_a = supportedAudioCodecs == null ? void 0 : supportedAudioCodecs.codec) == null ? void 0 : _a[0];
var defaultCodec = `video/${videoContainer};codecs=${videoCodec}${audioCodec ? `,${audioCodec}` : ""}`;

// src/useRecordingStore.ts
var ERROR_MESSAGES = {
  CODEC_NOT_SUPPORTED: "CODEC_NOT_SUPPORTED",
  SESSION_EXISTS: "SESSION_EXISTS",
  NO_RECORDING_WITH_ID: "NO_RECORDING_WITH_ID",
  NO_USER_PERMISSION: "NO_USER_PERMISSION"
};
var STATUS = {
  INITIAL: "INITIAL",
  CLOSED: "CLOSED",
  OPEN: "OPEN",
  RECORDING: "RECORDING",
  STOPPED: "STOPPED",
  ERROR: "ERROR",
  PAUSED: "PAUSED"
};
function createRecording({
  videoId,
  audioId,
  videoLabel,
  audioLabel
}) {
  const recordingId = `${videoId}-${audioId}`;
  const recording = {
    id: recordingId,
    audioId,
    audioLabel,
    blobChunks: [],
    fileName: String((/* @__PURE__ */ new Date()).getTime()),
    fileType: "webm",
    isMuted: false,
    mimeType: defaultCodec,
    objectURL: null,
    previewRef: reactExports.createRef(),
    recorder: null,
    status: STATUS.INITIAL,
    videoId,
    videoLabel,
    webcamRef: reactExports.createRef()
  };
  return recording;
}
var recordingMap = /* @__PURE__ */ new Map();
var store = createStore(recordingMap);
function useRecordingStore() {
  var _a2;
  const { state } = useStore(store);
  const activeRecordings = Array.from((_a2 = recordingMap == null ? void 0 : recordingMap.values) == null ? void 0 : _a2.call(recordingMap));
  const clearAllRecordings = () => __async(this, null, function* () {
    Array.from(state.values()).forEach((recording) => {
      var _a3;
      const stream = (_a3 = recording.webcamRef.current) == null ? void 0 : _a3.srcObject;
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    });
    state.clear(true);
  });
  const isRecordingCreated = (recordingId) => {
    const isCreated = state.get(recordingId);
    return Boolean(isCreated);
  };
  const getRecording = (recordingId) => {
    const recording = state.get(recordingId);
    if (!recording) {
      throw new Error(ERROR_MESSAGES.NO_RECORDING_WITH_ID);
    }
    return recording;
  };
  const setRecording = (params) => __async(this, null, function* () {
    const recording = createRecording(params);
    const newRecording = state.set(recording.id, recording, true);
    return newRecording;
  });
  const updateRecording = (recordingId, updatedValues) => __async(this, null, function* () {
    const recording = state.get(recordingId);
    const updatedRecording = state.set(
      recordingId,
      __spreadValues(__spreadValues({}, recording), updatedValues),
      true
    );
    return updatedRecording;
  });
  const deleteRecording = (recordingId) => __async(this, null, function* () {
    state.delete(recordingId, true);
  });
  return {
    activeRecordings,
    clearAllRecordings,
    deleteRecording,
    getRecording,
    isRecordingCreated,
    setRecording,
    updateRecording
  };
}

// src/devices.ts
function byId(devices) {
  return devices.reduce(
    (result, { deviceId, kind, label }) => {
      if (kind === "videoinput" || kind === "audioinput") {
        result[deviceId] = {
          label,
          type: kind
        };
      }
      return result;
    },
    {}
  );
}
function byType(devices) {
  return devices.reduce(
    (result, { deviceId, kind, label }) => {
      if (kind === "videoinput") {
        result.video.push({ label, deviceId });
      }
      if (kind === "audioinput") {
        result.audio.push({ label, deviceId });
      }
      return result;
    },
    {
      video: [],
      audio: []
    }
  );
}
function getUserPermission() {
  return __async(this, null, function* () {
    try {
      const stream = yield navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true
      });
      const mediaDevices = yield navigator.mediaDevices.enumerateDevices();
      stream.getTracks().forEach((track) => {
        track.stop();
      });
      return mediaDevices;
    } catch (error) {
      throw new Error(ERROR_MESSAGES.NO_USER_PERMISSION);
    }
  });
}
function getDevices() {
  return __async(this, null, function* () {
    let devicesByType = {
      video: [],
      audio: []
    };
    let devicesById = {};
    let initialDevices = {
      video: null,
      audio: null
    };
    if (typeof window !== "undefined") {
      const mediaDevices = yield getUserPermission();
      devicesById = byId(mediaDevices);
      devicesByType = byType(mediaDevices);
      initialDevices = {
        video: {
          deviceId: devicesByType.video[0].deviceId,
          label: devicesByType.video[0].label
        },
        audio: {
          deviceId: devicesByType.audio[0].deviceId,
          label: devicesByType.audio[0].label
        }
      };
    }
    return { devicesByType, devicesById, initialDevices };
  });
}
var DEFAULT_RECORDER_OPTIONS = {
  audioBitsPerSecond: 128e3,
  videoBitsPerSecond: 25e5,
  mimeType: defaultCodec
};
function useRecorder({
  mediaRecorderOptions,
  options,
  devices,
  handleError
}) {
  const {
    activeRecordings,
    clearAllRecordings,
    deleteRecording,
    getRecording,
    isRecordingCreated,
    setRecording,
    updateRecording
  } = useRecordingStore();
  const recorderOptions = reactExports.useMemo(
    () => __spreadValues(__spreadValues({}, DEFAULT_RECORDER_OPTIONS), mediaRecorderOptions),
    [mediaRecorderOptions]
  );
  const startRecording = (recordingId) => __async(this, null, function* () {
    var _a2;
    try {
      const recording = getRecording(recordingId);
      const stream = (_a2 = recording.webcamRef.current) == null ? void 0 : _a2.srcObject;
      recording.mimeType = recorderOptions.mimeType || recording.mimeType;
      const isCodecSupported = MediaRecorder.isTypeSupported(
        recording.mimeType
      );
      if (!isCodecSupported) {
        console.warn("Codec not supported: ", recording.mimeType);
        handleError("startRecording", ERROR_MESSAGES.CODEC_NOT_SUPPORTED);
      }
      recording.recorder = new MediaRecorder(stream, recorderOptions);
      return yield new Promise((resolve) => {
        var _a3;
        if (recording.recorder) {
          recording.recorder.ondataavailable = (event) => {
            if (event.data.size) {
              recording.blobChunks.push(event.data);
            }
          };
          recording.recorder.onstart = () => __async(this, null, function* () {
            recording.status = STATUS.RECORDING;
            const updated = yield updateRecording(recording.id, recording);
            resolve(updated);
          });
          recording.recorder.onerror = (error) => {
            if (recordingId) {
              const recording2 = getRecording(recordingId);
              if (recording2)
                recording2.status = STATUS.ERROR;
            }
            handleError("startRecording", error);
          };
          (_a3 = recording.recorder) == null ? void 0 : _a3.start(options == null ? void 0 : options.timeSlice);
        }
      });
    } catch (error) {
      if (recordingId) {
        const recording = getRecording(recordingId);
        if (recording)
          recording.status = STATUS.ERROR;
      }
      handleError("startRecording", error);
    }
  });
  const pauseRecording = (recordingId) => __async(this, null, function* () {
    var _a2, _b;
    try {
      const recording = getRecording(recordingId);
      (_a2 = recording.recorder) == null ? void 0 : _a2.pause();
      if (((_b = recording.recorder) == null ? void 0 : _b.state) === "paused") {
        recording.status = STATUS.PAUSED;
        const updated = yield updateRecording(recording.id, recording);
        return updated;
      }
    } catch (error) {
      if (recordingId) {
        const recording = getRecording(recordingId);
        if (recording)
          recording.status = STATUS.ERROR;
      }
      handleError("pauseRecording", error);
    }
  });
  const resumeRecording = (recordingId) => __async(this, null, function* () {
    var _a2, _b;
    try {
      const recording = getRecording(recordingId);
      (_a2 = recording.recorder) == null ? void 0 : _a2.resume();
      if (((_b = recording.recorder) == null ? void 0 : _b.state) === "recording") {
        recording.status = STATUS.RECORDING;
        const updated = yield updateRecording(recording.id, recording);
        return updated;
      }
    } catch (error) {
      if (recordingId) {
        const recording = getRecording(recordingId);
        if (recording)
          recording.status = STATUS.ERROR;
      }
      if (recordingId) {
        const recording = getRecording(recordingId);
        if (recording)
          recording.status = STATUS.ERROR;
      }
      handleError("resumeRecording", error);
    }
  });
  const stopRecording = (recordingId) => __async(this, null, function* () {
    var _a2;
    try {
      const recording = getRecording(recordingId);
      (_a2 = recording.recorder) == null ? void 0 : _a2.stop();
      return yield new Promise((resolve) => {
        if (recording.recorder) {
          recording.recorder.onstop = () => __async(this, null, function* () {
            recording.status = STATUS.STOPPED;
            const blob = new Blob(recording.blobChunks, {
              type: recording.mimeType
            });
            const url = URL.createObjectURL(blob);
            recording.blob = blob;
            recording.objectURL = url;
            if (recording.previewRef.current) {
              recording.previewRef.current.src = url;
            }
            const updated = yield updateRecording(recording.id, recording);
            resolve(updated);
          });
        }
      });
    } catch (error) {
      if (recordingId) {
        const recording = getRecording(recordingId);
        if (recording)
          recording.status = STATUS.ERROR;
      }
      handleError("stopRecording", error);
    }
  });
  const muteRecording = (recordingId) => __async(this, null, function* () {
    var _a2;
    try {
      const recording = getRecording(recordingId);
      (_a2 = recording.recorder) == null ? void 0 : _a2.stream.getAudioTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
      recording.isMuted = !recording.isMuted;
      return yield updateRecording(recording.id, recording);
    } catch (error) {
      if (recordingId) {
        const recording = getRecording(recordingId);
        if (recording)
          recording.status = STATUS.ERROR;
      }
      handleError("muteRecording", error);
    }
  });
  const cancelRecording = (recordingId) => __async(this, null, function* () {
    var _a2, _b, _c;
    try {
      const recording = getRecording(recordingId);
      const tracks = (_a2 = recording == null ? void 0 : recording.recorder) == null ? void 0 : _a2.stream.getTracks();
      (_b = recording == null ? void 0 : recording.recorder) == null ? void 0 : _b.stop();
      tracks == null ? void 0 : tracks.forEach((track) => track.stop());
      ((_c = recording.recorder) == null ? void 0 : _c.ondataavailable) && (recording.recorder.ondataavailable = null);
      if (recording.webcamRef.current) {
        const stream = recording.webcamRef.current.srcObject;
        stream == null ? void 0 : stream.getTracks().forEach((track) => track.stop());
        recording.webcamRef.current.srcObject = null;
        recording.webcamRef.current.load();
      }
      URL.revokeObjectURL(recording.objectURL);
      yield deleteRecording(recording.id);
    } catch (error) {
      if (recordingId) {
        const recording = getRecording(recordingId);
        if (recording)
          recording.status = STATUS.ERROR;
      }
      handleError("cancelRecording", error);
    }
  });
  const createRecording2 = (videoId, audioId) => __async(this, null, function* () {
    var _a2, _b, _c, _d, _e, _f;
    try {
      const { devicesById, initialDevices } = devices || {};
      const videoLabel = videoId ? devicesById == null ? void 0 : devicesById[videoId].label : (_a2 = initialDevices == null ? void 0 : initialDevices.video) == null ? void 0 : _a2.label;
      const audioLabel = audioId ? devicesById == null ? void 0 : devicesById[audioId].label : (_b = initialDevices == null ? void 0 : initialDevices.audio) == null ? void 0 : _b.label;
      const recordingId = `${videoId || ((_c = initialDevices == null ? void 0 : initialDevices.video) == null ? void 0 : _c.deviceId)}-${audioId || ((_d = initialDevices == null ? void 0 : initialDevices.audio) == null ? void 0 : _d.deviceId)}`;
      const isCreated = isRecordingCreated(recordingId);
      if (isCreated)
        throw new Error(ERROR_MESSAGES.SESSION_EXISTS);
      const recording = yield setRecording({
        videoId: videoId || ((_e = initialDevices == null ? void 0 : initialDevices.video) == null ? void 0 : _e.deviceId),
        audioId: audioId || ((_f = initialDevices == null ? void 0 : initialDevices.audio) == null ? void 0 : _f.deviceId),
        videoLabel,
        audioLabel
      });
      return recording;
    } catch (error) {
      handleError("createRecording", error);
    }
  });
  const applyRecordingOptions = (recordingId) => __async(this, null, function* () {
    try {
      const recording = getRecording(recordingId);
      if (options == null ? void 0 : options.fileName) {
        recording.fileName = options.fileName;
      }
      if (options == null ? void 0 : options.fileType) {
        recording.fileType = options.fileType;
      }
      const updatedRecording = yield updateRecording(recording.id, recording);
      return updatedRecording;
    } catch (error) {
      if (recordingId) {
        const recording = getRecording(recordingId);
        if (recording)
          recording.status = STATUS.ERROR;
      }
      handleError("applyRecordingOptions", error);
    }
  });
  const clearPreview = (recordingId) => __async(this, null, function* () {
    try {
      const recording = getRecording(recordingId);
      if (recording.previewRef.current)
        recording.previewRef.current.src = "";
      recording.status = STATUS.INITIAL;
      URL.revokeObjectURL(recording.objectURL);
      recording.blobChunks = [];
      const updatedRecording = yield updateRecording(recording.id, recording);
      return updatedRecording;
    } catch (error) {
      if (recordingId) {
        const recording = getRecording(recordingId);
        if (recording)
          recording.status = STATUS.ERROR;
      }
      handleError("clearPreview", error);
    }
  });
  const download = (recordingId) => __async(this, null, function* () {
    try {
      const recording = getRecording(recordingId);
      const downloadElement = document.createElement("a");
      if (recording == null ? void 0 : recording.objectURL) {
        downloadElement.href = recording.objectURL;
      }
      downloadElement.download = `${recording.fileName}.${recording.fileType}`;
      downloadElement.click();
    } catch (error) {
      if (recordingId) {
        const recording = getRecording(recordingId);
        if (recording)
          recording.status = STATUS.ERROR;
      }
      handleError("download", error);
    }
  });
  return {
    activeRecordings,
    applyRecordingOptions,
    clearAllRecordings,
    clearPreview,
    download,
    cancelRecording,
    createRecording: createRecording2,
    muteRecording,
    pauseRecording,
    resumeRecording,
    startRecording,
    stopRecording
  };
}

// src/stream.ts
function startStream(videoId, audioId, constraints) {
  return __async(this, null, function* () {
    const newStream = yield navigator.mediaDevices.getUserMedia({
      video: { deviceId: { exact: videoId } },
      audio: {
        deviceId: { exact: audioId }
      }
    });
    const tracks = newStream.getTracks();
    tracks.forEach((track) => track.applyConstraints(constraints));
    return newStream;
  });
}

// src/useCamera.ts
var DEFAULT_CONSTRAINTS = {
  aspectRatio: 1.7,
  echoCancellation: true,
  height: 720,
  width: 1280
};
function useCamera({
  mediaTrackConstraints,
  handleError
}) {
  const { getRecording, updateRecording } = useRecordingStore();
  const constraints = reactExports.useMemo(
    () => __spreadValues(__spreadValues({}, DEFAULT_CONSTRAINTS), mediaTrackConstraints),
    [mediaTrackConstraints]
  );
  const applyConstraints = (recordingId, constraints2) => __async(this, null, function* () {
    var _a2, _b;
    try {
      const recording = getRecording(recordingId);
      if ((_a2 = recording.webcamRef.current) == null ? void 0 : _a2.srcObject) {
        const stream = (_b = recording.webcamRef.current) == null ? void 0 : _b.srcObject;
        const tracks = stream.getTracks() || [];
        tracks == null ? void 0 : tracks.forEach((track) => {
          track.applyConstraints(__spreadValues({}, constraints2));
        });
      }
      return recording;
    } catch (error) {
      if (recordingId) {
        const recording = getRecording(recordingId);
        if (recording)
          recording.status = STATUS.ERROR;
      }
      handleError("applyConstraints", error);
    }
  });
  const openCamera = (recordingId) => __async(this, null, function* () {
    try {
      const recording = getRecording(recordingId);
      const stream = yield startStream(
        recording.videoId,
        recording.audioId,
        constraints
      );
      if (recording.webcamRef.current) {
        recording.webcamRef.current.srcObject = stream;
        yield recording.webcamRef.current.play();
      }
      recording.status = STATUS.OPEN;
      const updatedRecording = yield updateRecording(recording.id, recording);
      return updatedRecording;
    } catch (error) {
      handleError("openCamera", error);
    }
  });
  const closeCamera = (recordingId) => __async(this, null, function* () {
    var _a2;
    try {
      const recording = getRecording(recordingId);
      if (recording.webcamRef.current) {
        const stream = recording.webcamRef.current.srcObject;
        stream == null ? void 0 : stream.getTracks().forEach((track) => track.stop());
        ((_a2 = recording.recorder) == null ? void 0 : _a2.ondataavailable) && (recording.recorder.ondataavailable = null);
        recording.webcamRef.current.srcObject = null;
        recording.webcamRef.current.load();
      }
      recording.status = STATUS.CLOSED;
      const updatedRecording = yield updateRecording(recording.id, recording);
      return updatedRecording;
    } catch (error) {
      if (recordingId) {
        const recording = getRecording(recordingId);
        if (recording)
          recording.status = STATUS.ERROR;
      }
      handleError("closeCamera", error);
    }
  });
  return {
    applyConstraints,
    closeCamera,
    openCamera
  };
}
function useRecordWebcam({
  mediaRecorderOptions,
  mediaTrackConstraints,
  options
} = {}) {
  const [devices, setDevices] = reactExports.useState();
  const [errorMessage, setErrorMessage] = reactExports.useState(null);
  function handleError(functionName, error) {
    const message = typeof error === "string" ? error : typeof error.message === "string" ? error.message : "";
    setErrorMessage(message);
  }
  function clearError() {
    setErrorMessage(null);
  }
  const { applyConstraints, closeCamera, openCamera } = useCamera({
    mediaTrackConstraints,
    handleError
  });
  const {
    activeRecordings,
    applyRecordingOptions,
    cancelRecording,
    clearAllRecordings,
    clearPreview,
    createRecording: createRecording2,
    download,
    muteRecording,
    pauseRecording,
    resumeRecording,
    startRecording,
    stopRecording
  } = useRecorder({ mediaRecorderOptions, options, devices, handleError });
  function init() {
    return __async(this, null, function* () {
      try {
        const devices2 = yield getDevices();
        setDevices(devices2);
      } catch (error) {
        handleError("init", error);
      }
    });
  }
  reactExports.useEffect(() => {
    init();
    return () => {
      clearAllRecordings();
    };
  }, []);
  return {
    activeRecordings,
    applyConstraints,
    applyRecordingOptions,
    cancelRecording,
    clearAllRecordings,
    clearError,
    clearPreview,
    closeCamera,
    createRecording: createRecording2,
    devicesById: devices == null ? void 0 : devices.devicesById,
    devicesByType: devices == null ? void 0 : devices.devicesByType,
    download,
    errorMessage,
    muteRecording,
    openCamera,
    pauseRecording,
    resumeRecording,
    startRecording,
    stopRecording
  };
}

function VideoContainer({
  children
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2 w-[32rem] rounded-md mx-auto p-2 border border-border", children });
}

const $c1b5f66aac50e106$export$e840e8869344ca38 = /*#__PURE__*/ reactExports.forwardRef((props, forwardedRef)=>{
    const { ratio: ratio = 1 , style: style , ...aspectRatioProps } = props;
    return /*#__PURE__*/ reactExports.createElement("div", {
        style: {
            // ensures inner element is contained
            position: 'relative',
            // ensures padding bottom trick maths works
            width: '100%',
            paddingBottom: `${100 / ratio}%`
        },
        "data-radix-aspect-ratio-wrapper": ""
    }, /*#__PURE__*/ reactExports.createElement($8927f6f2acc4f386$export$250ffa63cdc0d034.div, _extends({}, aspectRatioProps, {
        ref: forwardedRef,
        style: {
            ...style,
            // ensures children expand in ratio
            position: 'absolute',
            top: 0,
            right: 0,
            bottom: 0,
            left: 0
        }
    })));
});
/* -----------------------------------------------------------------------------------------------*/ const $c1b5f66aac50e106$export$be92b6f5f03c0fe9 = $c1b5f66aac50e106$export$e840e8869344ca38;

const AspectRatio = $c1b5f66aac50e106$export$be92b6f5f03c0fe9;

/* -------------------------------------------------------------------------------------------------
 * Progress
 * -----------------------------------------------------------------------------------------------*/ const $67824d98245208a0$var$PROGRESS_NAME = 'Progress';
const $67824d98245208a0$var$DEFAULT_MAX = 100;
const [$67824d98245208a0$var$createProgressContext, $67824d98245208a0$export$388eb2d8f6d3261f] = $c512c27ab02ef895$export$50c7b4e9d9f19c1($67824d98245208a0$var$PROGRESS_NAME);
const [$67824d98245208a0$var$ProgressProvider, $67824d98245208a0$var$useProgressContext] = $67824d98245208a0$var$createProgressContext($67824d98245208a0$var$PROGRESS_NAME);
const $67824d98245208a0$export$b25a304ec7d746bb = /*#__PURE__*/ reactExports.forwardRef((props, forwardedRef)=>{
    const { __scopeProgress: __scopeProgress , value: valueProp , max: maxProp , getValueLabel: getValueLabel = $67824d98245208a0$var$defaultGetValueLabel , ...progressProps } = props;
    const max = $67824d98245208a0$var$isValidMaxNumber(maxProp) ? maxProp : $67824d98245208a0$var$DEFAULT_MAX;
    const value = $67824d98245208a0$var$isValidValueNumber(valueProp, max) ? valueProp : null;
    const valueLabel = $67824d98245208a0$var$isNumber(value) ? getValueLabel(value, max) : undefined;
    return /*#__PURE__*/ reactExports.createElement($67824d98245208a0$var$ProgressProvider, {
        scope: __scopeProgress,
        value: value,
        max: max
    }, /*#__PURE__*/ reactExports.createElement($8927f6f2acc4f386$export$250ffa63cdc0d034.div, _extends({
        "aria-valuemax": max,
        "aria-valuemin": 0,
        "aria-valuenow": $67824d98245208a0$var$isNumber(value) ? value : undefined,
        "aria-valuetext": valueLabel,
        role: "progressbar",
        "data-state": $67824d98245208a0$var$getProgressState(value, max),
        "data-value": value !== null && value !== void 0 ? value : undefined,
        "data-max": max
    }, progressProps, {
        ref: forwardedRef
    })));
});
$67824d98245208a0$export$b25a304ec7d746bb.propTypes = {
    max (props, propName, componentName) {
        const propValue = props[propName];
        const strVal = String(propValue);
        if (propValue && !$67824d98245208a0$var$isValidMaxNumber(propValue)) return new Error($67824d98245208a0$var$getInvalidMaxError(strVal, componentName));
        return null;
    },
    value (props, propName, componentName) {
        const valueProp = props[propName];
        const strVal = String(valueProp);
        const max = $67824d98245208a0$var$isValidMaxNumber(props.max) ? props.max : $67824d98245208a0$var$DEFAULT_MAX;
        if (valueProp != null && !$67824d98245208a0$var$isValidValueNumber(valueProp, max)) return new Error($67824d98245208a0$var$getInvalidValueError(strVal, componentName));
        return null;
    }
};
/* -------------------------------------------------------------------------------------------------
 * ProgressIndicator
 * -----------------------------------------------------------------------------------------------*/ const $67824d98245208a0$var$INDICATOR_NAME = 'ProgressIndicator';
const $67824d98245208a0$export$2b776f7e7ee60dbd = /*#__PURE__*/ reactExports.forwardRef((props, forwardedRef)=>{
    var _context$value;
    const { __scopeProgress: __scopeProgress , ...indicatorProps } = props;
    const context = $67824d98245208a0$var$useProgressContext($67824d98245208a0$var$INDICATOR_NAME, __scopeProgress);
    return /*#__PURE__*/ reactExports.createElement($8927f6f2acc4f386$export$250ffa63cdc0d034.div, _extends({
        "data-state": $67824d98245208a0$var$getProgressState(context.value, context.max),
        "data-value": (_context$value = context.value) !== null && _context$value !== void 0 ? _context$value : undefined,
        "data-max": context.max
    }, indicatorProps, {
        ref: forwardedRef
    }));
});
/* ---------------------------------------------------------------------------------------------- */ function $67824d98245208a0$var$defaultGetValueLabel(value, max) {
    return `${Math.round(value / max * 100)}%`;
}
function $67824d98245208a0$var$getProgressState(value, maxValue) {
    return value == null ? 'indeterminate' : value === maxValue ? 'complete' : 'loading';
}
function $67824d98245208a0$var$isNumber(value) {
    return typeof value === 'number';
}
function $67824d98245208a0$var$isValidMaxNumber(max) {
    // prettier-ignore
    return $67824d98245208a0$var$isNumber(max) && !isNaN(max) && max > 0;
}
function $67824d98245208a0$var$isValidValueNumber(value, max) {
    // prettier-ignore
    return $67824d98245208a0$var$isNumber(value) && !isNaN(value) && value <= max && value >= 0;
} // Split this out for clearer readability of the error message.
function $67824d98245208a0$var$getInvalidMaxError(propValue, componentName) {
    return `Invalid prop \`max\` of value \`${propValue}\` supplied to \`${componentName}\`. Only numbers greater than 0 are valid max values. Defaulting to \`${$67824d98245208a0$var$DEFAULT_MAX}\`.`;
}
function $67824d98245208a0$var$getInvalidValueError(propValue, componentName) {
    return `Invalid prop \`value\` of value \`${propValue}\` supplied to \`${componentName}\`. The \`value\` prop must be:
  - a positive number
  - less than the value passed to \`max\` (or ${$67824d98245208a0$var$DEFAULT_MAX} if no \`max\` prop is set)
  - \`null\` if the progress is indeterminate.

Defaulting to \`null\`.`;
}
const $67824d98245208a0$export$be92b6f5f03c0fe9 = $67824d98245208a0$export$b25a304ec7d746bb;
const $67824d98245208a0$export$adb584737d712b70 = $67824d98245208a0$export$2b776f7e7ee60dbd;

const Progress = reactExports.forwardRef(({ className, value, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  $67824d98245208a0$export$be92b6f5f03c0fe9,
  {
    ref,
    className: cn(
      "relative h-4 w-full overflow-hidden rounded-full bg-secondary",
      className
    ),
    ...props,
    children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      $67824d98245208a0$export$adb584737d712b70,
      {
        className: "h-full w-full flex-1 bg-primary transition-all",
        style: { transform: `translateX(-${100 - (value || 0)}%)` }
      }
    )
  }
));
Progress.displayName = $67824d98245208a0$export$be92b6f5f03c0fe9.displayName;
const RedProgress = reactExports.forwardRef(({ className, value, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  $67824d98245208a0$export$be92b6f5f03c0fe9,
  {
    ref,
    className: cn(
      "relative h-4 w-full overflow-hidden rounded-full bg-secondary",
      className
    ),
    ...props,
    children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      $67824d98245208a0$export$adb584737d712b70,
      {
        className: "h-full w-full flex-1 bg-red-400 transition-all",
        style: { transform: `translateX(-${100 - (value || 0)}%)` }
      }
    )
  }
));
RedProgress.displayName = $67824d98245208a0$export$be92b6f5f03c0fe9.displayName;

const [$a093c7e1ec25a057$var$createTooltipContext, $a093c7e1ec25a057$export$1c540a2224f0d865] = $c512c27ab02ef895$export$50c7b4e9d9f19c1('Tooltip', [
    $cf1ac5d9fe0e8206$export$722aac194ae923
]);
const $a093c7e1ec25a057$var$usePopperScope = $cf1ac5d9fe0e8206$export$722aac194ae923();
/* -------------------------------------------------------------------------------------------------
 * TooltipProvider
 * -----------------------------------------------------------------------------------------------*/ const $a093c7e1ec25a057$var$PROVIDER_NAME = 'TooltipProvider';
const $a093c7e1ec25a057$var$DEFAULT_DELAY_DURATION = 700;
const $a093c7e1ec25a057$var$TOOLTIP_OPEN = 'tooltip.open';
const [$a093c7e1ec25a057$var$TooltipProviderContextProvider, $a093c7e1ec25a057$var$useTooltipProviderContext] = $a093c7e1ec25a057$var$createTooltipContext($a093c7e1ec25a057$var$PROVIDER_NAME);
const $a093c7e1ec25a057$export$f78649fb9ca566b8 = (props)=>{
    const { __scopeTooltip: __scopeTooltip , delayDuration: delayDuration = $a093c7e1ec25a057$var$DEFAULT_DELAY_DURATION , skipDelayDuration: skipDelayDuration = 300 , disableHoverableContent: disableHoverableContent = false , children: children  } = props;
    const [isOpenDelayed, setIsOpenDelayed] = reactExports.useState(true);
    const isPointerInTransitRef = reactExports.useRef(false);
    const skipDelayTimerRef = reactExports.useRef(0);
    reactExports.useEffect(()=>{
        const skipDelayTimer = skipDelayTimerRef.current;
        return ()=>window.clearTimeout(skipDelayTimer)
        ;
    }, []);
    return /*#__PURE__*/ reactExports.createElement($a093c7e1ec25a057$var$TooltipProviderContextProvider, {
        scope: __scopeTooltip,
        isOpenDelayed: isOpenDelayed,
        delayDuration: delayDuration,
        onOpen: reactExports.useCallback(()=>{
            window.clearTimeout(skipDelayTimerRef.current);
            setIsOpenDelayed(false);
        }, []),
        onClose: reactExports.useCallback(()=>{
            window.clearTimeout(skipDelayTimerRef.current);
            skipDelayTimerRef.current = window.setTimeout(()=>setIsOpenDelayed(true)
            , skipDelayDuration);
        }, [
            skipDelayDuration
        ]),
        isPointerInTransitRef: isPointerInTransitRef,
        onPointerInTransitChange: reactExports.useCallback((inTransit)=>{
            isPointerInTransitRef.current = inTransit;
        }, []),
        disableHoverableContent: disableHoverableContent
    }, children);
};
/* -------------------------------------------------------------------------------------------------
 * Tooltip
 * -----------------------------------------------------------------------------------------------*/ const $a093c7e1ec25a057$var$TOOLTIP_NAME = 'Tooltip';
const [$a093c7e1ec25a057$var$TooltipContextProvider, $a093c7e1ec25a057$var$useTooltipContext] = $a093c7e1ec25a057$var$createTooltipContext($a093c7e1ec25a057$var$TOOLTIP_NAME);
const $a093c7e1ec25a057$export$28c660c63b792dea = (props)=>{
    const { __scopeTooltip: __scopeTooltip , children: children , open: openProp , defaultOpen: defaultOpen = false , onOpenChange: onOpenChange , disableHoverableContent: disableHoverableContentProp , delayDuration: delayDurationProp  } = props;
    const providerContext = $a093c7e1ec25a057$var$useTooltipProviderContext($a093c7e1ec25a057$var$TOOLTIP_NAME, props.__scopeTooltip);
    const popperScope = $a093c7e1ec25a057$var$usePopperScope(__scopeTooltip);
    const [trigger, setTrigger] = reactExports.useState(null);
    const contentId = $1746a345f3d73bb7$export$f680877a34711e37();
    const openTimerRef = reactExports.useRef(0);
    const disableHoverableContent = disableHoverableContentProp !== null && disableHoverableContentProp !== void 0 ? disableHoverableContentProp : providerContext.disableHoverableContent;
    const delayDuration = delayDurationProp !== null && delayDurationProp !== void 0 ? delayDurationProp : providerContext.delayDuration;
    const wasOpenDelayedRef = reactExports.useRef(false);
    const [open1 = false, setOpen] = $71cd76cc60e0454e$export$6f32135080cb4c3({
        prop: openProp,
        defaultProp: defaultOpen,
        onChange: (open)=>{
            if (open) {
                providerContext.onOpen(); // as `onChange` is called within a lifecycle method we
                // avoid dispatching via `dispatchDiscreteCustomEvent`.
                document.dispatchEvent(new CustomEvent($a093c7e1ec25a057$var$TOOLTIP_OPEN));
            } else providerContext.onClose();
            onOpenChange === null || onOpenChange === void 0 || onOpenChange(open);
        }
    });
    const stateAttribute = reactExports.useMemo(()=>{
        return open1 ? wasOpenDelayedRef.current ? 'delayed-open' : 'instant-open' : 'closed';
    }, [
        open1
    ]);
    const handleOpen = reactExports.useCallback(()=>{
        window.clearTimeout(openTimerRef.current);
        wasOpenDelayedRef.current = false;
        setOpen(true);
    }, [
        setOpen
    ]);
    const handleClose = reactExports.useCallback(()=>{
        window.clearTimeout(openTimerRef.current);
        setOpen(false);
    }, [
        setOpen
    ]);
    const handleDelayedOpen = reactExports.useCallback(()=>{
        window.clearTimeout(openTimerRef.current);
        openTimerRef.current = window.setTimeout(()=>{
            wasOpenDelayedRef.current = true;
            setOpen(true);
        }, delayDuration);
    }, [
        delayDuration,
        setOpen
    ]);
    reactExports.useEffect(()=>{
        return ()=>window.clearTimeout(openTimerRef.current)
        ;
    }, []);
    return /*#__PURE__*/ reactExports.createElement($cf1ac5d9fe0e8206$export$be92b6f5f03c0fe9, popperScope, /*#__PURE__*/ reactExports.createElement($a093c7e1ec25a057$var$TooltipContextProvider, {
        scope: __scopeTooltip,
        contentId: contentId,
        open: open1,
        stateAttribute: stateAttribute,
        trigger: trigger,
        onTriggerChange: setTrigger,
        onTriggerEnter: reactExports.useCallback(()=>{
            if (providerContext.isOpenDelayed) handleDelayedOpen();
            else handleOpen();
        }, [
            providerContext.isOpenDelayed,
            handleDelayedOpen,
            handleOpen
        ]),
        onTriggerLeave: reactExports.useCallback(()=>{
            if (disableHoverableContent) handleClose();
            else // Clear the timer in case the pointer leaves the trigger before the tooltip is opened.
            window.clearTimeout(openTimerRef.current);
        }, [
            handleClose,
            disableHoverableContent
        ]),
        onOpen: handleOpen,
        onClose: handleClose,
        disableHoverableContent: disableHoverableContent
    }, children));
};
/* -------------------------------------------------------------------------------------------------
 * TooltipTrigger
 * -----------------------------------------------------------------------------------------------*/ const $a093c7e1ec25a057$var$TRIGGER_NAME = 'TooltipTrigger';
const $a093c7e1ec25a057$export$8c610744efcf8a1d = /*#__PURE__*/ reactExports.forwardRef((props, forwardedRef)=>{
    const { __scopeTooltip: __scopeTooltip , ...triggerProps } = props;
    const context = $a093c7e1ec25a057$var$useTooltipContext($a093c7e1ec25a057$var$TRIGGER_NAME, __scopeTooltip);
    const providerContext = $a093c7e1ec25a057$var$useTooltipProviderContext($a093c7e1ec25a057$var$TRIGGER_NAME, __scopeTooltip);
    const popperScope = $a093c7e1ec25a057$var$usePopperScope(__scopeTooltip);
    const ref = reactExports.useRef(null);
    const composedRefs = $6ed0406888f73fc4$export$c7b2cbe3552a0d05(forwardedRef, ref, context.onTriggerChange);
    const isPointerDownRef = reactExports.useRef(false);
    const hasPointerMoveOpenedRef = reactExports.useRef(false);
    const handlePointerUp = reactExports.useCallback(()=>isPointerDownRef.current = false
    , []);
    reactExports.useEffect(()=>{
        return ()=>document.removeEventListener('pointerup', handlePointerUp)
        ;
    }, [
        handlePointerUp
    ]);
    return /*#__PURE__*/ reactExports.createElement($cf1ac5d9fe0e8206$export$b688253958b8dfe7, _extends({
        asChild: true
    }, popperScope), /*#__PURE__*/ reactExports.createElement($8927f6f2acc4f386$export$250ffa63cdc0d034.button, _extends({
        // We purposefully avoid adding `type=button` here because tooltip triggers are also
        // commonly anchors and the anchor `type` attribute signifies MIME type.
        "aria-describedby": context.open ? context.contentId : undefined,
        "data-state": context.stateAttribute
    }, triggerProps, {
        ref: composedRefs,
        onPointerMove: $e42e1063c40fb3ef$export$b9ecd428b558ff10(props.onPointerMove, (event)=>{
            if (event.pointerType === 'touch') return;
            if (!hasPointerMoveOpenedRef.current && !providerContext.isPointerInTransitRef.current) {
                context.onTriggerEnter();
                hasPointerMoveOpenedRef.current = true;
            }
        }),
        onPointerLeave: $e42e1063c40fb3ef$export$b9ecd428b558ff10(props.onPointerLeave, ()=>{
            context.onTriggerLeave();
            hasPointerMoveOpenedRef.current = false;
        }),
        onPointerDown: $e42e1063c40fb3ef$export$b9ecd428b558ff10(props.onPointerDown, ()=>{
            isPointerDownRef.current = true;
            document.addEventListener('pointerup', handlePointerUp, {
                once: true
            });
        }),
        onFocus: $e42e1063c40fb3ef$export$b9ecd428b558ff10(props.onFocus, ()=>{
            if (!isPointerDownRef.current) context.onOpen();
        }),
        onBlur: $e42e1063c40fb3ef$export$b9ecd428b558ff10(props.onBlur, context.onClose),
        onClick: $e42e1063c40fb3ef$export$b9ecd428b558ff10(props.onClick, context.onClose)
    })));
});
/* -------------------------------------------------------------------------------------------------
 * TooltipPortal
 * -----------------------------------------------------------------------------------------------*/ const $a093c7e1ec25a057$var$PORTAL_NAME = 'TooltipPortal';
const [$a093c7e1ec25a057$var$PortalProvider, $a093c7e1ec25a057$var$usePortalContext] = $a093c7e1ec25a057$var$createTooltipContext($a093c7e1ec25a057$var$PORTAL_NAME, {
    forceMount: undefined
});
/* -------------------------------------------------------------------------------------------------
 * TooltipContent
 * -----------------------------------------------------------------------------------------------*/ const $a093c7e1ec25a057$var$CONTENT_NAME = 'TooltipContent';
const $a093c7e1ec25a057$export$e9003e2be37ec060 = /*#__PURE__*/ reactExports.forwardRef((props, forwardedRef)=>{
    const portalContext = $a093c7e1ec25a057$var$usePortalContext($a093c7e1ec25a057$var$CONTENT_NAME, props.__scopeTooltip);
    const { forceMount: forceMount = portalContext.forceMount , side: side = 'top' , ...contentProps } = props;
    const context = $a093c7e1ec25a057$var$useTooltipContext($a093c7e1ec25a057$var$CONTENT_NAME, props.__scopeTooltip);
    return /*#__PURE__*/ reactExports.createElement($921a889cee6df7e8$export$99c2b779aa4e8b8b, {
        present: forceMount || context.open
    }, context.disableHoverableContent ? /*#__PURE__*/ reactExports.createElement($a093c7e1ec25a057$var$TooltipContentImpl, _extends({
        side: side
    }, contentProps, {
        ref: forwardedRef
    })) : /*#__PURE__*/ reactExports.createElement($a093c7e1ec25a057$var$TooltipContentHoverable, _extends({
        side: side
    }, contentProps, {
        ref: forwardedRef
    })));
});
const $a093c7e1ec25a057$var$TooltipContentHoverable = /*#__PURE__*/ reactExports.forwardRef((props, forwardedRef)=>{
    const context = $a093c7e1ec25a057$var$useTooltipContext($a093c7e1ec25a057$var$CONTENT_NAME, props.__scopeTooltip);
    const providerContext = $a093c7e1ec25a057$var$useTooltipProviderContext($a093c7e1ec25a057$var$CONTENT_NAME, props.__scopeTooltip);
    const ref = reactExports.useRef(null);
    const composedRefs = $6ed0406888f73fc4$export$c7b2cbe3552a0d05(forwardedRef, ref);
    const [pointerGraceArea, setPointerGraceArea] = reactExports.useState(null);
    const { trigger: trigger , onClose: onClose  } = context;
    const content = ref.current;
    const { onPointerInTransitChange: onPointerInTransitChange  } = providerContext;
    const handleRemoveGraceArea = reactExports.useCallback(()=>{
        setPointerGraceArea(null);
        onPointerInTransitChange(false);
    }, [
        onPointerInTransitChange
    ]);
    const handleCreateGraceArea = reactExports.useCallback((event, hoverTarget)=>{
        const currentTarget = event.currentTarget;
        const exitPoint = {
            x: event.clientX,
            y: event.clientY
        };
        const exitSide = $a093c7e1ec25a057$var$getExitSideFromRect(exitPoint, currentTarget.getBoundingClientRect());
        const paddedExitPoints = $a093c7e1ec25a057$var$getPaddedExitPoints(exitPoint, exitSide);
        const hoverTargetPoints = $a093c7e1ec25a057$var$getPointsFromRect(hoverTarget.getBoundingClientRect());
        const graceArea = $a093c7e1ec25a057$var$getHull([
            ...paddedExitPoints,
            ...hoverTargetPoints
        ]);
        setPointerGraceArea(graceArea);
        onPointerInTransitChange(true);
    }, [
        onPointerInTransitChange
    ]);
    reactExports.useEffect(()=>{
        return ()=>handleRemoveGraceArea()
        ;
    }, [
        handleRemoveGraceArea
    ]);
    reactExports.useEffect(()=>{
        if (trigger && content) {
            const handleTriggerLeave = (event)=>handleCreateGraceArea(event, content)
            ;
            const handleContentLeave = (event)=>handleCreateGraceArea(event, trigger)
            ;
            trigger.addEventListener('pointerleave', handleTriggerLeave);
            content.addEventListener('pointerleave', handleContentLeave);
            return ()=>{
                trigger.removeEventListener('pointerleave', handleTriggerLeave);
                content.removeEventListener('pointerleave', handleContentLeave);
            };
        }
    }, [
        trigger,
        content,
        handleCreateGraceArea,
        handleRemoveGraceArea
    ]);
    reactExports.useEffect(()=>{
        if (pointerGraceArea) {
            const handleTrackPointerGrace = (event)=>{
                const target = event.target;
                const pointerPosition = {
                    x: event.clientX,
                    y: event.clientY
                };
                const hasEnteredTarget = (trigger === null || trigger === void 0 ? void 0 : trigger.contains(target)) || (content === null || content === void 0 ? void 0 : content.contains(target));
                const isPointerOutsideGraceArea = !$a093c7e1ec25a057$var$isPointInPolygon(pointerPosition, pointerGraceArea);
                if (hasEnteredTarget) handleRemoveGraceArea();
                else if (isPointerOutsideGraceArea) {
                    handleRemoveGraceArea();
                    onClose();
                }
            };
            document.addEventListener('pointermove', handleTrackPointerGrace);
            return ()=>document.removeEventListener('pointermove', handleTrackPointerGrace)
            ;
        }
    }, [
        trigger,
        content,
        pointerGraceArea,
        onClose,
        handleRemoveGraceArea
    ]);
    return /*#__PURE__*/ reactExports.createElement($a093c7e1ec25a057$var$TooltipContentImpl, _extends({}, props, {
        ref: composedRefs
    }));
});
const [$a093c7e1ec25a057$var$VisuallyHiddenContentContextProvider, $a093c7e1ec25a057$var$useVisuallyHiddenContentContext] = $a093c7e1ec25a057$var$createTooltipContext($a093c7e1ec25a057$var$TOOLTIP_NAME, {
    isInside: false
});
const $a093c7e1ec25a057$var$TooltipContentImpl = /*#__PURE__*/ reactExports.forwardRef((props, forwardedRef)=>{
    const { __scopeTooltip: __scopeTooltip , children: children , 'aria-label': ariaLabel , onEscapeKeyDown: onEscapeKeyDown , onPointerDownOutside: onPointerDownOutside , ...contentProps } = props;
    const context = $a093c7e1ec25a057$var$useTooltipContext($a093c7e1ec25a057$var$CONTENT_NAME, __scopeTooltip);
    const popperScope = $a093c7e1ec25a057$var$usePopperScope(__scopeTooltip);
    const { onClose: onClose  } = context; // Close this tooltip if another one opens
    reactExports.useEffect(()=>{
        document.addEventListener($a093c7e1ec25a057$var$TOOLTIP_OPEN, onClose);
        return ()=>document.removeEventListener($a093c7e1ec25a057$var$TOOLTIP_OPEN, onClose)
        ;
    }, [
        onClose
    ]); // Close the tooltip if the trigger is scrolled
    reactExports.useEffect(()=>{
        if (context.trigger) {
            const handleScroll = (event)=>{
                const target = event.target;
                if (target !== null && target !== void 0 && target.contains(context.trigger)) onClose();
            };
            window.addEventListener('scroll', handleScroll, {
                capture: true
            });
            return ()=>window.removeEventListener('scroll', handleScroll, {
                    capture: true
                })
            ;
        }
    }, [
        context.trigger,
        onClose
    ]);
    return /*#__PURE__*/ reactExports.createElement($5cb92bef7577960e$export$177fb62ff3ec1f22, {
        asChild: true,
        disableOutsidePointerEvents: false,
        onEscapeKeyDown: onEscapeKeyDown,
        onPointerDownOutside: onPointerDownOutside,
        onFocusOutside: (event)=>event.preventDefault()
        ,
        onDismiss: onClose
    }, /*#__PURE__*/ reactExports.createElement($cf1ac5d9fe0e8206$export$7c6e2c02157bb7d2, _extends({
        "data-state": context.stateAttribute
    }, popperScope, contentProps, {
        ref: forwardedRef,
        style: {
            ...contentProps.style,
            '--radix-tooltip-content-transform-origin': 'var(--radix-popper-transform-origin)',
            '--radix-tooltip-content-available-width': 'var(--radix-popper-available-width)',
            '--radix-tooltip-content-available-height': 'var(--radix-popper-available-height)',
            '--radix-tooltip-trigger-width': 'var(--radix-popper-anchor-width)',
            '--radix-tooltip-trigger-height': 'var(--radix-popper-anchor-height)'
        }
    }), /*#__PURE__*/ reactExports.createElement($5e63c961fc1ce211$export$d9f1ccf0bdb05d45, null, children), /*#__PURE__*/ reactExports.createElement($a093c7e1ec25a057$var$VisuallyHiddenContentContextProvider, {
        scope: __scopeTooltip,
        isInside: true
    }, /*#__PURE__*/ reactExports.createElement($ea1ef594cf570d83$export$be92b6f5f03c0fe9, {
        id: context.contentId,
        role: "tooltip"
    }, ariaLabel || children))));
});
/* -----------------------------------------------------------------------------------------------*/ function $a093c7e1ec25a057$var$getExitSideFromRect(point, rect) {
    const top = Math.abs(rect.top - point.y);
    const bottom = Math.abs(rect.bottom - point.y);
    const right = Math.abs(rect.right - point.x);
    const left = Math.abs(rect.left - point.x);
    switch(Math.min(top, bottom, right, left)){
        case left:
            return 'left';
        case right:
            return 'right';
        case top:
            return 'top';
        case bottom:
            return 'bottom';
        default:
            throw new Error('unreachable');
    }
}
function $a093c7e1ec25a057$var$getPaddedExitPoints(exitPoint, exitSide, padding = 5) {
    const paddedExitPoints = [];
    switch(exitSide){
        case 'top':
            paddedExitPoints.push({
                x: exitPoint.x - padding,
                y: exitPoint.y + padding
            }, {
                x: exitPoint.x + padding,
                y: exitPoint.y + padding
            });
            break;
        case 'bottom':
            paddedExitPoints.push({
                x: exitPoint.x - padding,
                y: exitPoint.y - padding
            }, {
                x: exitPoint.x + padding,
                y: exitPoint.y - padding
            });
            break;
        case 'left':
            paddedExitPoints.push({
                x: exitPoint.x + padding,
                y: exitPoint.y - padding
            }, {
                x: exitPoint.x + padding,
                y: exitPoint.y + padding
            });
            break;
        case 'right':
            paddedExitPoints.push({
                x: exitPoint.x - padding,
                y: exitPoint.y - padding
            }, {
                x: exitPoint.x - padding,
                y: exitPoint.y + padding
            });
            break;
    }
    return paddedExitPoints;
}
function $a093c7e1ec25a057$var$getPointsFromRect(rect) {
    const { top: top , right: right , bottom: bottom , left: left  } = rect;
    return [
        {
            x: left,
            y: top
        },
        {
            x: right,
            y: top
        },
        {
            x: right,
            y: bottom
        },
        {
            x: left,
            y: bottom
        }
    ];
} // Determine if a point is inside of a polygon.
// Based on https://github.com/substack/point-in-polygon
function $a093c7e1ec25a057$var$isPointInPolygon(point, polygon) {
    const { x: x , y: y  } = point;
    let inside = false;
    for(let i = 0, j = polygon.length - 1; i < polygon.length; j = i++){
        const xi = polygon[i].x;
        const yi = polygon[i].y;
        const xj = polygon[j].x;
        const yj = polygon[j].y; // prettier-ignore
        const intersect = yi > y !== yj > y && x < (xj - xi) * (y - yi) / (yj - yi) + xi;
        if (intersect) inside = !inside;
    }
    return inside;
} // Returns a new array of points representing the convex hull of the given set of points.
// https://www.nayuki.io/page/convex-hull-algorithm
function $a093c7e1ec25a057$var$getHull(points) {
    const newPoints = points.slice();
    newPoints.sort((a, b)=>{
        if (a.x < b.x) return -1;
        else if (a.x > b.x) return 1;
        else if (a.y < b.y) return -1;
        else if (a.y > b.y) return 1;
        else return 0;
    });
    return $a093c7e1ec25a057$var$getHullPresorted(newPoints);
} // Returns the convex hull, assuming that each points[i] <= points[i + 1]. Runs in O(n) time.
function $a093c7e1ec25a057$var$getHullPresorted(points) {
    if (points.length <= 1) return points.slice();
    const upperHull = [];
    for(let i = 0; i < points.length; i++){
        const p = points[i];
        while(upperHull.length >= 2){
            const q = upperHull[upperHull.length - 1];
            const r = upperHull[upperHull.length - 2];
            if ((q.x - r.x) * (p.y - r.y) >= (q.y - r.y) * (p.x - r.x)) upperHull.pop();
            else break;
        }
        upperHull.push(p);
    }
    upperHull.pop();
    const lowerHull = [];
    for(let i1 = points.length - 1; i1 >= 0; i1--){
        const p = points[i1];
        while(lowerHull.length >= 2){
            const q = lowerHull[lowerHull.length - 1];
            const r = lowerHull[lowerHull.length - 2];
            if ((q.x - r.x) * (p.y - r.y) >= (q.y - r.y) * (p.x - r.x)) lowerHull.pop();
            else break;
        }
        lowerHull.push(p);
    }
    lowerHull.pop();
    if (upperHull.length === 1 && lowerHull.length === 1 && upperHull[0].x === lowerHull[0].x && upperHull[0].y === lowerHull[0].y) return upperHull;
    else return upperHull.concat(lowerHull);
}
const $a093c7e1ec25a057$export$2881499e37b75b9a = $a093c7e1ec25a057$export$f78649fb9ca566b8;
const $a093c7e1ec25a057$export$be92b6f5f03c0fe9 = $a093c7e1ec25a057$export$28c660c63b792dea;
const $a093c7e1ec25a057$export$41fb9f06171c75f4 = $a093c7e1ec25a057$export$8c610744efcf8a1d;
const $a093c7e1ec25a057$export$7c6e2c02157bb7d2 = $a093c7e1ec25a057$export$e9003e2be37ec060;

const TooltipProvider = $a093c7e1ec25a057$export$2881499e37b75b9a;
const Tooltip = $a093c7e1ec25a057$export$be92b6f5f03c0fe9;
const TooltipTrigger = $a093c7e1ec25a057$export$41fb9f06171c75f4;
const TooltipContent = reactExports.forwardRef(({ className, sideOffset = 4, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  $a093c7e1ec25a057$export$7c6e2c02157bb7d2,
  {
    ref,
    sideOffset,
    className: cn(
      "z-50 overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
      className
    ),
    ...props
  }
));
TooltipContent.displayName = $a093c7e1ec25a057$export$7c6e2c02157bb7d2.displayName;

const VideoRecorder = reactExports.forwardRef(
  ({
    status,
    progress,
    formattedTime,
    onStart,
    onStop,
    onPause,
    onResume
  }, ref) => {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(AspectRatio, { className: "relative overflow-hidden", ratio: 16 / 9, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("video", { className: "w-full rounded-md", ref }),
      (status === "RECORDING" || status === "PAUSED") && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-center gap-2 absolute top-1 left-0 right-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(RedProgress, { value: progress, className: "h-1 max-w-[50%]" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between p-1 bg-slate-800/50 w-[60px] rounded-full", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-white", children: formattedTime }),
          status === "PAUSED" && /* @__PURE__ */ jsxRuntimeExports.jsx(Pause, { className: "w-3.5 h-3.5 text-red-400" }),
          status === "RECORDING" && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-3 h-3 rounded-full bg-red-400" })
        ] })
      ] }),
      status === "INITIAL" || status === "OPEN" && /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipProvider, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Tooltip, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            size: "icon",
            variant: "outline",
            type: "button",
            className: "border-none bg-gray-800/20 hover:bg-gray-800/80 rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2",
            onClick: async (e) => {
              await onStart();
            },
            children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-3 h-3 rounded-full bg-red-600 " })
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipContent, { children: "Comenzar grabación" })
      ] }) }),
      status === "RECORDING" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute bottom-2 bg-transparent transform left-1/2 -translate-x-1/2 space-x-2 ", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipProvider, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Tooltip, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              size: "icon",
              variant: "outline",
              type: "button",
              className: "rounded-full border-none bg-gray-800/20 hover:bg-gray-800/80 group",
              onClick: async (e) => {
                await onPause();
              },
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pause, { className: "w-3.5 h-3.5 text-gray-200 group-hover:text-white" })
            }
          ) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipContent, { children: "Pausar grabación" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipProvider, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Tooltip, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              size: "icon",
              variant: "outline",
              type: "button",
              className: "rounded-full border-none bg-gray-800/20 hover:bg-gray-800/80 group",
              onClick: async (e) => {
                await onStop();
              },
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(Square, { className: "w-3.5 h-3.5 text-gray-200 group-hover:text-white" })
            }
          ) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipContent, { children: "Finalizar grabación" })
        ] }) })
      ] }),
      status === "PAUSED" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute bottom-2 bg-transparent transform left-1/2 -translate-x-1/2 space-x-2 ", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipProvider, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Tooltip, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              size: "icon",
              variant: "outline",
              type: "button",
              className: "border-none rounded-full bg-gray-800/20 hover:bg-gray-800/80 group",
              onClick: async (e) => {
                await onResume();
              },
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(SwitchCamera, { className: "w-3.5 h-3.5 text-gray-200 group-hover:text-white" })
            }
          ) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipContent, { children: "Reanudar grabación" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipProvider, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Tooltip, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              size: "icon",
              variant: "outline",
              type: "button",
              className: "rounded-full border-none bg-gray-800/20 hover:bg-gray-800/80 group",
              onClick: async (e) => {
                await onStop();
              },
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(Square, { className: "w-3.5 h-3.5 text-gray-200 group-hover:text-white" })
            }
          ) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipContent, { children: "Finalizar grabación" })
        ] }) })
      ] })
    ] });
  }
);

const VideoPreview = reactExports.forwardRef(
  ({ onAddToForm, onNewRecording }, ref) => {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(AspectRatio, { ratio: 16 / 9, children: /* @__PURE__ */ jsxRuntimeExports.jsx("video", { className: "w-full rounded-md", ref, controls: true }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-center items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            size: "sm",
            variant: "outline",
            type: "button",
            onClick: async (e) => {
              onAddToForm();
            },
            children: [
              "Guardar",
              /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "ml-2 w-3.5 h-3.5" })
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            size: "sm",
            variant: "secondary",
            type: "button",
            onClick: async (e) => {
              onNewRecording();
            },
            children: [
              "Nueva",
              /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "ml-2 w-3.5 h-3.5" })
            ]
          }
        )
      ] })
    ] });
  }
);

function Video({ onAddToForm }) {
  const [recordingID, setRecordingID] = reactExports.useState();
  const [progress, setProgress] = reactExports.useState(0);
  const [formattedTime, setFormattedTime] = reactExports.useState("00:00");
  const recordingTimeRef = reactExports.useRef({
    startTime: 0,
    elapsedTime: 0
  });
  const progressIntervalRef = reactExports.useRef();
  const {
    createRecording,
    activeRecordings,
    openCamera,
    startRecording,
    stopRecording,
    clearAllRecordings,
    resumeRecording,
    errorMessage,
    pauseRecording
  } = useRecordWebcam({
    options: {
      fileType: "webm",
      timeSlice: 1e3
    },
    mediaRecorderOptions: { mimeType: "video/webm; codecs=vp8" },
    mediaTrackConstraints: {}
  });
  reactExports.useEffect(() => {
    const startNewRecording = async () => await newRecording();
    startNewRecording();
  }, []);
  reactExports.useEffect(() => {
    const startCamera = async () => {
      if (recordingID) {
        await openCamera(recordingID);
      }
    };
    startCamera();
  }, [recordingID]);
  async function handleOnAddToForm() {
    const recording = activeRecordings.find((r) => r.id === recordingID);
    if (recording) {
      const fileName = `cv-video-${generateId(15)}.webm`;
      const file = new File([recording.blob], fileName, {
        type: "video/webm",
        lastModified: Date.now()
      });
      onAddToForm(file);
    }
  }
  async function pause() {
    if (recordingID) {
      await pauseRecording(recordingID);
      const now = Date.now();
      recordingTimeRef.current.elapsedTime += now - recordingTimeRef.current.startTime;
      recordingTimeRef.current.startTime = 0;
      clearInterval(progressIntervalRef.current);
    }
  }
  async function stop() {
    if (recordingID) {
      clearInterval(progressIntervalRef.current);
      await stopRecording(recordingID);
    }
  }
  async function resume() {
    if (recordingID) {
      await resumeRecording(recordingID);
      recordingTimeRef.current.startTime = Date.now();
      startNewRecordingInterval();
    }
  }
  async function newRecording() {
    clearAllRecordings();
    const recording = await createRecording();
    if (recording) {
      setRecordingID(recording.id);
      setProgress(0);
      setFormattedTime("00:00");
      recordingTimeRef.current = { startTime: 0, elapsedTime: 0 };
    }
  }
  async function start() {
    if (recordingID) {
      await startRecording(recordingID);
      recordingTimeRef.current.startTime = Date.now();
      startNewRecordingInterval();
    }
  }
  function startNewRecordingInterval() {
    progressIntervalRef.current = setInterval(() => {
      const elapsedTime = Date.now() - recordingTimeRef.current.startTime + recordingTimeRef.current.elapsedTime;
      const progress2 = Math.min(100, elapsedTime / 6e4 * 100);
      setProgress(progress2);
      setFormattedTime(formatTime(elapsedTime));
      if (progress2 >= 99) {
        stop();
      }
    }, 1e3);
  }
  if (errorMessage) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(VideoContainer, { children: "ERROR" });
  }
  return activeRecordings.map((r, i) => {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(React.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `${r.status !== "STOPPED" ? "hidden" : ""}`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(VideoContainer, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        VideoPreview,
        {
          ref: r.previewRef,
          onAddToForm: handleOnAddToForm,
          onNewRecording: newRecording
        }
      ) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `${r.status === "STOPPED" ? "hidden" : ""}`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(VideoContainer, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        VideoRecorder,
        {
          ref: r.webcamRef,
          formattedTime,
          progress,
          status: r.status,
          onPause: pause,
          onResume: resume,
          onStart: start,
          onStop: stop
        }
      ) }) })
    ] }, `video-recording-${r.id}`);
  });
}
function formatTime(milliseconds) {
  const totalSeconds = Math.floor(milliseconds / 1e3);
  const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, "0");
  const seconds = (totalSeconds % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}

const pdfSchema = z.any();
const videoSchema = z.any().optional();
const formSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  place: placeSchema,
  position: positionSchema,
  pdf: pdfSchema,
  video: videoSchema
});
function CVFormFields(props) {
  const [videoRecording, setVideoRecording] = reactExports.useState(false);
  const form = useForm({
    resolver: t(formSchema),
    defaultValues: {
      name: "",
      email: "",
      place: "Andújar",
      position: "Carnicería"
    }
  });
  const videoRef = form.register("video");
  const pdfRef = form.register("pdf");
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Form, { ...form, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "form",
    {
      onSubmit: form.handleSubmit(props.onSubmit),
      className: "space-y-4 max-w-lg mx-auto w-full",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          FormField,
          {
            control: form.control,
            name: "name",
            render: ({ field }) => /* @__PURE__ */ jsxRuntimeExports.jsxs(FormItem, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(FormLabel, { children: "Nombre" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(FormControl, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { ...field }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(FormMessage, {})
            ] })
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          FormField,
          {
            control: form.control,
            name: "email",
            render: ({ field }) => /* @__PURE__ */ jsxRuntimeExports.jsxs(FormItem, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(FormLabel, { children: "Email" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(FormControl, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { ...field }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(FormMessage, {})
            ] })
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          FormField,
          {
            control: form.control,
            name: "place",
            render: ({ field }) => /* @__PURE__ */ jsxRuntimeExports.jsxs(FormItem, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(FormLabel, { children: "Lugar" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { onValueChange: field.onChange, defaultValue: field.value, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(FormControl, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Seleccione el lugar" }) }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: places.map((place) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: place, children: place }, place)) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(FormMessage, {})
            ] })
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          FormField,
          {
            control: form.control,
            name: "position",
            render: ({ field }) => /* @__PURE__ */ jsxRuntimeExports.jsxs(FormItem, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(FormLabel, { children: "Puesto" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { onValueChange: field.onChange, defaultValue: field.value, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(FormControl, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Seleccione el puesto" }) }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: positions.map((position) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: position, children: position }, position)) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(FormMessage, {})
            ] })
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          FormField,
          {
            control: form.control,
            name: "pdf",
            render: () => /* @__PURE__ */ jsxRuntimeExports.jsxs(FormItem, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(FormLabel, { children: "CV" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(FormControl, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "file", ...pdfRef }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(FormMessage, {})
            ] })
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          FormField,
          {
            control: form.control,
            name: "video",
            render: () => /* @__PURE__ */ jsxRuntimeExports.jsxs(FormItem, { className: "w-full", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(FormLabel, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Button,
                  {
                    variant: "link",
                    type: "button",
                    className: "p-0",
                    onClick: () => {
                      if (videoRecording) {
                        setVideoRecording(false);
                      }
                    },
                    children: "Video"
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "/" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  Button,
                  {
                    variant: "link",
                    className: "p-0 flex items-center gap-2",
                    type: "button",
                    onClick: () => {
                      if (!videoRecording) {
                        setVideoRecording(true);
                      }
                    },
                    children: [
                      "Grabacion",
                      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-3 w-3 rounded-full bg-red-400" })
                    ]
                  }
                )
              ] }) }),
              videoRecording ? /* @__PURE__ */ jsxRuntimeExports.jsx(
                Video,
                {
                  onAddToForm: (recording) => {
                    const fileList = new DataTransfer();
                    fileList.items.add(recording);
                    form.setValue("video", fileList.files, {
                      shouldDirty: true,
                      shouldTouch: true
                    });
                    setVideoRecording(false);
                  }
                }
              ) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(FormControl, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "file", ...videoRef }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(FormMessage, {})
              ] })
            ] })
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "submit", children: "Enviar" })
      ]
    }
  ) });
}

const MAX_FILES = 2;
function CVForm() {
  const [mode, setMode] = reactExports.useState(
    "form"
  );
  const [params, setParams] = reactExports.useState(null);
  const [error, setError] = reactExports.useState(null);
  const { mutate: insertCV } = trpcReact.insertCV.useMutation({
    onSuccess: () => setMode("success"),
    onError: (error2) => {
      setMode("error");
      setError(error2.message || "Upload failed");
    }
  });
  const { startUpload } = useUploadThing("pdfAndVideo", {
    onUploadError: (error2) => {
      setMode("error");
      setError(error2.message || "Upload failed");
    }
  });
  async function onSubmit(values) {
    setMode("loading");
    const uploadedFiles = await startUpload(
      [values.pdf[0], values.video[0]].filter(Boolean)
    );
    if (!uploadedFiles || uploadedFiles.length < MAX_FILES) {
      setMode("error");
      setError("Upload failed");
      return;
    }
    setParams({
      name: values.name,
      email: values.email,
      place: values.place,
      position: values.position,
      attachments: uploadedFiles
    });
    setMode("success");
  }
  function tryAgain() {
    setMode("form");
    setParams(null);
    setError(null);
  }
  reactExports.useEffect(() => {
    if (mode === "success" && params) {
      insertCV(params);
    }
  }, [mode, params, insertCV]);
  if (mode === "success") {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-semibold text-xl text-slate-800", children: "Hemos recibido tu CV" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg text-slate-600", children: "¡Gracias por tu interés!" })
    ] });
  }
  if (mode === "error") {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { children: "Lamentablemente no pudimos recibir tu CV" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: error }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: tryAgain, children: "Inténtelo de nuevo" })
    ] });
  }
  if (mode === "loading") {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center flex-col gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(ReloadIcon, { className: "h-4 w-4 animate-spin mx-auto" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Estamos procesando tu CV..." })
    ] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(CVFormFields, { onSubmit });
}

function CVFormIsland() {
  const [queryClient] = reactExports.useState(() => new QueryClient());
  const [trpcClient] = reactExports.useState(
    () => trpcReact.createClient({
      links: [
        httpBatchLink({
          url: "http://localhost:4321/api/trpc"
        })
      ]
    })
  );
  return /* @__PURE__ */ jsxRuntimeExports.jsx(trpcReact.Provider, { client: trpcClient, queryClient, children: /* @__PURE__ */ jsxRuntimeExports.jsx(QueryClientProvider, { client: queryClient, children: /* @__PURE__ */ jsxRuntimeExports.jsx(CVForm, {}) }) });
}

const $$Astro = createAstro();
const $$Index = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Index;
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$Base, { "title": "Diaz Cadenas - Trabaja con nosotros", "classNames": "min-h-screen grid place-items-center" }, { "default": ($$result2) => renderTemplate` ${renderComponent($$result2, "CVFormIsland", CVFormIsland, { "client:load": true, "client:component-hydration": "load", "client:component-path": "@/components/cv-form/form.island", "client:component-export": "default" })} ` })}`;
}, "/Users/manuel/Desktop/juanma/diaz-cadenas-cvs/src/pages/index.astro", void 0);

const $$file = "/Users/manuel/Desktop/juanma/diaz-cadenas-cvs/src/pages/index.astro";
const $$url = "";

export { $$Index as default, $$file as file, $$url as url };

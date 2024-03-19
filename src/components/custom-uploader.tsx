import { useDropzone } from "@uploadthing/react";
import { generateClientDropzoneAccept } from "uploadthing/client";

import { useUploadThing } from "../utils/uploadthing";
import { useState, useCallback } from "react";

export function MultiUploader() {
  const [files, setFiles] = useState<File[]>([]);
  const onDrop = useCallback((acceptedFiles: File[]) => {
    console.log("adding files");
    setFiles(acceptedFiles);
  }, []);

  const { startUpload, permittedFileInfo } = useUploadThing("videoAndImage", {
    onClientUploadComplete: (data) => {
      console.log("uploaded successfully!");
    },
    onUploadError: () => {
      console.log("error occurred while uploading");
    },
    onUploadBegin: () => {
      console.log("upload has begun");
    },
  });

  const fileTypes = permittedFileInfo?.config
    ? Object.keys(permittedFileInfo?.config)
    : [];

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: fileTypes ? generateClientDropzoneAccept(fileTypes) : undefined,
  });

  return (
    <div className="min-h-40 bg-gray-300" {...getRootProps()}>
      <input {...getInputProps()} />
      <input type="file" />
      <div>
        {files.length > 0 && (
          <button onClick={() => startUpload(files)}>
            Upload {files.length} files
          </button>
        )}
      </div>
      Drop files here!
    </div>
  );
}

import type {
  ClientUploadedFileData,
  UploadFileResult,
} from "uploadthing/types";
import { useUploadThing } from "../utils/uploadthing";
import CVFormFields, { type FormValues } from "./cv-form-fields";

export type UploadedFileInfo = {
  name: string;
  url: string;
  key: string;
  size: number;
  type: string;
};

export default function CVForm() {
  const { startUpload, permittedFileInfo, isUploading } = useUploadThing(
    "videoAndImage",
    {
      onClientUploadComplete: (files: UploadedFileInfo[]) => {
        console.log("uploaded successfully!");
        console.log(files);
      },
      onUploadError: () => {
        console.log("error occurred while uploading");
      },
      onUploadBegin: () => {
        console.log("upload has begun");
      },
    }
  );

  function onSubmit(values: FormValues) {
    console.log(values);
    console.log("Files uploading");
    startUpload([values.cvTextFile!, values.cvVideoFile!]);
  }

  return <CVFormFields onSubmit={onSubmit} isWorking={isUploading} />;
}

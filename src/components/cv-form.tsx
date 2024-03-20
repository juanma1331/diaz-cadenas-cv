import { useUploadThing } from "../utils/uploadthing";
import CVFormFields, { type FormValues } from "./cv-form-fields";
import type { InsertCVParams, UploadedFile } from "../pages/api/insert-cv";
import { useMutation } from "react-query";

const insertCV = async (params: InsertCVParams) => {
  const response = await fetch("/api/insert-cv", {
    method: "POST",
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    throw new Error("Failed to insert CV");
  }
};

export default function CVForm() {
  const insertCVMutation = useMutation(insertCV, {
    onSuccess: () => {
      console.log("CV inserted successfully");
    },
  });

  const { startUpload, permittedFileInfo, isUploading } = useUploadThing(
    "videoAndImage",
    {
      onClientUploadComplete: () => {
        console.log("upload completed on client");
      },
      onUploadError: () => {
        console.log("error occurred while uploading");
      },
      onUploadBegin: () => {
        console.log("upload has begun");
      },
    }
  );

  async function onSubmit(values: FormValues) {
    console.log("Files uploading");
    const uploadedFiles = await startUpload([
      values.cvTextFile!,
      values.cvVideoFile!,
    ]);

    const inserParams = {
      name: values.name,
      email: values.email,
      place: values.place,
      position: values.position,
      attachments: uploadedFiles as UploadedFile[],
    };

    console.log("Inserting CV");
    insertCVMutation.mutate(inserParams);
  }

  return (
    <CVFormFields
      onSubmit={onSubmit}
      isWorking={isUploading || insertCVMutation.isLoading}
    />
  );
}

import { useUploadThing } from "../utils/uploadthing";
import CVFormFields, { type FormValues } from "./cv-form-fields";
import { trpcReact } from "../client";
import type { UploadedFile } from "@/server/routes/insert-cv.route";

export default function CVForm() {
  const { mutate: insertCV, isLoading: isInsertingCV } =
    trpcReact.insertCV.useMutation({
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
    insertCV(inserParams);
  }

  return (
    <CVFormFields
      onSubmit={onSubmit}
      isWorking={isUploading || isInsertingCV}
    />
  );
}

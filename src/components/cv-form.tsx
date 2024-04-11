import { useUploadThing } from "../utils/uploadthing";
import CVFormFields, { type FormValues } from "./cv-form-fields";
import { trpcReact } from "../client";
import type { UploadedFile } from "@/server/routes/insert-cv.route";
import { useEffect, useState } from "react";
import type { RouterInputs } from "@/server/utils";
import { Button } from "./ui/button";
import { ReloadIcon } from "@radix-ui/react-icons";

const MAX_FILES = 2;

type InsertParams = RouterInputs["insertCV"];

export default function CVForm() {
  const [mode, setMode] = useState<"form" | "loading" | "success" | "error">(
    "form"
  );
  const [params, setParams] = useState<InsertParams | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { mutate: insertCV } = trpcReact.insertCV.useMutation({
    onSuccess: () => setMode("success"),
    onError: (error) => {
      setMode("error");
      setError(error.message || "Upload failed");
    },
  });

  const { startUpload } = useUploadThing("pdfAndVideo", {
    onUploadError: (error) => {
      setMode("error");
      setError(error.message || "Upload failed");
    },
  });

  async function onSubmit(values: FormValues) {
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
      attachments: uploadedFiles as UploadedFile[],
    });
    setMode("success");
  }

  function tryAgain() {
    setMode("form");
    setParams(null);
    setError(null);
  }

  useEffect(() => {
    if (mode === "success" && params) {
      insertCV(params);
    }
  }, [mode, params, insertCV]);

  if (mode === "success") {
    return (
      <div className="flex flex-col items-center">
        <h1 className="font-semibold text-xl text-slate-800">
          Hemos recibido tu CV
        </h1>
        <h2 className="text-lg text-slate-600">¡Gracias por tu interés!</h2>
      </div>
    );
  }

  if (mode === "error") {
    return (
      <div className="flex flex-col items-center gap-2">
        <h1>Lamentablemente no pudimos recibir tu CV</h1>
        <span>{error}</span>
        <Button onClick={tryAgain}>Inténtelo de nuevo</Button>
      </div>
    );
  }

  if (mode === "loading") {
    return (
      <div className="flex items-center flex-col gap-2">
        <ReloadIcon className="h-4 w-4 animate-spin mx-auto" />
        <p>Estamos procesando tu CV...</p>
      </div>
    );
  }

  return <CVFormFields onSubmit={onSubmit} />;
}

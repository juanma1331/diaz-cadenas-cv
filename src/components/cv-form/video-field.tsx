import type { UseFormRegisterReturn, UseFormReturn } from "react-hook-form";
import type { FormValues } from "./fields";
import { useState } from "react";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Trash2, Video as VideoIcon } from "lucide-react";
import Video from "./video/video";
import { toast } from "sonner";

type VideoFormFieldProps = {
  form: UseFormReturn<FormValues>;
  videoRef: UseFormRegisterReturn<"video">;
};

export default function VideoFormField({
  form,
  videoRef,
}: VideoFormFieldProps) {
  const [videoRecording, setVideoRecording] = useState<boolean>(false);
  const [hasRecorded, setHasRecorded] = useState<boolean>(false);

  return (
    <FormField
      control={form.control}
      name="video"
      render={() => (
        <FormItem className="w-full">
          <FormLabel asChild>
            <div className="flex items-center gap-2">
              <Button
                variant="link"
                type="button"
                className="p-0 text-sm font-medium leading-none"
                style={{ color: "rgb(2, 8, 23)" }}
                onClick={() => {
                  if (videoRecording) {
                    setVideoRecording(false);
                  }
                }}
              >
                Video
              </Button>
              <span>/</span>
              <Button
                variant="link"
                className="p-0 flex items-center gap-2 text-sm font-medium leading-none"
                style={{ color: "rgb(2, 8, 23)" }}
                type="button"
                onClick={async () => {
                  if (!videoRecording) {
                    const canRecord = await browserCanRecordVideo();

                    if (!canRecord) {
                      toast.error(
                        "Lamentablemente tú navegador no soporta la grabación de vídeo."
                      );
                      return;
                    }

                    setVideoRecording(true);
                  }
                }}
              >
                Grabación
                <div className="h-3 w-3 rounded-full bg-red-400"></div>
              </Button>
            </div>
          </FormLabel>

          {!videoRecording && hasRecorded && (
            <RecordedVideo
              name={getVideoName(form)}
              onDelete={() => {
                form.setValue("video", undefined);
                setHasRecorded(false);
              }}
            />
          )}

          {videoRecording && (
            <Video
              onAddToForm={(recording) => {
                const fileList = new DataTransfer();
                fileList.items.add(recording);

                form.setValue("video", fileList.files, {
                  shouldDirty: true,
                  shouldTouch: true,
                });
                setVideoRecording(false);
                setHasRecorded(true);
              }}
            />
          )}

          {!videoRecording && !hasRecorded && (
            <>
              <FormControl>
                <Input type="file" {...videoRef} />
              </FormControl>
              <FormMessage />
              <FormDescription>
                Se admite formato MP4 con un peso máximo de 32mb
              </FormDescription>
            </>
          )}
        </FormItem>
      )}
    />
  );
}

type RecordedVideoProps = {
  onDelete: () => void;
  name: string;
};

function RecordedVideo({ onDelete, name }: RecordedVideoProps) {
  return (
    <div className="flex items-center justify-between border border-border pl-3 rounded-md">
      <div className="flex items-center gap-2 overflow-hidden">
        <VideoIcon className="w-4 h-4" />
        <p className=" text-sm truncate text-muted-foreground">{name}</p>
      </div>
      <Button
        onClick={() => onDelete()}
        size="icon"
        variant="ghost"
        type="button"
      >
        <Trash2 className="w-4 h-4 text-red-400" />
      </Button>
    </div>
  );
}

async function browserCanRecordVideo() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    const devices = await navigator.mediaDevices.enumerateDevices();
    const hasVideoDevice = devices.some(
      (device) => device.kind === "videoinput"
    );
    stream.getTracks().forEach((track) => track.stop());
    return hasVideoDevice;
  } catch (error) {
    console.error("Error checking devices:", error);
    return false;
  }
}

function getVideoName(form: UseFormReturn<FormValues>) {
  const fileList = form.getValues("video") as FileList;
  const video = fileList.item(0);

  if (!video) throw new Error("Not video file found");

  return video.name;
}

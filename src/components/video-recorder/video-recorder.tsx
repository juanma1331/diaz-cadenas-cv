import { useRecordWebcam } from "react-record-webcam";
import { generateId } from "lucia";
import { Button } from "../ui/button";
import React, { useEffect, useState } from "react";
import { Circle, OctagonX, Pause, Play } from "lucide-react";
import { AspectRatio } from "../ui/aspect-ratio";

export type VideoRecording = {
  id: string;
  previewRef: React.RefObject<HTMLVideoElement>;
  webcamRef: React.RefObject<HTMLVideoElement>;
  blob?: Blob;
  status:
    | "INITIAL"
    | "CLOSED"
    | "OPEN"
    | "RECORDING"
    | "STOPPED"
    | "ERROR"
    | "PAUSED";
};

export default function VideoRecorder() {
  const [recording, setRecording] = useState<VideoRecording | undefined>();
  const [videoUrl, setVideoUrl] = useState<string | undefined>();
  const [viewRecording, setViewRecording] = useState<boolean>(false);

  const {
    createRecording,
    activeRecordings,
    openCamera,
    startRecording,
    stopRecording,
    errorMessage,
    pauseRecording,
  } = useRecordWebcam({
    options: {
      fileName: `cv-video-${generateId(15)}`,
      fileType: "webm",
      timeSlice: 1000,
    },
    mediaRecorderOptions: { mimeType: "video/webm; codecs=vp8" },
  });

  useEffect(() => {
    async function start() {
      const recording = await createRecording();
      if (recording) {
        await openCamera(recording.id);
        setRecording(recording);
      }
    }

    start();
  }, []);

  async function start() {
    if (recording) {
      if (videoUrl) URL.revokeObjectURL(videoUrl);
      await startRecording(recording.id);
    }
  }

  async function pause() {
    if (recording) {
      await pauseRecording(recording.id);
    }
  }

  async function stop() {
    if (recording) {
      const recorded = await stopRecording(recording.id);
      if (recorded && recorded.blob) {
        const url = URL.createObjectURL(recorded.blob);
        setVideoUrl(url);
      }
    }
  }

  if (viewRecording) {
    return (
      <div className="space-y-2 w-[56rem] rounded-md mx-auto p-2 border border-border">
        <div>
          <AspectRatio className="bg-slate-300 relative" ratio={16 / 9}>
            <video className="w-full rounded-md" src={videoUrl} controls />
          </AspectRatio>
        </div>

        <div className="max-w-fit mx-auto space-x-2">
          <Button
            size="sm"
            variant="outline"
            className="border-green-500"
            onClick={() => setViewRecording(false)}
          >
            Cerrar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2 w-[56rem] rounded-md mx-auto p-2 border border-border">
      <div>
        {activeRecordings.map((r, i) => (
          <AspectRatio
            className="bg-slate-300 relative"
            ratio={16 / 9}
            key={`active-recording-${i}`}
          >
            <video className="w-full rounded-md" ref={r.webcamRef} />

            {r.status === "RECORDING" && (
              <div className="absolute top-1 right-1 flex items-center bg-background text-foreground border border-red-500 p-1 rounded-md">
                <span className="text-xs">Grabando</span>
                <Circle className="ml-2 w-3.5 h-3.5 text-red-500" />
              </div>
            )}
          </AspectRatio>
        ))}
      </div>

      {activeRecordings.map((r, i) => (
        <div
          className="max-w-fit mx-auto"
          key={`active-recording-controls-${i}`}
        >
          {r.status !== "RECORDING" && (
            <Button
              size="icon"
              variant="outline"
              className="border-emerald-500"
              onClick={async () => await start()}
            >
              <Play className="w-3.5 h-3.5 text-emerald-500" />
            </Button>
          )}

          {r.status !== "PAUSED" && (
            <Button
              size="icon"
              variant="outline"
              className="border-yellow-500 ml-2"
              onClick={async () => await pause()}
            >
              <Pause className="w-3.5 h-3.5 text-yellow-500" />
            </Button>
          )}

          {r.status !== "STOPPED" && (
            <Button
              size="icon"
              variant="outline"
              className="border-red-500 ml-2"
              onClick={async () => await stop()}
            >
              <OctagonX className="w-3.5 h-3.5 text-red-500" />
            </Button>
          )}

          {r.status === "STOPPED" && (
            <Button
              size="sm"
              variant="outline"
              className="ml-4"
              onClick={() => setViewRecording(true)}
            >
              Previsualizar
            </Button>
          )}
        </div>
      ))}
    </div>
  );
}

function VideoContainer({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>;
}

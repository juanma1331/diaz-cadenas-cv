import { useRecordWebcam, ERROR_MESSAGES } from "react-record-webcam";
import { generateId } from "lucia";
import { Button } from "../ui/button";
import React, { useEffect, useState } from "react";
import {
  Circle,
  CircleX,
  Download,
  Eye,
  OctagonX,
  Pause,
  Play,
  Plus,
  Save,
  Square,
  SwitchCamera,
  Video,
} from "lucide-react";
import { AspectRatio } from "../ui/aspect-ratio";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";

export type VideoRecording = {
  id: string;
  previewRef: React.RefObject<HTMLVideoElement>;
  webcamRef: React.RefObject<HTMLVideoElement>;
  blob?: Blob;
  fileName: string;
  fileType: string;
};

export type VideoRecorderProps = {
  onAddToForm: (recording: File) => void;
};

export default function VideoRecorder({ onAddToForm }: VideoRecorderProps) {
  const [recordingID, setRecordingID] = useState<string | undefined>();
  const [videoUrl, setVideoUrl] = useState<string | undefined>();

  const {
    createRecording,
    activeRecordings,
    openCamera,
    startRecording,
    stopRecording,
    resumeRecording,
    errorMessage,
    pauseRecording,
  } = useRecordWebcam({
    options: {
      fileType: "video/webm",
      timeSlice: 1000,
    },
    mediaRecorderOptions: { mimeType: "video/webm; codecs=vp8" },
  });

  useEffect(() => {
    const startNewRecording = async () => await newRecording();

    startNewRecording();
  }, []);

  useEffect(() => {
    const startCamera = async () => {
      if (recordingID) {
        await openCamera(recordingID);
      }
    };

    startCamera();
  }, [recordingID]);

  async function handleOnAddToForm() {
    if (recordingID && videoUrl) {
      const recording = activeRecordings.find((r) => r.id === recordingID);

      if (recording) {
        const fileName = `cv-video-${generateId(15)}.webm`;
        const file = new File([recording.blob!], fileName, {
          type: "video/webm",
          lastModified: Date.now(),
        });

        onAddToForm(file);
      }
    }
  }

  async function pause() {
    if (recordingID) {
      await pauseRecording(recordingID);
    }
  }

  async function stop() {
    if (recordingID) {
      const recorded = await stopRecording(recordingID);
      if (recorded && recorded.blob) {
        const url = URL.createObjectURL(recorded.blob);
        setVideoUrl(url);
      }
    }
  }

  async function resume() {
    if (recordingID) {
      await resumeRecording(recordingID);
    }
  }

  async function newRecording() {
    if (videoUrl) {
      URL.revokeObjectURL(videoUrl);
      setVideoUrl(undefined);
    }

    const recording = await createRecording();
    if (recording) {
      setRecordingID(recording.id);
    }
  }

  async function start() {
    if (recordingID) {
      await startRecording(recordingID);
    }
  }

  if (errorMessage) {
    return <VideoContainer>ERROR</VideoContainer>;
  }

  if (videoUrl) {
    return (
      <VideoContainer>
        <div>
          <AspectRatio className="relative" ratio={16 / 9}>
            <video className="w-full rounded-md" src={videoUrl} controls />

            <div className="absolute bottom-14 bg-transparent transform left-1/2 -translate-x-1/2 space-x-2 ">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="icon"
                      variant="outline"
                      type="button"
                      className="rounded-full border-none bg-gray-800 group"
                      onClick={async (e) => {
                        e.stopPropagation();
                        await handleOnAddToForm();
                      }}
                    >
                      <Download className="w-3.5 h-3.5 text-gray-200 group-hover:text-gray-600" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Añadir al formulario</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="icon"
                      variant="outline"
                      type="button"
                      className="rounded-full border-none bg-gray-800 group"
                      onClick={async (e) => {
                        e.stopPropagation();
                        await newRecording();
                      }}
                    >
                      <Plus className="w-3.5 h-3.5 text-gray-200 group-hover:text-gray-600" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Nueva grabación</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </AspectRatio>
        </div>
      </VideoContainer>
    );
  }

  return (
    <VideoContainer>
      <div>
        {activeRecordings.map((r, i) => (
          <AspectRatio
            className="relative"
            ratio={16 / 9}
            key={`active-recording-${i}`}
          >
            <video className="w-full rounded-md" ref={r.webcamRef} />

            {/* Status feedback */}
            {r.status === "RECORDING" && (
              <Circle className="ml-2 w-3.5 h-3.5 text-red-600 absolute top-1 right-3" />
            )}

            {r.status === "PAUSED" && (
              <Pause className="ml-2 w-3.5 h-3.5 text-blue-600 absolute top-1 right-3" />
            )}

            {r.status === "STOPPED" && (
              <Square className="ml-2 w-3.5 h-3.5 text-red-600 absolute top-1 right-3" />
            )}
            {/* Controls */}
            {r.status === "INITIAL" ||
              (r.status === "OPEN" && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="icon"
                        variant="outline"
                        type="button"
                        className="border-none bg-gray-800 rounded-full group absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                        onClick={async (e) => {
                          e.stopPropagation();
                          await start();
                        }}
                      >
                        <Video className="w-3.5 h-3.5 text-gray-200 group-hover:text-gray-600" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Comenzar grabación</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}

            {r.status === "RECORDING" && (
              <div className="absolute bottom-2 bg-transparent transform left-1/2 -translate-x-1/2 space-x-2 ">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="icon"
                        variant="outline"
                        type="button"
                        className="rounded-full border-none bg-gray-800 group"
                        onClick={async (e) => {
                          e.stopPropagation();
                          await pause();
                        }}
                      >
                        <Pause className="w-3.5 h-3.5 text-gray-200 group-hover:text-gray-600" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Pausar grabación</TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="icon"
                        variant="outline"
                        type="button"
                        className="rounded-full border-none bg-gray-800 group"
                        onClick={async (e) => {
                          e.stopPropagation();
                          await stop();
                        }}
                      >
                        <Square className="w-3.5 h-3.5 text-gray-200 group-hover:text-gray-600" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Finalizar grabación</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            )}

            {r.status === "PAUSED" && (
              <div className="absolute bottom-2 bg-transparent transform left-1/2 -translate-x-1/2 space-x-2 ">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="icon"
                        variant="outline"
                        type="button"
                        className="border-none bg-gray-800 rounded-full group"
                        onClick={async (e) => {
                          e.stopPropagation();
                          await resume();
                        }}
                      >
                        <SwitchCamera className="w-3.5 h-3.5 text-gray-200 group-hover:text-gray-600" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Reanudar grabación</TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="icon"
                        variant="outline"
                        type="button"
                        className="rounded-full border-none bg-gray-800 group"
                        onClick={async (e) => {
                          e.stopPropagation();
                          await stop();
                        }}
                      >
                        <Square className="w-3.5 h-3.5 text-gray-200 group-hover:text-gray-600" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Finalizar grabación</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            )}
          </AspectRatio>
        ))}
      </div>
    </VideoContainer>
  );
}

function VideoContainer({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-2 w-[32rem] rounded-md mx-auto p-2 border border-border">
      {children}
    </div>
  );
}

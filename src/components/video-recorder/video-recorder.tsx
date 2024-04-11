import { useRecordWebcam, ERROR_MESSAGES } from "react-record-webcam";
import { generateId } from "lucia";
import { Button } from "../ui/button";
import React, { useEffect, useRef, useState } from "react";
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
import { Progress } from "../ui/progress";

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
  const [progress, setProgress] = useState<number>(0);
  const [formattedTime, setFormattedTime] = useState<string>("00:00");
  const recordingTimeRef = useRef<{ startTime: number; elapsedTime: number }>({
    startTime: 0,
    elapsedTime: 0,
  });
  const progressIntervalRef = useRef<NodeJS.Timeout>();

  const {
    createRecording,
    activeRecordings,
    openCamera,
    startRecording,
    stopRecording,
    clearAllRecordings,
    resumeRecording,
    errorMessage,
    devicesById,
    devicesByType,
    pauseRecording,
  } = useRecordWebcam({
    options: {
      fileType: "video/webm",
      timeSlice: 1000,
    },
    mediaRecorderOptions: { mimeType: "video/webm; codecs=vp8" },
  });

  useEffect(() => {
    console.log(devicesById); // TODO: Research this
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
      // Calcular el tiempo transcurrido hasta la pausa y actualizar elapsedTime
      const now = Date.now();
      recordingTimeRef.current.elapsedTime +=
        now - recordingTimeRef.current.startTime;
      recordingTimeRef.current.startTime = 0; // Resetear startTime o marcar de alguna manera que la grabación está pausada
      clearInterval(progressIntervalRef.current);
    }
  }

  async function stop() {
    if (recordingID) {
      clearInterval(progressIntervalRef.current);
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
      // Establecer un nuevo startTime para el segmento de grabación que comienza
      recordingTimeRef.current.startTime = Date.now();
      progressIntervalRef.current = setInterval(startRecordingProgress, 1000);
      // No es necesario actualizar elapsedTime hasta que se pause o detenga nuevamente
    }
  }

  async function newRecording() {
    if (videoUrl) {
      URL.revokeObjectURL(videoUrl);
      setVideoUrl(undefined);
    }

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
      progressIntervalRef.current = setInterval(startRecordingProgress, 1000);
    }
  }

  function startRecordingProgress() {
    const elapsedTime =
      Date.now() -
      recordingTimeRef.current.startTime +
      recordingTimeRef.current.elapsedTime;
    const progress = Math.min(100, (elapsedTime / 60000) * 100);
    setProgress(progress);
    setFormattedTime(formatTime(elapsedTime));
    if (progress >= 100) {
      stop();
    }
  }

  if (errorMessage) {
    return <VideoContainer>ERROR</VideoContainer>;
  }

  if (videoUrl) {
    return (
      <VideoContainer>
        <div>
          {activeRecordings.map((r, i) => (
            <AspectRatio className="relative" ratio={16 / 9}>
              <video
                className="w-full rounded-md"
                ref={r.previewRef}
                controls
              />

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
          ))}
        </div>
      </VideoContainer>
    );
  }

  return (
    <VideoContainer>
      <div>
        {activeRecordings.map((r, i) => (
          <AspectRatio
            className="relative overflow-hidden"
            ratio={16 / 9}
            key={`active-recording-${i}`}
          >
            <video className="w-full rounded-md" ref={r.webcamRef} />

            {/* Progress bar */}
            {(r.status === "RECORDING" ||
              r.status === "PAUSED" ||
              r.status === "STOPPED") && (
              <div className="flex items-center gap-2 absolute top-1 w-[50%] left-1/2 -translate-x-1/2">
                <Progress value={progress} className="h-1 " />

                <span className="text-xs text-white">{formattedTime}</span>
              </div>
            )}

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

function formatTime(milliseconds: number) {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (totalSeconds % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}

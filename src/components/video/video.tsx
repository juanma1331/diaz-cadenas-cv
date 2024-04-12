import { useRecordWebcam, ERROR_MESSAGES, STATUS } from "react-record-webcam";
import { generateId } from "lucia";
import { Button } from "../ui/button";
import React, { forwardRef, useEffect, useRef, useState } from "react";
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
  Video as VideoIcon,
} from "lucide-react";
import { AspectRatio } from "../ui/aspect-ratio";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { RedProgress } from "../ui/progress";

export type VideoProps = {
  onAddToForm: (recording: File) => void;
};

export default function Video({ onAddToForm }: VideoProps) {
  const [recordingID, setRecordingID] = useState<string | undefined>();
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
      fileType: "webm",
      timeSlice: 1000,
    },
    mediaRecorderOptions: { mimeType: "video/webm; codecs=vp8" },
    mediaTrackConstraints: {},
  });

  // Start new recording on component mount
  useEffect(() => {
    // We should check if device has webcam
    const startNewRecording = async () => await newRecording();

    startNewRecording();
  }, []);

  // Start a new camera whenever recordingID changes
  useEffect(() => {
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
      const file = new File([recording.blob!], fileName, {
        type: "video/webm",
        lastModified: Date.now(),
      });

      onAddToForm(file);
    }
  }

  async function pause() {
    if (recordingID) {
      await pauseRecording(recordingID);

      const now = Date.now();
      recordingTimeRef.current.elapsedTime +=
        now - recordingTimeRef.current.startTime;
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
      const elapsedTime =
        Date.now() -
        recordingTimeRef.current.startTime +
        recordingTimeRef.current.elapsedTime;
      const progress = Math.min(100, (elapsedTime / 60000) * 100);
      setProgress(progress);
      setFormattedTime(formatTime(elapsedTime));

      if (progress >= 99) {
        // With >= 99 we get an exact 1min video
        stop();
      }
    }, 1000);
  }

  if (errorMessage) {
    return <VideoContainer>ERROR</VideoContainer>;
  }

  return activeRecordings.map((r, i) => {
    return (
      <React.Fragment key={`video-recording-${r.id}`}>
        <div className={`${r.status !== "STOPPED" ? "hidden" : ""}`}>
          <VideoContainer>
            <VideoPreview
              ref={r.previewRef}
              onAddToForm={handleOnAddToForm}
              onNewRecording={newRecording}
            />
          </VideoContainer>
        </div>

        <div className={`${r.status === "STOPPED" ? "hidden" : ""}`}>
          <VideoContainer>
            <VideoRecorder
              ref={r.webcamRef}
              formattedTime={formattedTime}
              progress={progress}
              status={r.status}
              onPause={pause}
              onResume={resume}
              onStart={start}
              onStop={stop}
            />
          </VideoContainer>
        </div>
      </React.Fragment>
    );
  });
}

const VideoContainer = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="space-y-2 w-[32rem] rounded-md mx-auto p-2 border border-border">
      {children}
    </div>
  );
};

type VideoRecorderProps = {
  status: (typeof STATUS)[keyof typeof STATUS];
  progress: number;
  formattedTime: string;
  onStart: () => Promise<void>;
  onStop: () => Promise<void>;
  onPause: () => Promise<void>;
  onResume: () => Promise<void>;
};
const VideoRecorder = forwardRef(
  (
    {
      status,
      progress,
      formattedTime,
      onStart,
      onStop,
      onPause,
      onResume,
    }: VideoRecorderProps,
    ref: React.Ref<HTMLVideoElement>
  ) => {
    return (
      <AspectRatio className="relative overflow-hidden" ratio={16 / 9}>
        <video className="w-full rounded-md" ref={ref} />

        {/* Progress bar */}
        {(status === "RECORDING" || status === "PAUSED") && (
          <div className="flex items-center justify-center gap-2 absolute top-1 left-0 right-0">
            <RedProgress value={progress} className="h-1 max-w-[50%]" />
            <div className="flex items-center justify-between p-1 bg-slate-800/50 w-[60px] rounded-full">
              <span className="text-xs text-white">{formattedTime}</span>
              {status === "PAUSED" && (
                <Pause className="w-3.5 h-3.5 text-red-400" />
              )}

              {status === "RECORDING" && (
                <div className="w-3 h-3 rounded-full bg-red-400"></div>
              )}
            </div>
          </div>
        )}

        {/* Controls */}
        {status === "INITIAL" ||
          (status === "OPEN" && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="icon"
                    variant="outline"
                    type="button"
                    className="border-none bg-gray-800/20 hover:bg-gray-800/80 rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                    onClick={async (e) => {
                      await onStart();
                    }}
                  >
                    <div className="w-3 h-3 rounded-full bg-red-600 "></div>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Comenzar grabación</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}

        {status === "RECORDING" && (
          <div className="absolute bottom-2 bg-transparent transform left-1/2 -translate-x-1/2 space-x-2 ">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="icon"
                    variant="outline"
                    type="button"
                    className="rounded-full border-none bg-gray-800/20 hover:bg-gray-800/80 group"
                    onClick={async (e) => {
                      await onPause();
                    }}
                  >
                    <Pause className="w-3.5 h-3.5 text-gray-200 group-hover:text-white" />
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
                    className="rounded-full border-none bg-gray-800/20 hover:bg-gray-800/80 group"
                    onClick={async (e) => {
                      await onStop();
                    }}
                  >
                    <Square className="w-3.5 h-3.5 text-gray-200 group-hover:text-white" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Finalizar grabación</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        )}

        {status === "PAUSED" && (
          <div className="absolute bottom-2 bg-transparent transform left-1/2 -translate-x-1/2 space-x-2 ">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="icon"
                    variant="outline"
                    type="button"
                    className="border-none rounded-full bg-gray-800/20 hover:bg-gray-800/80 group"
                    onClick={async (e) => {
                      await onResume();
                    }}
                  >
                    <SwitchCamera className="w-3.5 h-3.5 text-gray-200 group-hover:text-white" />
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
                    className="rounded-full border-none bg-gray-800/20 hover:bg-gray-800/80 group"
                    onClick={async (e) => {
                      await onStop();
                    }}
                  >
                    <Square className="w-3.5 h-3.5 text-gray-200 group-hover:text-white" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Finalizar grabación</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        )}
      </AspectRatio>
    );
  }
);

type VideoPreviewProps = {
  onAddToForm: () => void;
  onNewRecording: () => void;
};
const VideoPreview = forwardRef(
  (
    { onAddToForm, onNewRecording }: VideoPreviewProps,
    ref: React.Ref<HTMLVideoElement>
  ) => {
    return (
      <div className="space-y-1">
        <AspectRatio ratio={16 / 9}>
          <video className="w-full rounded-md" ref={ref} controls />
        </AspectRatio>
        <div className="flex justify-center items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            type="button"
            onClick={async (e) => {
              onAddToForm();
            }}
          >
            Guardar
            <Download className="ml-2 w-3.5 h-3.5" />
          </Button>

          <Button
            size="sm"
            variant="secondary"
            type="button"
            onClick={async (e) => {
              onNewRecording();
            }}
          >
            Nueva
            <Plus className="ml-2 w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    );
  }
);

function formatTime(milliseconds: number) {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (totalSeconds % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}

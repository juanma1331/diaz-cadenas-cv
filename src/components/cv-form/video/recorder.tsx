import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Button } from "@/components/ui/button";
import { RedProgress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Pause, Square, SwitchCamera } from "lucide-react";
import { forwardRef } from "react";
import type { STATUS } from "react-record-webcam";

type VideoRecorderProps = {
  status: (typeof STATUS)[keyof typeof STATUS];
  progress: number;
  formattedTime: string;
  onStart: () => Promise<void>;
  onStop: () => Promise<void>;
  onPause: () => Promise<void>;
  onResume: () => Promise<void>;
};
export const VideoRecorder = forwardRef(
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

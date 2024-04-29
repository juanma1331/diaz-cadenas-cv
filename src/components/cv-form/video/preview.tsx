import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Button } from "@/components/ui/button";
import { Download, Plus } from "lucide-react";
import { forwardRef } from "react";

type VideoPreviewProps = {
  onAddToForm: () => void;
  onNewRecording: () => void;
};
export const VideoPreview = forwardRef(
  (
    { onAddToForm, onNewRecording }: VideoPreviewProps,
    ref: React.Ref<HTMLVideoElement>
  ) => {
    return (
      <div className="space-y-1">
        <AspectRatio ratio={16 / 9}>
          <video className="w-full rounded-md h-full" ref={ref} controls />
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

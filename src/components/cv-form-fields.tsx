import { useForm } from "react-hook-form";
import { Button } from "./ui/button";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../components/ui/form";
import { Input } from "./ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "../components/ui/select";

import {
  emailSchema,
  nameSchema,
  placeSchema,
  positionSchema,
} from "@/server/routes/insert-cv.route";
import { places, positions } from "@/constants";
import { Video } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import { useState } from "react";
import VideoRecorder from "./video-recorder/video-recorder";

const pdfSchema = z.any();

const videoSchema = z.any().optional();

const formSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  place: placeSchema,
  position: positionSchema,
  pdf: pdfSchema,
  video: videoSchema,
});

export type FormValues = z.infer<typeof formSchema>;

export type CVFormFieldsProps = {
  onSubmit: (values: FormValues) => void;
};

export default function CVFormFields(props: CVFormFieldsProps) {
  const [videoRecording, setVideoRecording] = useState<boolean>(false);
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      place: "Andújar",
      position: "Carnicería",
    },
  });

  const videoRef = form.register("video");
  const pdfRef = form.register("pdf");

  console.log(form.getValues());

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(props.onSubmit)}
        className="space-y-4 max-w-lg mx-auto w-full"
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="place"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Lugar</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione el lugar" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {places.map((place) => (
                    <SelectItem key={place} value={place}>
                      {place}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="position"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Puesto</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione el puesto" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {positions.map((position) => (
                    <SelectItem key={position} value={position}>
                      {position}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="pdf"
          render={() => (
            <FormItem>
              <FormLabel>CV</FormLabel>
              <FormControl>
                <Input type="file" {...pdfRef} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex items-end gap-2 justify-between">
          <FormField
            control={form.control}
            name="video"
            render={() => (
              <FormItem className="w-full">
                <FormLabel>Video</FormLabel>
                <FormControl>
                  <Input type="file" {...videoRef} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={(e) => {
                    e.preventDefault();
                    setVideoRecording((prev) => !prev);
                  }}
                >
                  <Video className="w-3.5 h-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Grabación de vídeo</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {videoRecording && (
          <div>
            <VideoRecorder
              onAddToForm={(recording) => {
                const fileList = new DataTransfer();
                fileList.items.add(recording);

                form.setValue("video", fileList.files, {
                  shouldDirty: true,
                  shouldTouch: true,
                });
                setVideoRecording(false);
              }}
            />
          </div>
        )}

        <Button type="submit">Enviar</Button>
      </form>
    </Form>
  );
}

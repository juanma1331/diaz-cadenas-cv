import { useForm } from "react-hook-form";
import { Button } from "../ui/button";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "../ui/select";

import {
  emailSchema,
  nameSchema,
  placeSchema,
  positionSchema,
} from "@/server/routes/insert-cv.route";
import { PLACES, POSITIONS } from "@/constants";

import VideoFormField from "./video-field";

const MAX_PDF_SIZE = 4194304; // 4mb

const ACCEPTED_VIDEO_FORMATS = ["video/mp4", "video/webm"];

const MAX_VIDEO_SIZE = 33554432; // 32mb

const pdfSchema = z.any().superRefine((fileList, ctx) => {
  if (fileList.length !== 1) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Se requiere un pdf",
    });
    return;
  }

  const file = fileList[0];

  if (file.type !== "application/pdf") {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Únicamente se permite formato pdf",
    });
  }

  if (file.size >= MAX_PDF_SIZE) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "El peso máximo es 4mb",
    });
  }
});

const videoSchema = z
  .any()
  .superRefine((fileList, ctx) => {
    if (fileList.length === 0) return;

    const file = fileList[0];

    if (!ACCEPTED_VIDEO_FORMATS.includes(file.type)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Formato no válido, únicamente mp4",
      });
    }

    if (file.size > MAX_VIDEO_SIZE) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "El archivo excede el tamaño máximo permitido de 32MB",
      });
    }
  })
  .optional();

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

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(props.onSubmit)}
        className="space-y-2 max-w-lg w-full"
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
                  {PLACES.map((place) => (
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
                  {POSITIONS.map((position) => (
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
              <FormDescription>
                Se admite formato PDF con un peso máximo de 4mb
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <VideoFormField videoRef={videoRef} form={form} />

        <Button type="submit">Enviar</Button>
      </form>
    </Form>
  );
}

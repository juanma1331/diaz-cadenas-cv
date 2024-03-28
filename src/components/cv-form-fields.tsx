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
// TODO: We got two different libraries for icons, we should use only one.
import { ReloadIcon } from "@radix-ui/react-icons";
import {
  emailSchema,
  nameSchema,
  placeSchema,
  positionSchema,
} from "@/server/routes/insert-cv.route";

const textFileSchema = z.instanceof(File);

const videoFileSchema = z.instanceof(File);

const formSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  place: placeSchema,
  position: positionSchema,
  cvTextFile: textFileSchema,
  cvVideoFile: videoFileSchema,
});

export type FormValues = z.infer<typeof formSchema>;

export type CVFormFieldsProps = {
  onSubmit: (values: FormValues) => void;
  isWorking: boolean;
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

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(props.onSubmit)}
        className="space-y-6 max-w-lg mx-auto w-full"
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
                  <SelectItem value="Andújar">Andújar</SelectItem>
                  <SelectItem value="Brenes">Brenes</SelectItem>
                  <SelectItem value="Bollullos Par del Condado">
                    Bollullos Par del Condado
                  </SelectItem>
                  <SelectItem value="Cádiz">Cádiz</SelectItem>
                  <SelectItem value="Coria del Rio">Coria del Rio</SelectItem>
                  <SelectItem value="Estepa">Estepa</SelectItem>
                  <SelectItem value="Gilena">Gilena</SelectItem>
                  <SelectItem value="Hytasa">Hytasa</SelectItem>
                  <SelectItem value="La Carolina">La Carolina</SelectItem>
                  <SelectItem value="Lantejuela">Lantejuela</SelectItem>
                  <SelectItem value="Moguer">Moguer</SelectItem>
                  <SelectItem value="Osuna">Osuna</SelectItem>
                  <SelectItem value="Sanlúcar de Barrameda">
                    Sanlúcar de Barrameda
                  </SelectItem>
                  <SelectItem value="Sevilla">Sevilla</SelectItem>
                  <SelectItem value="Utrera">Utrera</SelectItem>
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
                  <SelectItem value="Carnicería">Carnicería</SelectItem>
                  <SelectItem value="Charcutería">Charcutería</SelectItem>
                  <SelectItem value="Pescadería">Pescadería</SelectItem>
                  <SelectItem value="Frutería">Frutería</SelectItem>
                  <SelectItem value="Panadería">Panadería</SelectItem>
                  <SelectItem value="Pastelería">Pastelería</SelectItem>
                  <SelectItem value="Cajero">Cajero</SelectItem>
                  <SelectItem value="Reponedor">Reponedor</SelectItem>
                  <SelectItem value="Limpieza">Limpieza</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="cvTextFile"
          render={({ field }) => (
            <FormItem>
              <FormLabel>CV</FormLabel>
              <FormControl>
                <Input
                  type="file"
                  {...field}
                  value={undefined}
                  onChange={(e) => {
                    if (e.target.files) {
                      field.onChange(e.target.files[0]);
                    }
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="cvVideoFile"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Video</FormLabel>
              <FormControl>
                <Input
                  type="file"
                  {...field}
                  value={undefined} // Esto evita el error de TypeScript.
                  onChange={(e) => {
                    if (e.target.files) {
                      field.onChange(e.target.files[0]); // Actualiza el valor con el primer archivo seleccionado.
                    }
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {!props.isWorking ? (
          <Button type="submit">Enviar</Button>
        ) : (
          <Button disabled>
            <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
            Por favor, espere...
          </Button>
        )}
      </form>
    </Form>
  );
}

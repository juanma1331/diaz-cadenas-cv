import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

export function LoginForm() {
  return (
    <Card className="w-full max-w-sm">
      <form action="/api/auth/signin" method="POST">
        <CardHeader>
          <CardTitle className="text-2xl">Acceso</CardTitle>
          <CardDescription>
            Introduce el nombre de usuario y la contraseña
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="username">Usuario</Label>
            <Input id="username" name="username" required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Contraseña</Label>
            <Input id="password" type="password" name="password" required />
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full" type="submit">
            Entrar
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

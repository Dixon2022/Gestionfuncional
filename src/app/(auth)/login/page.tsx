"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/auth-context";
import { Building2, LogIn } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Esquema de validación
const loginSchema = z.object({
  email: z.string().email({ message: "Por favor ingresa un email válido." }),
  password: z.string().min(1, { message: "La contraseña es requerida." }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
        
      });
      console.log(data, response.json())
      if (!response.ok) {
        const errorResponse = await response.json();
        throw new Error(errorResponse.error || "Error al iniciar sesión");
      }

      const user = await response.json();

      login(user.email, user.name, user.phone || "");
      toast({
        title: "¡Bienvenido de nuevo!",
        description: "Has iniciado sesión correctamente.",
        duration: 7000,
      });
      router.push("/");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Ocurrió un error al iniciar sesión.",
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="mb-6 text-center">
        <Link
          href="/"
          className="inline-flex items-center space-x-2 text-primary mb-4"
        >
          <Building2 className="h-8 w-8" />
          <span className="text-3xl font-bold">PropVerse</span>
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight">
          Iniciar Sesión
        </h1>
        <p className="text-sm text-muted-foreground">
          Ingresa tus credenciales para acceder a tu cuenta.
        </p>
      </div>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="tu@ejemplo.com"
            {...form.register("email")}
            disabled={isLoading}
          />
          {form.formState.errors.email && (
            <p className="text-xs text-destructive">
              {form.formState.errors.email.message}
            </p>
          )}
        </div>
        <div className="space-y-1">
          <Label htmlFor="password">Contraseña</Label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            {...form.register("password")}
            disabled={isLoading}
          />
          {form.formState.errors.password && (
            <p className="text-xs text-destructive">
              {form.formState.errors.password.message}
            </p>
          )}
        </div>
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            "Iniciando sesión..."
          ) : (
            <>
              <LogIn className="mr-2" /> Iniciar Sesión
            </>
          )}
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        ¿No tienes una cuenta?{" "}
        <Link
          href="/signup"
          className="font-medium text-primary hover:underline"
        >
          Regístrate
        </Link>
      </p>
    </>
  );
}

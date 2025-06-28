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
import { Building2, UserPlus, Phone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?#&()\-_=+{}[\]|\\;:'",.<>\/]).{6,}$/;

const signupSchema = z.object({
  name: z
    .string()
    .min(2, { message: "El nombre debe tener al menos 2 caracteres." }),
  email: z.string().email({ message: "Por favor ingresa un email válido." }),
  phone: z.string().regex(/^\d{8}$/, {
    message:
      "El número de teléfono debe tener exactamente 8 dígitos numéricos.",
  }),
  password: z
    .string()
    .min(6, { message: "La contraseña debe tener al menos 6 caracteres." })
    .regex(passwordRegex, {
      message:
        "La contraseña debe contener mayúsculas, minúsculas, números y caracteres especiales.",
    }),
  userDescription: z
    .string()
    .max(500, { message: "La descripción es muy larga." })
    .optional(),
});

type SignupFormValues = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const router = useRouter();
  const { login } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      password: "",
      userDescription: "",
    },
  });

  const onSubmit = async (data: SignupFormValues) => {
    setIsLoading(true);
    try {
      // Llama a la API para crear el usuario
      const response = await fetch("/api/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          phone: data.phone,
          password: data.password,
          userDescription: data.userDescription, // <--- CAMBIO AQUÍ
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.log("Error al crear el usuario:", errorData);
        throw new Error(errorData.message || "No se pudo crear el usuario.");
      }

      // Si todo sale bien, loguea al usuario
      login(data.email, data.name, data.phone, "user");

      toast({
        title: "¡Cuenta Creada!",
        description: "Te has registrado e iniciado sesión correctamente.",
      });
      router.push("/");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Ocurrió un error al crear la cuenta.",
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
          <img
            src="/favicon.ico"
            alt="FindHome Logo"
            width={100}
            height={100}
            className="rounded-sm"
          />
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight">
          Crear una Cuenta
        </h1>
        <p className="text-sm text-muted-foreground">
          Ingresa tus datos para registrarte.
        </p>
      </div>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1">
          <Label htmlFor="name">Nombre Completo</Label>
          <Input
            id="name"
            placeholder="Tu Nombre"
            {...form.register("name")}
            disabled={isLoading}
          />
          {form.formState.errors.name && (
            <p className="text-xs text-destructive">
              {form.formState.errors.name.message}
            </p>
          )}
        </div>
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
          <Label htmlFor="phone">Número de Teléfono</Label>
          <Input
            id="phone"
            type="tel"
            placeholder="Ej: 88887777"
            {...form.register("phone")}
            disabled={isLoading}
          />
          {form.formState.errors.phone && (
            <p className="text-xs text-destructive">
              {form.formState.errors.phone.message}
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
        {/* Mensaje informativo */}
        <div className="flex items-center gap-2 p-3 rounded-md bg-blue-50 border border-blue-200 text-xs text-blue-800 mt-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 text-blue-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M12 20a8 8 0 100-16 8 8 0 000 16z"
            />
          </svg>
          <span>
            <span className="font-semibold">Nota:</span> Podrás agregar una
            descripción a tu perfil después de registrarte, desde la sección de
            edición de perfil.
          </span>
        </div>
        <Button
          type="submit"
          className="w-full text-white bg-gradient-to-br from-green-400 to-blue-600 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-green-200 dark:focus:ring-green-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2"
          disabled={isLoading}
        >
          {isLoading ? (
            "Creando cuenta..."
          ) : (
            <>
              {" "}
              <UserPlus className="mr-2" /> Crear Cuenta{" "}
            </>
          )}
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        ¿Ya tienes una cuenta?{" "}
        <Link
          href="/login"
          className="font-medium text-success hover:underline"
        >
          Inicia Sesión
        </Link>
      </p>
    </>
  );
}

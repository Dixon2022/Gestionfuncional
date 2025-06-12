"use client";

import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  UserCircle,
  Mail,
  Edit3,
  LogOut,
  PlusCircle,
  Phone,
  Flag,
} from "lucide-react";
import { getPropertiesByOwner } from "@/lib/property-store";
import type { Property } from "@/lib/types";
import { PropertyCard } from "@/components/property/property-card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils"; // Si tienes una función para combinar clases
import { toast } from "@/hooks/use-toast";
export default function ProfilePage() {
  const { user, logout, loading } = useAuth();
  const router = useRouter();
  const [myProperties, setMyProperties] = useState<Property[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [search, setSearch] = useState("");
  const [order, setOrder] = useState<"desc" | "asc">("desc"); // Nuevo estado

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient && !loading && !user) {
      router.push("/login?redirect=/profile");
    }
  }, [user, loading, router, isClient]);

  useEffect(() => {
    if (user && isClient) {
      getPropertiesByOwner(user.id).then(setMyProperties);
    }
  }, [user, isClient]);

  if (loading || !isClient) {
    return (
      <div className="flex min-h-[calc(100vh-theme(spacing.16))] flex-1 items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <span className="sr-only">Cargando perfil...</span>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container py-8 text-center">
        <p>Debes iniciar sesión para ver esta página.</p>
        <Button
          onClick={() => router.push("/login?redirect=/profile")}
          className="mt-4"
        >
          Iniciar Sesión
        </Button>
      </div>
    );
  }
  const visibleProperties =
    user.role === "admin"
      ? myProperties
      : myProperties.filter((property) => property.ownerId === user.id);

  const filteredProperties = visibleProperties
    .filter((property) =>
      [property.title, property.city, property.address]
        .join(" ")
        .toLowerCase()
        .includes(search.toLowerCase())
    )
    .sort(
      (a, b) =>
        order === "desc"
          ? Number(b.id) - Number(a.id) // Más reciente primero
          : Number(a.id) - Number(b.id) // Más antiguo primero
    ); // Última propiedad primero

  return (
    <div className="container py-8 md:py-12">
      <Card className="max-w-3xl mx-auto shadow-xl">
        <CardHeader className="text-center">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-gradient-to-r from-blue-50 via-sky-50 to-indigo-50 rounded-2xl p-6 shadow-inner">
            {/* Avatar y nombre a la izquierda, alineados horizontalmente */}
            <div className="flex flex-1 flex-row items-center gap-4">
              <Avatar className="h-24 w-24 border-4 border-blue-400 shadow-lg">
                <AvatarImage
                  src={
                    user.name
                      ? `https://placehold.co/100x100.png?text=${user.name.substring(
                          0,
                          1
                        )}`
                      : undefined
                  }
                  alt={user.name || "Usuario"}
                  data-ai-hint="avatar persona"
                />
                <AvatarFallback className="text-3xl bg-secondary">
                  {user.name ? (
                    user.name.substring(0, 2).toUpperCase()
                  ) : (
                    <UserCircle className="h-16 w-16" />
                  )}
                </AvatarFallback>
              </Avatar>
              <CardTitle className="text-3xl font-bold text-blue-900 self-center">
                {user.name || "Usuario"}
              </CardTitle>
            </div>
            {/* Información de contacto a la derecha */}
            <div className="flex flex-col items-center md:items-end gap-3 flex-1 text-blue-800">
              <span className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-blue-500" />
                <a
                  href={`https://mail.google.com/mail/?view=cm&fs=1&to=${
                    user.email
                  }&su=Hola%20desde%20la%20plataforma&body=Hola%20${encodeURIComponent(
                    user.name || ""
                  )},%20me%20gustaría%20contactarte%20sobre%20una%20propiedad.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium underline hover:text-blue-600 transition"
                  title="Redactar en Gmail"
                >
                  {user.email}
                </a>
              </span>
              <span className="flex items-center gap-2">
                <Phone className="h-5 w-5 text-blue-500" />
                <span className="font-medium">{user.phone}</span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(user.phone);
                    toast({
                      title: "¡Número copiado!",
                      description:
                        "El número de teléfono se copió al portapapeles.",
                      duration: 3000,
                    });
                  }}
                  className="ml-1 px-2 py-1 rounded bg-blue-100 hover:bg-blue-200 text-blue-700 text-xs font-semibold transition"
                  title="Copiar número"
                >
                  Copiar
                </button>
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-center items-center gap-3">
            {/* Botones de acción */}
            <Button
              asChild
              className={cn(
                "w-full sm:w-auto",
                "bg-gradient-to-r from-indigo-400 via-sky-400 to-blue-500",
                "text-white font-semibold shadow-md",
                "hover:from-indigo-500 hover:via-sky-500 hover:to-blue-600",
                "hover:scale-105 hover:shadow-lg",
                "transition-all duration-200 border-0"
              )}
            >
              <Link href="/profile/edit">
                <Edit3 className="mr-2 h-4 w-4" />
                <span className="font-semibold tracking-wide">
                  Editar Perfil
                </span>
              </Link>
            </Button>
            <Button
              variant="default"
              asChild
              className={cn(
                "w-full sm:w-auto bg-gradient-to-r from-green-400 to-blue-500 text-white shadow-lg hover:from-green-500 hover:to-blue-600 hover:scale-105 transition-transform duration-200"
              )}
            >
              <Link href="/generate-description">
                <PlusCircle className="mr-2 h-4 w-4" />
                <span className="font-semibold">Agregar Propiedad</span>
              </Link>
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                logout();
                router.push("/");
              }}
              className={cn(
                "w-full sm:w-auto bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg hover:from-red-600 hover:to-pink-600 hover:scale-105 transition-transform duration-200"
              )}
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span className="font-semibold">Cerrar Sesión</span>
            </Button>
            {user?.role === "admin" && (
              <Button
                variant="secondary"
                asChild
                className={cn(
                  "w-full sm:w-auto bg-gradient-to-r from-yellow-400 to-yellow-600 text-white shadow-lg hover:from-yellow-500 hover:to-yellow-700 hover:scale-105 transition-transform duration-200"
                )}
              >
                <Link href="/admin">
                  <Flag className="mr-2 h-4 w-4" />
                  <span className="font-semibold">Administrar Reportes</span>
                </Link>
              </Button>
            )}
          </div>

          {/* Buscador y filtro debajo de los botones */}
          <div className="flex flex-col sm:flex-row justify-center items-center gap-3 mb-8 px-4 py-4 rounded-xl bg-gradient-to-r from-blue-50 via-sky-50 to-indigo-50 shadow-inner max-w-2xl mx-auto">
            <Input
              type="text"
              placeholder="Buscar por título, ciudad o dirección..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-md w-full border border-blue-200 shadow-sm focus:ring-2 focus:ring-blue-400 transition"
            />
            <Select
              value={order}
              onValueChange={(v) => setOrder(v as "desc" | "asc")}
            >
              <SelectTrigger className="w-40 border border-blue-200 shadow-sm focus:ring-2 focus:ring-blue-400 transition bg-white">
                <SelectValue placeholder="Ordenar" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="desc">Más reciente</SelectItem>
                <SelectItem value="asc">Más antiguo</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="mt-8">
            <h2 className="text-2xl font-semibold mb-6 text-center">
              Mis Propiedades Publicadas
            </h2>
            {filteredProperties.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredProperties.map((property) => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-6 bg-secondary/30 rounded-md">
                Aún no has publicado ninguna propiedad. ¿Por qué no generas una
                ahora?
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

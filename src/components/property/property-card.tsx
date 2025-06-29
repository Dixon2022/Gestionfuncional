"use client";

import Image from "next/image";
import Link from "next/link";
import type { Property } from "@/lib/types";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  BedDouble,
  Bath,
  Home,
  ArrowRight,
  SparklesIcon,
  Trash2,
  Pencil,
  Loader2,
  Tag,
  Heart,
  User,
} from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { deleteProperty } from "@/lib/property-store";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useState, useEffect } from "react";
import {
  FacebookShareButton,
  FacebookIcon,
  WhatsappShareButton,
  WhatsappIcon,
} from "react-share";
import { Copy } from "lucide-react";
import { link } from "fs";
import { useCurrency } from "@/contexts/currency-context";
import { cn } from "@/lib/utils";

interface PropertyCardProps {
  property: Property;
  isFavorite?: boolean;
}

const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

export function PropertyCard({ property }: PropertyCardProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isFavorite, setIsFavorite] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [favorites, setFavorites] = useState<Property[]>([]);

  const displayArea = `${property.area.toLocaleString()} m²`;
  const isNew =
    property.createdAt &&
    Date.now() - property.createdAt < TWENTY_FOUR_HOURS_MS;
  const isOwner = user && user.name === property.owner.name;

  // Al cargar, consulta si la propiedad está en favoritos
  useEffect(() => {
    if (user?.email) {
      fetch(`/api/favorite?email=${encodeURIComponent(user.email)}`)
        .then((res) => res.json())
        .then((data) => {
          const favs = data.favorites || [];
          setIsFavorite(
            favs.some((fav: any) => String(fav.id) === String(property.id))
          );
        });
    }
  }, [user, property.id]);

  const handleDelete = async (): Promise<{
    success: boolean;
    message?: string;
  }> => {
    if (!user) {
      toast({
        title: "No autenticado",
        description: "Debes iniciar sesión para eliminar propiedades.",
        variant: "destructive",
      });
      return { success: false, message: "No autenticado" };
    }

    setIsDeleting(true);

    const isAdmin = user.role === "admin";
    const endpoint = isAdmin ? "/api/admin" : "/api/property";
    const ownerId = getOwnerIdByEmail(user.email); // Usa el id del usuario autenticado

    try {
      const response = await fetch(endpoint, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          propertyId: property.id,
          ownerId: Number(ownerId),
        }),
      });

      const data = await response.json();
      if (response.ok) {
        toast({
          title: "Propiedad Eliminada",
          description: `La propiedad "${property.title}" ha sido eliminada.`,
        });
        setTimeout(() => {
          window.location.reload();
        }, 4000);
      } else {
        setIsDeleting(false);
        return {
          success: false,
          message: data.error || "No se pudo eliminar la propiedad.",
        };
      }

      return { success: true };
    } catch (error) {
      setIsDeleting(false);
      return {
        success: false,
        message: "Error de red al intentar eliminar la propiedad.",
      };
    }
  };

  // Alterna favorito en la base de datos y en el estado local
  const handleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user?.email) {
      toast({
        title: "Debes iniciar sesión para usar favoritos",
        variant: "destructive",
      });
      return;
    }

    const method = isFavorite ? "DELETE" : "POST";

    const res = await fetch(
      method === "DELETE"
        ? `/api/favorite?propertyId=${property.id}&email=${user.email}`
        : "/api/favorite",
      {
        method,
        headers: { "Content-Type": "application/json" },
        body:
          method === "POST"
            ? JSON.stringify({ propertyId: property.id, email: user.email })
            : undefined,
      }
    );

    if (res.ok) {
      setIsFavorite(!isFavorite);
      toast({
        title: isFavorite ? "Eliminado de Favoritos" : "Añadido a Favoritos",
        description: `La propiedad "${property.title}" ha sido ${
          isFavorite ? "eliminada" : "añadida"
        } a tus favoritos.`,
        duration: 3000,
      });
    } else {
      toast({
        title: "Error",
        description: "No se pudo actualizar el favorito.",
        variant: "destructive",
      });
    }
  };

  const { convert, symbol } = useCurrency();

  return (
    <Card className="flex flex-col overflow-hidden rounded-lg shadow-lg transition-all hover:shadow-xl h-full">
      <div className="block group h-full flex flex-col">
        <CardHeader className="p-0">
          <Link href={`/properties/${property.id}`} className="block">
            <div className="relative h-48 w-full overflow-hidden">
              {property.images && property.images.length > 0 ? (
                <Image
                  src={
                    typeof property.images[0] === "string"
                      ? property.images[0]
                      : (property.images[0] as { url: string }).url
                  }
                  alt={property.title}
                  fill
                  style={{ objectFit: "cover" }}
                  className="transition-transform duration-300 group-hover:scale-105"
                  data-ai-hint="exterior casa"
                  onError={() => setImgError(true)}
                  priority
                />
              ) : (
                <div className="flex items-center justify-center h-full w-full bg-gray-200">
                  <span className="text-gray-500 text-lg font-semibold text-center px-4">
                    {property.title}
                  </span>
                </div>
              )}
              <div className="absolute top-2 right-2 flex flex-col items-end space-y-1">
                {property.listingType && (
                  <Badge
                    variant={
                      property.listingType === "Venta" ? "default" : "secondary"
                    }
                    className={
                      property.listingType === "Alquiler"
                        ? "bg-blue-500 hover:bg-blue-600 text-white"
                        : ""
                    }
                  >
                    <Tag className="mr-1 h-3 w-3" />
                    {property.listingType}
                  </Badge>
                )}
                {property.isFeatured && (
                  <Badge
                    variant="destructive"
                    className="flex items-center gap-1"
                  >
                    <SparklesIcon className="h-4 w-4 text-yellow-400" />
                    Destacada
                  </Badge>
                )}
                {isNew && (
                  <Badge className="bg-green-500 hover:bg-green-600 text-white">
                    <SparklesIcon className="mr-1 h-3 w-3" />
                    Nueva
                  </Badge>
                )}
              </div>
              {/* --- FAVORITE ICON BUTTON --- */}
              <Button
                variant="ghost"
                size="icon"
                aria-label={
                  isFavorite ? "Quitar de favoritos" : "Agregar a favoritos"
                }
                onClick={(e) => {
                  e.preventDefault();
                  handleFavorite(e);
                }}
                className="absolute bottom-2 right-2 bg-white/80 hover:bg-red-100 border border-red-200 shadow rounded-full p-2 transition"
              >
                <Heart
                  fill={isFavorite ? "red" : "none"}
                  className={isFavorite ? "text-red-500" : "text-gray-400"}
                />
              </Button>
              {/* --- END FAVORITE ICON BUTTON --- */}
            </div>
          </Link>
        </CardHeader>
        <CardContent className="p-4 flex-grow">
          <Link href={`/properties/${property.id}`} className="block">
            <CardTitle className="text-lg mb-1 leading-tight group-hover:text-primary transition-colors">
              {property.title}
            </CardTitle>
            <div className="flex items-center text-sm text-muted-foreground mb-2">
              <MapPin className="mr-1 h-4 w-4" />
              {property.address}, {property.city}
            </div>
            <p className="text-xl font-bold text-primary mb-2">
              {symbol}
              {convert(property.price).toLocaleString(undefined, {
                maximumFractionDigits: 2,
              })}{" "}
              {property.listingType === "Alquiler" ? (
                <span className="text-sm font-normal text-muted-foreground">
                  /mes
                </span>
              ) : (
                ""
              )}
            </p>
            <div className="flex flex-wrap gap-x-3 gap-y-1 text-sm text-muted-foreground">
              <span className="flex items-center">
                <BedDouble className="mr-1 h-4 w-4" /> {property.bedrooms} Hab
              </span>
              <span className="flex items-center">
                <Bath className="mr-1 h-4 w-4" /> {property.bathrooms} Baños
              </span>
              <span className="flex items-center">
                <Home className="mr-1 h-4 w-4" /> {displayArea}
              </span>
            </div>
          </Link>
          {/* Botones sociales y copiar enlace */}
          <div className="flex items-center justify-center gap-3 mt-4 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-50 via-sky-50 to-indigo-50 shadow-inner w-fit mx-auto">
            <FacebookShareButton
              url={`${
                typeof window !== "undefined" ? window.location.origin : ""
              }/properties/${property.id}`}
              className="transition-transform hover:scale-110 focus-visible:ring-2 focus-visible:ring-blue-400 rounded-full"
              title="Compartir en Facebook"
            >
              <FacebookIcon size={36} round />
            </FacebookShareButton>

            <WhatsappShareButton
              url={`${
                typeof window !== "undefined" ? window.location.origin : ""
              }/properties/${property.id}`}
              className="transition-transform hover:scale-110 focus-visible:ring-2 focus-visible:ring-green-400 rounded-full"
              title="Compartir en WhatsApp"
            >
              <WhatsappIcon size={36} round />
            </WhatsappShareButton>
            <button
              onClick={() => {
                navigator.clipboard.writeText(
                  `${window.location.origin}/properties/${property.id}`
                );
                toast({
                  title: "Enlace copiado",
                  description: "Has copiado el enlace de la propiedad.",
                  duration: 7000,
                });
              }}
              title="Copiar enlace"
              className="p-2 bg-white border border-blue-200 rounded-full shadow hover:bg-blue-100 hover:scale-110 transition-all focus-visible:ring-2 focus-visible:ring-blue-400"
            >
              <Copy className="h-6 w-6 text-blue-500" />
            </button>
          </div>
        </CardContent>
        {/* Footer con botones de acción */}
        <CardFooter className="p-4 pt-0 mt-auto">
          <div className="flex w-full gap-2">
            <Button
              asChild
              className={cn(
                "flex-grow relative z-0 overflow-hidden",
                "bg-gradient-to-r from-blue-500 via-sky-400 to-indigo-400",
                "text-white font-semibold shadow-md",
                "hover:from-blue-600 hover:via-sky-500 hover:to-indigo-500",
                "hover:scale-105 hover:shadow-lg",
                "transition-all duration-200 border-0 group"
              )}
            >
              <Link
                href={`/properties/${property.id}`}
                className={cn(
                  // Estilos visuales del botón
                  "relative inline-flex items-center justify-center overflow-hidden", // necesario para animaciones internas
                  "text-white bg-gradient-to-br from-green-400 to-blue-600 hover:bg-gradient-to-bl",
                  "focus:ring-4 focus:outline-none focus:ring-green-200 dark:focus:ring-green-800",
                  "font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2",
                  "group"
                )}
              >
                {/* Texto que desaparece al hacer hover */}
                <span
                  className={cn(
                    "whitespace-nowrap transition-transform duration-300 ease-in-out",
                    "transform group-hover:-translate-x-full group-hover:opacity-0"
                  )}
                >
                  Ver Detalles
                </span>

                {/* Flecha que aparece al hacer hover */}
                <span
                  className={cn(
                    "absolute left-1/2 flex items-center justify-center",
                    "whitespace-nowrap transition-transform duration-300 ease-in-out",
                    "transform translate-x-full opacity-0 group-hover:translate-x-0 group-hover:-translate-x-1/2 group-hover:opacity-100"
                  )}
                >
                  <ArrowRight className="h-5 w-5 text-white" />
                </span>
              </Link>
            </Button>
            {(isOwner || user?.role === "admin") && (
              <>
                {isOwner && (
                  <Button
                    variant="outline"
                    size="icon"
                    asChild
                    aria-label="Editar propiedad"
                    className={cn(
                      "relative z-10",
                      "bg-gradient-to-r from-indigo-400 via-sky-400 to-blue-500 text-white border-0 shadow-md",
                      "hover:from-indigo-500 hover:via-sky-500 hover:to-blue-600 hover:scale-110",
                      "transition-all duration-200"
                    )}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Link href={`/properties/${property.id}/edit`}>
                      <Pencil />
                    </Link>
                  </Button>
                )}
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="destructive"
                      size="icon"
                      disabled={isDeleting}
                      aria-label="Eliminar propiedad"
                      className={cn(
                        "relative z-10",
                        "shadow-md hover:scale-110 transition-all duration-200"
                      )}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {isDeleting ? (
                        <Loader2 className="animate-spin" />
                      ) : (
                        <Trash2 />
                      )}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Esta acción no se puede deshacer. Esto eliminará
                        permanentemente la propiedad "{property.title}".
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel disabled={isDeleting}>
                        Cancelar
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="bg-destructive hover:bg-destructive/90"
                      >
                        {isDeleting ? "Eliminando..." : "Sí, eliminar"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </>
            )}
          </div>
        </CardFooter>
      </div>
    </Card>
  );
}

async function getOwnerIdByEmail(email: string): Promise<number | null> {
  try {
    const res = await fetch(
      `/api/user/by-email?email=${encodeURIComponent(email)}`
    );
    if (!res.ok) return null;
    const user = await res.json();
    return user.id ?? null;
  } catch {
    return null;
  }
}

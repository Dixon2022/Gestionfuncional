"use client";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, BedDouble, Bath, Home, ArrowRight, SparklesIcon, Tag, Heart } from "lucide-react";
import { useCurrency } from "@/contexts/currency-context";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

// Define el tipo localmente para independencia
type Property = {
  id: string;
  title: string;
  description?: string;
  address?: string;
  city?: string;
  price: number;
  area?: number;
  bedrooms?: number;
  bathrooms?: number;
  images?: string[];
  listingType?: string;
  isFeatured?: boolean;
  createdAt?: number | string | Date;
};

interface FavoritePropertyCardProps {
  property: Property;
}

export default function FavoritePropertyCard({ property }: FavoritePropertyCardProps) {
  const { convert, symbol } = useCurrency();
  const [isFavorite, setIsFavorite] = useState(true);
  const { toast } = useToast();

  const displayArea = property.area ? `${property.area.toLocaleString()} m²` : "N/A";
  const isNew =
    property.createdAt &&
    (typeof property.createdAt === "string" || typeof property.createdAt === "number"
      ? Date.now() - new Date(property.createdAt).getTime()
      : Date.now() - property.createdAt.getTime()) < 24 * 60 * 60 * 1000;

  const handleFavorite = async () => {
    try {
      const res = await fetch("/api/favorite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ propertyId: property.id }),
      });
      if (res.ok) {
        setIsFavorite(true);
        toast({
          title: "Añadido a Favoritos",
          description: `La propiedad "${property.title}" ha sido añadida a tus favoritos.`,
          duration: 3000,
        });
      } else {
        toast({
          title: "Error",
          description: "No se pudo agregar a favoritos.",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Error",
        description: "No se pudo agregar a favoritos.",
        variant: "destructive",
      });
    }
  };

  const handleUnfavorite = async () => {
    try {
      const res = await fetch("/api/favorite", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ propertyId: property.id }),
      });
      if (res.ok) {
        setIsFavorite(false);
        toast({
          title: "Eliminado de Favoritos",
          description: `La propiedad "${property.title}" ha sido eliminada de tus favoritos.`,
          duration: 3000,
        });
      } else {
        toast({
          title: "Error",
          description: "No se pudo eliminar de favoritos.",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Error",
        description: "No se pudo eliminar de favoritos.",
        variant: "destructive",
      });
    }
  };

  const handleFavoriteClick = () => {
    if (isFavorite) {
      handleUnfavorite();
    } else {
      handleFavorite();
    }
  };

  if (!isFavorite) return null;

  return (
    <Card className="flex flex-col overflow-hidden rounded-2xl shadow-2xl transition-all hover:shadow-blue-300 h-full bg-gradient-to-br from-blue-50 via-white to-indigo-100 border-2 border-blue-100">
      <div className="block group h-full flex flex-col">
        <CardHeader className="p-0">
          <Link href={`/properties/${property.id}`} className="block">
            <div className="relative h-52 w-full overflow-hidden rounded-t-2xl">
              {property.images && property.images.length > 0 ? (
                <Image
                  src={typeof property.images[0] === "string"
                    ? property.images[0]
                    : (property.images[0] as { url: string }).url}
                  alt={property.title}
                  fill
                  style={{ objectFit: "cover" }}
                  className="transition-transform duration-300 group-hover:scale-105"
                  data-ai-hint="exterior casa"
                  priority
                />
              ) : (
                <div className="flex items-center justify-center h-full w-full bg-gradient-to-br from-blue-100 to-indigo-100">
                  <span className="text-blue-500 text-lg font-semibold text-center px-4">
                    {property.title}
                  </span>
                </div>
              )}
              <div className="absolute top-2 right-2 flex flex-col items-end space-y-1 z-10">
                {property.listingType && (
                  <Badge
                    variant={property.listingType === "Venta" ? "default" : "secondary"}
                    className={property.listingType === "Alquiler"
                      ? "bg-blue-500 hover:bg-blue-600 text-white"
                      : ""}
                  >
                    <Tag className="mr-1 h-3 w-3" />
                    {property.listingType}
                  </Badge>
                )}
                {property.isFeatured && (
                  <Badge variant="destructive">Destacada</Badge>
                )}
                {isNew && (
                  <Badge className="bg-green-500 hover:bg-green-600 text-white">
                    <SparklesIcon className="mr-1 h-3 w-3" />
                    Nueva
                  </Badge>
                )}
              </div>
              {/* Botón de favorito */}
              <Button
                variant="ghost"
                size="icon"
                aria-label={isFavorite ? "Quitar de favoritos" : "Agregar a favoritos"}
                onClick={e => {
                  e.preventDefault();
                  handleFavoriteClick();
                }}
                className="absolute bottom-2 right-2 bg-white/80 hover:bg-red-100 border border-red-200 shadow transition"
              >
                <Heart fill={isFavorite ? "red" : "none"} className={isFavorite ? "text-red-500" : "text-gray-400"} />
              </Button>
            </div>
          </Link>
        </CardHeader>
        <CardContent className="p-5 flex-grow">
          <Link href={`/properties/${property.id}`} className="block">
            <CardTitle className="text-xl mb-1 leading-tight group-hover:text-primary transition-colors font-bold text-blue-900">
              {property.title}
            </CardTitle>
            <div className="flex items-center text-sm text-muted-foreground mb-2">
              <MapPin className="mr-1 h-4 w-4 text-blue-400" />
              <span className="font-medium text-blue-700">{property.address}, {property.city}</span>
            </div>
            <p className="text-2xl font-extrabold text-blue-700 mb-2 drop-shadow">
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
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-base text-blue-800 font-medium">
              <span className="flex items-center">
                <BedDouble className="mr-1 h-4 w-4 text-indigo-500" /> {property.bedrooms} Hab
              </span>
              <span className="flex items-center">
                <Bath className="mr-1 h-4 w-4 text-sky-500" /> {property.bathrooms} Baños
              </span>
              <span className="flex items-center">
                <Home className="mr-1 h-4 w-4 text-blue-400" /> {displayArea}
              </span>
            </div>
            {property.description && (
              <p className="mt-3 text-sm text-blue-900/80 line-clamp-2">{property.description}</p>
            )}
          </Link>
        </CardContent>
        <CardFooter className="p-5 pt-0 mt-auto">
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
              <Link href={`/properties/${property.id}`}>
                <span
                  className={cn(
                    "whitespace-nowrap transition-transform duration-300 ease-in-out",
                    "transform group-hover:-translate-x-full group-hover:opacity-0"
                  )}
                >
                  Ver Detalles
                </span>
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
          </div>
        </CardFooter>
      </div>
    </Card>
  );
}
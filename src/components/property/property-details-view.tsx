import React, { useEffect, useState } from "react";
import Image from "next/image";
import type { Property } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { ContactForm } from "./contact-form";
import {
  BedDouble,
  Bath,
  Home,
  MapPin,
  Building,
  CalendarDays,
  Layers,
  UserCircle,
  Landmark,
  Tag,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  FacebookShareButton,
  FacebookIcon,
  WhatsappShareButton,
  WhatsappIcon,
} from "react-share";
import { Copy } from "lucide-react";
// Update the path below if your report-form file is in a different directory

interface PropertyDetailsPageProps {
  propertyId: string; // Recibimos el ID de la propiedad para hacer fetch
}

export function PropertyDetailsPage({ propertyId }: PropertyDetailsPageProps) {
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProperty() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`/api/property/${propertyId}`);
        if (!res.ok) throw new Error("Error al cargar la propiedad");
        const data: Property = await res.json();
        setProperty(data);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }

    fetchProperty();
  }, [propertyId]);

  if (loading) return <p>Cargando propiedad...</p>;
  if (error) return <p className="text-red-500">Error: {error}</p>;
  if (!property) return <p>No se encontró la propiedad.</p>;

  // Validación segura para toLocaleString
  const displayArea =
    property.area != null ? `${property.area.toLocaleString()} m²` : "N/A";
  const displayLotSize =
    property.lotSize != null
      ? `${property.lotSize.toLocaleString()} m²`
      : "N/A";
  const displayPrice =
    property.price != null
      ? `₡${property.price.toLocaleString()}`
      : "Precio no disponible";

  return (
    <div className="container py-8 md:py-12">
      <div className="grid md:grid-cols-3 gap-8">
        {/* Main Content Column */}
        <div className="md:col-span-2">
          {/* Image Gallery */}
          <div className="mb-6">
            <div className="relative w-full h-[300px] md:h-[450px] rounded-lg overflow-hidden shadow-lg">
              <Image
                src={property.photoDataUri || property.images[0]}
                alt={property.title}
                layout="fill"
                objectFit="cover"
                priority
                data-ai-hint="imagen principal propiedad"
              />
              <div className="absolute top-4 left-4 flex flex-col space-y-2">
                {property.listingType && (
                  <Badge
                    variant={
                      property.listingType === "Venta" ? "default" : "secondary"
                    }
                    className={`text-sm px-3 py-1 ${
                      property.listingType === "Alquiler"
                        ? "bg-blue-500 hover:bg-blue-600 text-white"
                        : ""
                    }`}
                  >
                    <Tag className="mr-1 h-4 w-4" />
                    {property.listingType}
                  </Badge>
                )}
                {property.isFeatured && (
                  <Badge variant="destructive" className="text-sm px-3 py-1">
                    Destacada
                  </Badge>
                )}
              </div>
            </div>
            {property.images.length > 1 && (
              <div className="mt-4 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                {property.images.slice(1, 6).map((img, index) => (
                  <div
                    key={index}
                    className="relative h-24 w-full rounded-md overflow-hidden shadow-md"
                  >
                    <Image
                      src={img}
                      alt={`${property.title} - imagen ${index + 2}`}
                      layout="fill"
                      objectFit="cover"
                      data-ai-hint="miniatura propiedad"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="p-4 pt-0 mt-2 flex items-center gap-2">
            <FacebookShareButton
              url={`${
                typeof window !== "undefined" ? window.location.origin : ""
              }/properties/${property.id}`}
            >
              <FacebookIcon size={32} round />
            </FacebookShareButton>

            <WhatsappShareButton
              url={`${
                typeof window !== "undefined" ? window.location.origin : ""
              }/properties/${property.id}`}
            >
              <WhatsappIcon size={32} round />
            </WhatsappShareButton>
            <button
              onClick={() => {
                navigator.clipboard.writeText(
                  `${window.location.origin}/properties/${property.id}`
                );
                toast({
                  title: "Enlace copiado",
                  description: "Has copieda el enlace de la propiedad.",
                  duration: 7000,
                });
              }}
              title="Copiar enlace"
              className="p-2 bg-gray-200 rounded-full hover:bg-gray-300"
            >
              <Copy className="h-5 w-5" />
            </button>
          </div>

          {/* Property Info Header */}
          <div className="mb-6 pb-4 border-b">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              {property.title}
            </h1>

            <div className="flex items-center text-muted-foreground mb-3">
              <MapPin className="mr-2 h-5 w-5" />
              <span>
                {property.address}, {property.city}
              </span>
            </div>
            <div className="text-3xl font-bold text-primary">
              <Landmark className="inline-block mr-1 h-7 w-7 relative -top-0.5" />
              {displayPrice}
              <span className="text-xl font-medium text-foreground/80 ml-2">
                ({property.listingType})
              </span>
              {property.listingType === "Alquiler" ? (
                <span className="text-lg font-normal text-muted-foreground">
                  {" "}
                  /mes
                </span>
              ) : (
                ""
              )}
            </div>
          </div>

          {/* Key Details Section */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6 text-center">
            {[
              {
                icon: BedDouble,
                label: "Habitaciones",
                value: property.bedrooms,
              },
              { icon: Bath, label: "Baños", value: property.bathrooms },
              { icon: Home, label: "Superficie (m²)", value: displayArea },
              { icon: Building, label: "Tipo Prop.", value: property.type },
              { icon: Tag, label: "Listado", value: property.listingType },
              {
                icon: CalendarDays,
                label: "Año Const.",
                value: property.yearBuilt || "N/A",
              },
              {
                icon: Layers,
                label: "Sup. Terreno (m²)",
                value: displayLotSize,
              },
            ].map((detail) => (
              <div
                key={detail.label}
                className="p-4 bg-secondary/50 rounded-lg shadow-sm"
              >
                <detail.icon className="h-7 w-7 text-primary mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">{detail.label}</p>
                <p className="font-semibold text-lg">{detail.value}</p>
              </div>
            ))}
          </div>

          {/* Description */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-3">
              Descripción de la Propiedad
            </h2>
            <p className="text-foreground/80 leading-relaxed whitespace-pre-line">
              {property.description}
            </p>
          </div>

          {/* AQUI SE AGREGAN LOS REPORTES POR SI ACASO */}
          <div>
            <p className="text-2xl font-semibold mb-3">
              Reportes de la propiedad
            </p>
          </div>

          {/* Features */}
          {property.features && property.features.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-semibold mb-3">Características</h2>
              <div className="flex flex-wrap gap-2">
                {property.features.map((feature, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="px-3 py-1 text-sm"
                  >
                    <Layers className="mr-1.5 h-3.5 w-3.5" />
                    {feature}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Column (Agent Info & Contact Form) */}
        <div className="md:col-span-1 space-y-8">
          {/* Agent Info Card */}
          <div className="p-6 border rounded-lg shadow-lg bg-card">
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              <UserCircle className="mr-2 h-5 w-5 text-primary" />
              Agente Inmobiliario
            </h3>

            {property.owner ? (
              <>
                <div className="flex items-center space-x-4 mb-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage
                      src={property.owner.avatarUrl || "/default-avatar.png"}
                      alt={property.owner.name}
                      data-ai-hint="retrato persona"
                    />
                    <AvatarFallback>
                      {property.owner.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-lg">
                      {property.owner.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Agente Inmobiliario
                    </p>
                  </div>
                </div>
                <Separator className="my-4" />
                <div className="space-y-2 text-sm">
                  <p>
                    <strong>Email: </strong>
                    {property.owner.email ? (
                      <a
                        href={`mailto:${property.owner.email}`}
                        className="text-primary hover:underline"
                      >
                        {property.owner.email}
                      </a>
                    ) : (
                      "No disponible"
                    )}
                  </p>
                  <p>
                    <strong>Teléfono: </strong>
                    {property.owner.phone ? (
                      <a
                        href={`tel:${property.owner.phone}`}
                        className="text-primary hover:underline"
                      >
                        {property.owner.phone}
                      </a>
                    ) : (
                      "No disponible"
                    )}
                  </p>
                </div>
              </>
            ) : (
              <p>Información del ownere no disponible</p>
            )}
          </div>

          {/* Contact Form */}
          {/* Solo renderizamos el ContactForm si hay ownere */}
          {property.owner && (
            <ContactForm
              propertyId={property.id}
              propertyName={property.title}
              agentEmail={property.owner.email}
              agentName={property.owner.name}
            />
          )}
        </div>
      </div>
    </div>
  );
}

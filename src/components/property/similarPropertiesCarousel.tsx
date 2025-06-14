"use client";

import React, { useState } from "react";
import Slider from "react-slick";
import Image from "next/image";
import type { Property } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import {
  MapPin,
  BedDouble,
  Bath,
  Home,
  ArrowRight,
  SparklesIcon,
  Tag,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface Props {
  properties: Property[];
  currentPropertyId: number | string; // id de la propiedad actual en pantalla
}

const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

export function SimilarPropertiesCarousel({
  properties,
  currentPropertyId,
}: Props) {
  // Filtrar la propiedad actual y eliminar duplicados
  const uniqueProperties = properties
    .filter((prop) => prop.id !== currentPropertyId)
    .filter(
      (prop, index, self) => index === self.findIndex((p) => p.id === prop.id)
    );
  const slidesToShowCount = Math.min(3, uniqueProperties.length);
  console.log(properties);
  console.log(uniqueProperties);
  console.log(currentPropertyId);
  console.log(
    "IMAGENES",
    properties.map((p) => p.images)
  );
  console.log(
    "IMAGENES UNICAS",
    uniqueProperties.map((p) => p.images)
  );

  const settings = {
    dots: true,
    infinite: uniqueProperties.length > slidesToShowCount,
    speed: 500,
    slidesToShow: slidesToShowCount,
    slidesToScroll: 1,
    arrows: true,
    swipeToSlide: true,
    responsive: [
      {
        breakpoint: 1024,
        settings: { slidesToShow: Math.min(2, uniqueProperties.length) },
      },
      {
        breakpoint: 640,
        settings: { slidesToShow: 1 },
      },
    ],
  };

  // Diseño interno simplificado que reemplaza PropertyCard
  function PropertyCard({ property }: { property: Property }) {
    const displayArea = `${property.area.toLocaleString()} m²`;
    const isNew =
      property.createdAt &&
      Date.now() - property.createdAt < TWENTY_FOUR_HOURS_MS;

    const [imgError, setImgError] = useState(false);

    return (
      <div className="flex flex-col overflow-hidden rounded-lg shadow-lg transition-all hover:shadow-xl h-full bg-white">
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
                <Badge variant="destructive">Destacada</Badge>
              )}
              {isNew && (
                <Badge className="bg-green-500 hover:bg-green-600 text-white">
                  <SparklesIcon className="mr-1 h-3 w-3" />
                  Nueva
                </Badge>
              )}
            </div>
          </div>
          <div className="p-4 flex flex-col justify-between h-[250px]">
            <h3 className="text-lg font-semibold mb-1">{property.title}</h3>
            <div className="flex items-center text-sm text-muted-foreground mb-2">
              <MapPin className="mr-1 h-4 w-4" />
              {property.address}, {property.city}
            </div>
            <p className="text-xl font-bold text-primary mb-2">
              {property.price.toLocaleString(undefined, {
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
            <div
              className={cn(
                "relative inline-flex items-center justify-center rounded-full",
                "bg-gradient-to-r from-indigo-400 via-sky-400 to-blue-500 text-white",
                "px-6 py-2 overflow-hidden max-w-max",
                "group hover:from-indigo-500 hover:via-sky-500 hover:to-blue-600",
                "transition-colors duration-300"
              )}
            >
              {/* Texto */}
              <span
                className={cn(
                  "whitespace-nowrap transition-transform duration-300 ease-in-out",
                  "transform group-hover:-translate-x-full group-hover:opacity-0"
                )}
              >
                Quieres ver más detalles?
              </span>

              {/* Flecha */}
              <span
                className={cn(
                  "absolute left-1/2 flex items-center justify-center",
                  "whitespace-nowrap transition-transform duration-300 ease-in-out",
                  "transform translate-x-full opacity-0 group-hover:translate-x-0 group-hover:-translate-x-1/2 group-hover:opacity-100"
                )}
              >
                <ArrowRight className="h-5 w-5 text-white" />
              </span>
            </div>
          </div>
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-10">
      <h2 className="text-2xl font-semibold mb-4">
        También te podría interesar...
      </h2>
      <Slider {...settings}>
        {uniqueProperties.map((prop) => (
          <div key={prop.id} className="px-2" style={{ height: "100%" }}>
            <PropertyCard property={prop} />
          </div>
        ))}
      </Slider>
    </div>
  );
}

"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import type { Property } from "@/lib/types";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  MapPin,
  BedDouble,
  Bath,
  Home,
  SparklesIcon,
  Tag,
} from "lucide-react";

interface Props {
  properties: Property[];
  currentPropertyId: number | string;
}

const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

export default function SimilarPropertiesCarousel({
  properties,
  currentPropertyId,
}: Props) {
  const uniqueProperties = properties
    .filter((prop) => prop.id !== currentPropertyId)
    .filter(
      (prop, index, self) => index === self.findIndex((p) => p.id === prop.id)
    );

  const [activeIndex, setActiveIndex] = useState(0);

  const prevSlide = () => {
    setActiveIndex((prev) =>
      prev === 0 ? uniqueProperties.length - 1 : prev - 1
    );
  };

  const nextSlide = () => {
    setActiveIndex((prev) =>
      prev === uniqueProperties.length - 1 ? 0 : prev + 1
    );
  };

  return (
    <div className="relative w-full">
      <div className="relative h-fit overflow-hidden rounded-lg">
        <AnimatePresence mode="wait">
          {uniqueProperties.map((property, index) => {
            const displayArea = `${property.area.toLocaleString()} m²`;
            const isNew =
              property.createdAt &&
              Date.now() - new Date(property.createdAt).getTime() <
                TWENTY_FOUR_HOURS_MS;

            if (index !== activeIndex) return null;

            return (
              <motion.div
                key={property.id}
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.4 }}
                className="w-full max-w-md mx-auto px-4"
              >
                <div className="flex flex-col w-full h-full overflow-hidden rounded-lg shadow-lg transition-all hover:shadow-xl bg-white">
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
                              property.listingType === "Venta"
                                ? "default"
                                : "secondary"
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
                      <h3 className="text-lg font-semibold mb-1">
                        {property.title}
                      </h3>
                      <div className="flex items-center text-sm text-muted-foreground mb-2">
                        <MapPin className="mr-1 h-4 w-4" />
                        {property.address}, {property.city}
                      </div>
                      <p className="text-xl font-bold text-primary mb-2">
                        {property.price.toLocaleString(undefined, {
                          maximumFractionDigits: 2,
                        })}{" "}
                        {property.listingType === "Alquiler" && (
                          <span className="text-sm font-normal text-muted-foreground">
                            /mes
                          </span>
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
                    </div>
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Indicadores */}
      <div className="absolute z-30 flex -translate-x-1/2 space-x-3 bottom-5 left-1/2">
        {uniqueProperties.map((_, index) => (
          <button
            key={index}
            onClick={() => setActiveIndex(index)}
            className={`w-3 h-3 rounded-full transition ${
              activeIndex === index
                ? "bg-white"
                : "bg-white/50 hover:bg-white/80"
            }`}
            aria-label={`Slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Botón anterior */}
      <button
        onClick={prevSlide}
        className="absolute top-0 left-0 z-30 flex items-center justify-center h-full px-4 cursor-pointer group focus:outline-none"
      >
        <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-gray-500/30 group-hover:bg-gray-700/60 focus:ring-4 focus:ring-white focus:outline-none">
          <svg className="w-4 h-4 text-white rtl:rotate-180" fill="none" viewBox="0 0 6 10">
            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 1 1 5l4 4" />
          </svg>
          <span className="sr-only">Previous</span>
        </span>
      </button>

      {/* Botón siguiente */}
      <button
        onClick={nextSlide}
        className="absolute top-0 right-0 z-30 flex items-center justify-center h-full px-4 cursor-pointer group focus:outline-none"
      >
        <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-gray-500/30 group-hover:bg-gray-700/60 focus:ring-4 focus:ring-white focus:outline-none">
          <svg className="w-4 h-4 text-white rtl:rotate-180" fill="none" viewBox="0 0 6 10">
            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 9 4-4-4-4" />
          </svg>
          <span className="sr-only">Next</span>
        </span>
      </button>
    </div>
  );
}

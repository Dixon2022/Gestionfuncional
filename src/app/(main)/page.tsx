"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Search,
  ArrowRight,
  Home as HomeIcon,
  Building,
  LandPlot,
  Building2 as Building2Icon,
  Hotel,
} from "lucide-react";
import { getProperties } from "@/lib/property-store";
import { useEffect, useState, useRef } from "react";
import type { Property, PropertyType } from "@/lib/types";
import { PROPERTY_TYPES } from "@/lib/constants";
import { Skeleton } from "@/components/ui/skeleton";
import { PropertyCard } from "@/components/property/property-card";
import { useSession, signOut } from "next-auth/react";

// Helpers para iconos y pluralización
const getPropertyTypeIcon = (type: PropertyType) => {
  switch (type) {
    case "Casa":
      return <HomeIcon className="mr-2 h-4 w-4" />;
    case "Apartamento":
      return <Building className="mr-2 h-4 w-4" />;
    case "Condominio":
      return <Building2Icon className="mr-2 h-4 w-4" />;
    case "Adosado":
      return <Hotel className="mr-2 h-4 w-4" />;
    case "Terreno":
      return <LandPlot className="mr-2 h-4 w-4" />;
    default:
      return <HomeIcon className="mr-2 h-4 w-4" />;
  }
};

const pluralizePropertyType = (type: PropertyType, count: number): string => {
  if (count === 1) return type;
  switch (type) {
    case "Casa":
      return "Casas";
    case "Apartamento":
      return "Apartamentos";
    case "Condominio":
      return "Condominios";
    case "Adosado":
      return "Adosados";
    case "Terreno":
      return "Terrenos";
    default:
      return `${type}s`;
  }
};

export default function HomePage() {
  const [allProperties, setAllProperties] = useState<Property[]>([]);
  const [propertyCounts, setPropertyCounts] = useState<Record<
    PropertyType,
    number
  > | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const INACTIVITY_LIMIT_MS = 15 * 60 * 1000; // 15 minutos
  const lastActivityRef = useRef(Date.now());
  const inactivityTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Actualiza el timestamp de última actividad
  const updateActivity = () => {
    lastActivityRef.current = Date.now();
    localStorage.setItem("lastActivity", lastActivityRef.current.toString());
  };

  // Maneja logout por inactividad
  const setupInactivityLogout = () => {
    if (inactivityTimeoutRef.current)
      clearTimeout(inactivityTimeoutRef.current);

    inactivityTimeoutRef.current = setTimeout(() => {
      signOut();
    }, INACTIVITY_LIMIT_MS);
  };

  // Evento que marca cierre de pestaña en localStorage
  useEffect(() => {
    const handleBeforeUnload = () => {
      localStorage.setItem("closed-tab", "true");
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  // Chequear al abrir la página si cerró pestaña o está inactivo
  useEffect(() => {
    const closedTab = localStorage.getItem("closed-tab");
    if (closedTab === "true") {
      localStorage.removeItem("closed-tab");
      signOut();
      return;
    }

    const lastActivity = localStorage.getItem("lastActivity");
    if (lastActivity) {
      const lastActivityTime = parseInt(lastActivity, 10);
      if (Date.now() - lastActivityTime > INACTIVITY_LIMIT_MS) {
        signOut();
        return;
      }
    }

    // Si no hay cierre o timeout, iniciamos el contador de inactividad
    setupInactivityLogout();
  }, []);

  // Escuchar eventos de actividad para resetear timer
  useEffect(() => {
    const events = ["mousemove", "keydown", "scroll", "touchstart"];

    const activityHandler = () => {
      updateActivity();
      setupInactivityLogout();
    };

    events.forEach((evt) => window.addEventListener(evt, activityHandler));

    return () => {
      events.forEach((evt) => window.removeEventListener(evt, activityHandler));
      if (inactivityTimeoutRef.current)
        clearTimeout(inactivityTimeoutRef.current);
    };
  }, []);

  // Carga de propiedades igual que antes
  useEffect(() => {
    const fetchProperties = async () => {
      const properties = await getProperties();
      const sorted = [...properties].sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      });
      setAllProperties(sorted);

      const counts = sorted.reduce((acc, property) => {
        acc[property.type] = (acc[property.type] || 0) + 1;
        return acc;
      }, {} as Record<PropertyType, number>);

      setPropertyCounts(counts);
      setIsLoading(false);
    };

    fetchProperties();
  }, []);

  useEffect(() => {
    // Si detectas que 'closed-tab' está en true, forzar logout
    if (localStorage.getItem("closed-tab") === "true") {
      localStorage.removeItem("closed-tab");
      signOut(); // Aquí sí haces logout al abrir la pestaña NUEVAMENTE
    }
  }, []);

  useEffect(() => {
    const fetchProperties = async () => {
      const properties = await getProperties();
      const sorted = [...properties].sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      });
      setAllProperties(sorted);

      const counts = sorted.reduce((acc, property) => {
        acc[property.type] = (acc[property.type] || 0) + 1;
        return acc;
      }, {} as Record<PropertyType, number>);

      setPropertyCounts(counts);
      setIsLoading(false);
    };

    fetchProperties();
  }, []);

  return (
    <>
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center py-16 md:py-24 bg-gradient-to-br from-primary to-indigo-700 text-primary-foreground text-center px-4 min-h-[400px] md:min-h-[500px]">
        <h1 className="text-4xl md:text-5xl font-bold mb-6 max-w-3xl">
          Encuentra la Propiedad de Tus Sueños
        </h1>
        <p className="text-lg md:text-xl mb-8 max-w-2xl opacity-90">
          Descubre una amplia gama de propiedades con FindHome. Búsqueda
          avanzada, listados detallados. Explora casas, apartamentos, terrenos y
          más. ¡Tu nuevo hogar te espera!
        </p>
        <Button
          size="lg"
          asChild
          className="bg-[#568259] hover:bg-[#4e754f] text-white"
        >
          <Link href="/properties" className="flex items-center justify-center">
            <Search className="mr-2 h-5 w-5" />
            Explorar Propiedades
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </Button>
      </section>

      {/* Property Type Filter Buttons Section */}
      <section className="py-8 md:py-12">
          <h2 className="text-2xl font-bold mb-6 text-center">
            Explora por Tipo de Propiedad
          </h2>
          {isLoading || !propertyCounts ? (
            <div className="flex flex-wrap justify-center gap-3">
              {PROPERTY_TYPES.map((type) => (
                <Skeleton key={type} className="h-10 w-32 rounded-md" />
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap justify-center gap-3">
              {PROPERTY_TYPES.map((type) => {
                const count = propertyCounts[type] || 0;
                if (count > 0) {
                  return (
                    <Button key={type} variant="outline" size="lg" asChild>
                      <Link
                        href={`/properties?propertyType=${encodeURIComponent(
                          type
                        )}`}
                      >
                        {getPropertyTypeIcon(type)}
                        {count} {pluralizePropertyType(type, count)}
                      </Link>
                    </Button>
                  );
                }
                return null;
              })}
            </div>
          )}
      </section>

      {/* Featured Listings Section */}
      <section className="py-8 md:py-12">
        <div className="container mx-w-7xl mx-auto">
          <h2 className="text-2xl font-bold mb-6 text-center">
            Encuentra Tu Propiedad Ideal
          </h2>
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-2 md:px-4">
              {[...Array(6)].map((_, index) => (
                <Skeleton key={index} className="h-64 rounded-md" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-2 md:px-4">
              {allProperties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}

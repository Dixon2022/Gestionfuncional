"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { Property } from "@/lib/types";
import { PropertyCard } from "@/components/property/property-card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

interface Report {
  id: string;
  property: Property;
}

export default function ReportedPropertiesPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [properties, setProperties] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (!loading && (!user || user.role !== "admin")) {
      router.push("/");
      toast({
        title: "Acceso denegado",
        description: "Solo los administradores pueden ver esta página.",
        variant: "destructive",
      });
      return;
    }
  }, [loading, user, router, toast]);

  useEffect(() => {
    const fetchReported = async () => {
      if (user?.role !== "admin") return;

      try {
        setIsLoading(true);
        const res = await fetch("/api/admin/");

        if (!res.ok) {
          throw new Error(`Error ${res.status}: ${res.statusText}`);
        }

        const { reports } = await res.json();
        setProperties(reports || []);
      } catch (err: any) {
        console.error("Fetch error:", err);
        toast({
          title: "Error",
          description: err.message,
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchReported();
  }, [user, toast]);

  const handleDelete = async (propertyId: string) => {
    const confirmDelete = window.confirm(
      "¿Estás seguro de que quieres eliminar esta propiedad?"
    );
    if (!confirmDelete) return;

    try {
      const res = await fetch("/api/admin", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ propertyId }),
      });

      if (!res.ok) {
        throw new Error("No se pudo eliminar la propiedad.");
      }

      // Actualiza el estado local
      setProperties((prev) =>
        prev.filter((report) => report.property.id !== propertyId)
      );

      toast({
        title: "Eliminado",
        description: "La propiedad fue eliminada correctamente.",
      });
    } catch (error: any) {
      console.error(error);
      toast({
        title: "Error al eliminar",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <Header />
      <div className="container py-10">
        <h1 className="text-2xl font-bold mb-6">Propiedades Reportadas</h1>
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-48 w-full rounded-md" />
            ))}
          </div>
        ) : properties.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {properties.map((report) => (
              <div key={report.id} className="relative">
                <PropertyCard property={report.property} />
              </div>
            ))}
          </div>
        ) : (
          <p>No hay propiedades reportadas actualmente.</p>
        )}
      </div>
      <Footer />
    </>
  );
}

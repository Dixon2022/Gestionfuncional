"use client";
import { useAuth } from "@/contexts/auth-context";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import FavoritePropertyCard from "./favoritePropertyCard";

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

export default function FavoritesPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [favorites, setFavorites] = useState<Property[]>([]);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login?redirect=/profile/favorite");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!loading && user?.email) {
      fetch(`/api/favorite?email=${encodeURIComponent(user.email)}`)
        .then((res) => {
          if (!res.ok) throw new Error("Error al obtener favoritos");
          return res.json();
        })
        .then((data) => setFavorites(data.favorites || []))
        .catch((error) => {
          console.error(error);
          setFavorites([]);
        });
    }
  }, [loading, user]);

  if (!favorites) return <div>Cargando favoritos...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Mis Favoritos</h1>
      {favorites.length === 0 ? (
        <p>No tienes propiedades favoritas aún.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map((property) => (
            <FavoritePropertyCard key={property.id} property={property} />
          ))}
        </div>
      )}
    </div>
  );
}


'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { Property } from '@/lib/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, BedDouble, Bath, Home, ArrowRight, SparklesIcon, Trash2, Pencil, Loader2, Tag } from 'lucide-react';
import { useSession } from 'next-auth/react'; // Import useSession
import { deleteProperty } from '@/lib/property-store';
import { useToast } from '@/hooks/use-toast';
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
import { useState } from 'react';

interface PropertyCardProps {
  property: Property;
}

const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

export function PropertyCard({ property }: PropertyCardProps) {
  const { data: session, status } = useSession();
  const user = session?.user as any; // Cast to any to access custom properties like id
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);

  const displayArea = `${property.area.toLocaleString()} m²`;
  const isNew = property.createdAt && (Date.now() - property.createdAt) < TWENTY_FOUR_HOURS_MS;
  const isOwner = status === 'authenticated' && user && user.id === property.ownerId;

  const handleDelete = async () => {
    if (!isOwner || !user?.id) return;
    setIsDeleting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      const success = deleteProperty(property.id, user.id); // Pass session user's id
      if (success) {
        toast({
          title: "Propiedad Eliminada",
          description: `La propiedad "${property.title}" ha sido eliminada.`,
        });
      } else {
        toast({
          title: "Error al Eliminar",
          description: "No se pudo eliminar la propiedad o no tienes permiso.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Ocurrió un error al intentar eliminar la propiedad.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Card className="flex flex-col overflow-hidden rounded-lg shadow-lg transition-all hover:shadow-xl h-full">
      <div className="block group h-full flex flex-col">
        <CardHeader className="p-0">
          <Link href={`/properties/${property.id}`} className="block">
            <div className="relative h-48 w-full overflow-hidden">
              <Image
                src={property.photoDataUri || property.images[0]}
                alt={property.title}
                fill={true}
                style={{objectFit: "cover"}}
                className="transition-transform duration-300 group-hover:scale-105"
                data-ai-hint="exterior casa"
              />
              <div className="absolute top-2 right-2 flex flex-col items-end space-y-1">
                {property.listingType && (
                  <Badge 
                    variant={property.listingType === 'Venta' ? 'default' : 'secondary'}
                    className={property.listingType === 'Alquiler' ? 'bg-blue-500 hover:bg-blue-600 text-white' : ''}
                  >
                    <Tag className="mr-1 h-3 w-3"/>
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
              ₡{property.price.toLocaleString()} {property.listingType === 'Alquiler' ? <span className="text-sm font-normal text-muted-foreground">/mes</span> : ''}
            </p>
            <div className="flex flex-wrap gap-x-3 gap-y-1 text-sm text-muted-foreground">
              <span className="flex items-center"><BedDouble className="mr-1 h-4 w-4" /> {property.bedrooms} Hab</span>
              <span className="flex items-center"><Bath className="mr-1 h-4 w-4" /> {property.bathrooms} Baños</span>
              <span className="flex items-center"><Home className="mr-1 h-4 w-4" /> {displayArea}</span>
            </div>
          </Link>
        </CardContent>
        <CardFooter className="p-4 pt-0 mt-auto">
          <div className="flex w-full gap-2">
            <Button variant="outline" className="flex-grow group-hover:bg-accent group-hover:text-accent-foreground" asChild>
              <Link href={`/properties/${property.id}`}>
                Ver Detalles <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            {isOwner && (
              <>
                <Button variant="outline" size="icon" asChild aria-label="Editar propiedad">
                  <Link href={`/properties/${property.id}/edit`}>
                    <Pencil />
                  </Link>
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="icon" disabled={isDeleting} aria-label="Eliminar propiedad">
                      {isDeleting ? <Loader2 className="animate-spin" /> : <Trash2 />}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Esta acción no se puede deshacer. Esto eliminará permanentemente la propiedad "{property.title}".
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDelete} disabled={isDeleting} className="bg-destructive hover:bg-destructive/90">
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

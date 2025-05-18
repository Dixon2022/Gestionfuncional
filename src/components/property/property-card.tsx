
'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { Property } from '@/lib/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, BedDouble, Bath, Home, ArrowRight, SparklesIcon, Trash2, Pencil, Loader2, Tag } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
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

/**
 * @en Props for the PropertyCard component.
 * @es Props para el componente PropertyCard.
 */
interface PropertyCardProps {
  /**
   * @en The property data to display.
   * @es Los datos de la propiedad a mostrar.
   */
  property: Property;
}

/**
 * @en Constant for 24 hours in milliseconds.
 * @es Constante para 24 horas en milisegundos.
 */
const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

/**
 * @en A card component to display a summary of a property.
 * @es Un componente de tarjeta para mostrar un resumen de una propiedad.
 * @param {PropertyCardProps} props - @en The component props. @es Las props del componente.
 * @returns {JSX.Element} The PropertyCard component.
 */
export function PropertyCard({ property }: PropertyCardProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);

  /**
   * @en Formatted area string (e.g., "120 m²").
   * @es Cadena de área formateada (p.ej., "120 m²").
   */
  const displayArea = `${property.area.toLocaleString()} m²`;
  /**
   * @en Boolean indicating if the property was created within the last 24 hours.
   * @es Booleano que indica si la propiedad fue creada en las últimas 24 horas.
   */
  const isNew = property.createdAt && (Date.now() - property.createdAt) < TWENTY_FOUR_HOURS_MS;
  /**
   * @en Boolean indicating if the current logged-in user is the owner of the property.
   * @es Booleano que indica si el usuario actualmente conectado es el propietario de la propiedad.
   */
  const isOwner = user && user.id === property.ownerId;

  /**
   * @en Handles the deletion of the property.
   * @es Maneja la eliminación de la propiedad.
   * @async
   * @returns {Promise<void>}
   */
  const handleDelete = async () => {
    if (!isOwner || !user) return; 
    setIsDeleting(true);
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500)); 
      const success = deleteProperty(property.id, user.id); 
      if (success) {
        toast({
          title: "[EN] Property Deleted [ES] Propiedad Eliminada",
          description: `[EN] Property "${property.title}" has been deleted. [ES] La propiedad "${property.title}" ha sido eliminada.`,
        });
      } else {
        toast({
          title: "[EN] Deletion Error [ES] Error al Eliminar",
          description: "[EN] Could not delete property or you don't have permission. [ES] No se pudo eliminar la propiedad o no tienes permiso.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "[EN] Error [ES] Error",
        description: "[EN] An error occurred while trying to delete the property. [ES] Ocurrió un error al intentar eliminar la propiedad.",
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
                fill={true} // Changed from layout="fill" objectFit="cover" for Next 13+
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
                  <Badge variant="destructive">[EN] Featured [ES] Destacada</Badge>
                )}
                {isNew && (
                  <Badge className="bg-green-500 hover:bg-green-600 text-white">
                    <SparklesIcon className="mr-1 h-3 w-3" />
                    [EN] New [ES] Nueva
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
                [EN] View Details [ES] Ver Detalles <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            {isOwner && (
              <>
                <Button variant="outline" size="icon" asChild aria-label="[EN] Edit property [ES] Editar propiedad">
                  <Link href={`/properties/${property.id}/edit`}>
                    <Pencil />
                  </Link>
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="icon" disabled={isDeleting} aria-label="[EN] Delete property [ES] Eliminar propiedad">
                      {isDeleting ? <Loader2 className="animate-spin" /> : <Trash2 />}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>[EN] Are you sure? [ES] ¿Estás seguro?</AlertDialogTitle>
                      <AlertDialogDescription>
                        [EN] This action cannot be undone. This will permanently delete the property "{property.title}".
                        [ES] Esta acción no se puede deshacer. Esto eliminará permanentemente la propiedad "{property.title}".
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel disabled={isDeleting}>[EN] Cancel [ES] Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDelete} disabled={isDeleting} className="bg-destructive hover:bg-destructive/90">
                        {isDeleting ? "[EN] Deleting... [ES] Eliminando..." : "[EN] Yes, delete [ES] Sí, eliminar"}
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

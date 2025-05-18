import Image from 'next/image';
import Link from 'next/link';
import type { Property } from '@/lib/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, BedDouble, Bath, Home, ArrowRight, SparklesIcon } from 'lucide-react';

interface PropertyCardProps {
  property: Property;
}

const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

export function PropertyCard({ property }: PropertyCardProps) {
  const displayArea = `${property.area.toLocaleString()} m²`; // Area is now in sqm

  const isNew = property.createdAt && (Date.now() - property.createdAt) < TWENTY_FOUR_HOURS_MS;

  return (
    <Card className="flex flex-col overflow-hidden rounded-lg shadow-lg transition-all hover:shadow-xl h-full">
      <Link href={`/properties/${property.id}`} className="block group h-full">
        <CardHeader className="p-0">
          <div className="relative h-48 w-full overflow-hidden">
            <Image
              src={property.photoDataUri || property.images[0]}
              alt={property.title}
              layout="fill"
              objectFit="cover"
              className="transition-transform duration-300 group-hover:scale-105"
              data-ai-hint="exterior casa"
            />
            <div className="absolute top-2 right-2 flex flex-col items-end space-y-1">
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
        </CardHeader>
        <CardContent className="p-4 flex-grow">
          <CardTitle className="text-lg mb-1 leading-tight group-hover:text-primary transition-colors">
            {property.title}
          </CardTitle>
          <div className="flex items-center text-sm text-muted-foreground mb-2">
            <MapPin className="mr-1 h-4 w-4" />
            {property.address}, {property.city}
          </div>
          <p className="text-xl font-bold text-primary mb-2">
            ${property.price.toLocaleString()}
          </p>
          <div className="flex flex-wrap gap-x-3 gap-y-1 text-sm text-muted-foreground">
            <span className="flex items-center"><BedDouble className="mr-1 h-4 w-4" /> {property.bedrooms} Hab</span>
            <span className="flex items-center"><Bath className="mr-1 h-4 w-4" /> {property.bathrooms} Baños</span>
            <span className="flex items-center"><Home className="mr-1 h-4 w-4" /> {displayArea}</span>
          </div>
        </CardContent>
        <CardFooter className="p-4 pt-0">
            <Button variant="outline" className="w-full group-hover:bg-accent group-hover:text-accent-foreground">
              Ver Detalles <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
        </CardFooter>
      </Link>
    </Card>
  );
}

import Image from 'next/image';
import Link from 'next/link';
import type { Property } from '@/lib/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, BedDouble, Bath, Home, ArrowRight } from 'lucide-react';

interface PropertyCardProps {
  property: Property;
}

export function PropertyCard({ property }: PropertyCardProps) {
  return (
    <Card className="flex flex-col overflow-hidden rounded-lg shadow-lg transition-all hover:shadow-xl h-full">
      <Link href={`/properties/${property.id}`} className="block group h-full">
        <CardHeader className="p-0">
          <div className="relative h-48 w-full overflow-hidden">
            <Image
              src={property.images[0]}
              alt={property.title}
              layout="fill"
              objectFit="cover"
              className="transition-transform duration-300 group-hover:scale-105"
              data-ai-hint="house exterior"
            />
            {property.isFeatured && (
              <Badge variant="destructive" className="absolute top-2 right-2">Featured</Badge>
            )}
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
            <span className="flex items-center"><BedDouble className="mr-1 h-4 w-4" /> {property.bedrooms} Beds</span>
            <span className="flex items-center"><Bath className="mr-1 h-4 w-4" /> {property.bathrooms} Baths</span>
            <span className="flex items-center"><Home className="mr-1 h-4 w-4" /> {property.area} sqft</span>
          </div>
        </CardContent>
        <CardFooter className="p-4 pt-0">
            <Button variant="outline" className="w-full group-hover:bg-accent group-hover:text-accent-foreground">
              View Details <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
        </CardFooter>
      </Link>
    </Card>
  );
}

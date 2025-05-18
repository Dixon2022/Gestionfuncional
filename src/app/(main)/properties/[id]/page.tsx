import { PropertyDetailsView } from '@/components/property/property-details-view';
import { MOCK_PROPERTIES_INITIAL } from '@/lib/constants';
import { getPropertyById } from '@/lib/property-store';
import { notFound } from 'next/navigation';
import type { Metadata, ResolvingMetadata } from 'next';
import type { Property } from '@/lib/types';

interface PropertyPageProps {
  params: { id: string };
}

// This function can be used to pre-render static pages at build time for initial mock properties
export async function generateStaticParams() {
  return MOCK_PROPERTIES_INITIAL.map((property) => ({
    id: property.id,
  }));
}

async function getProperty(id: string): Promise<Property | undefined> {
  // Attempt to get property from the dynamic store first (for client-side additions)
  // This will run server-side during ISR or SSR for new IDs not in generateStaticParams
  let property = getPropertyById(id);
  
  // Fallback for properties that might only exist in the initial static list
  // (though getPropertyById should cover this if the store is initialized correctly)
  if (!property) {
    property = MOCK_PROPERTIES_INITIAL.find((p) => p.id === id);
  }
  return property;
}

export async function generateMetadata(
  { params }: PropertyPageProps,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const property = await getProperty(params.id);

  if (!property) {
    return {
      title: 'Propiedad No Encontrada - PropVerse',
    }
  }

  const descriptionSubstring = property.description ? property.description.substring(0, 160) : 'Ver detalles de la propiedad.';

  return {
    title: `${property.title} - PropVerse`,
    description: descriptionSubstring,
    openGraph: {
      title: property.title,
      description: descriptionSubstring,
      images: property.images.length > 0 ? [property.images[0]] : ['https://placehold.co/800x600.png?text=Propiedad'],
    },
  }
}


export default async function PropertyPage({ params }: PropertyPageProps) {
  const property = await getProperty(params.id);

  if (!property) {
    notFound();
  }

  return <PropertyDetailsView property={property} />;
}

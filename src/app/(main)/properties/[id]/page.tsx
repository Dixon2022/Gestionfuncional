import { PropertyDetailsView } from '@/components/property/property-details-view';
import { MOCK_PROPERTIES } from '@/lib/constants';
import { notFound } from 'next/navigation';
import type { Metadata, ResolvingMetadata } from 'next';

interface PropertyPageProps {
  params: { id: string };
}

// This function can be used to pre-render static pages at build time
export async function generateStaticParams() {
  return MOCK_PROPERTIES.map((property) => ({
    id: property.id,
  }));
}

async function getProperty(id: string) {
  // In a real app, you'd fetch this from a database or API
  const property = MOCK_PROPERTIES.find((p) => p.id === id);
  return property;
}

export async function generateMetadata(
  { params }: PropertyPageProps,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const property = await getProperty(params.id);

  if (!property) {
    return {
      title: 'Property Not Found - PropVerse',
    }
  }

  return {
    title: `${property.title} - PropVerse`,
    description: property.description.substring(0, 160), // SEO description
    openGraph: {
      title: property.title,
      description: property.description.substring(0, 160),
      images: [property.images[0]],
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

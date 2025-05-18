import { FeaturedListings } from '@/components/property/featured-listings';
import { MOCK_PROPERTIES } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Search, ArrowRight } from 'lucide-react';

export default function HomePage() {
  return (
    <>
      <section className="py-16 md:py-24 bg-gradient-to-br from-primary to-indigo-700 text-primary-foreground">
        <div className="container text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Find Your Dream Property</h1>
          <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto opacity-90">
            Discover a wide range of properties with PropVerse. Advanced search, detailed listings, and AI-powered insights.
          </p>
          <div className="flex justify-center">
            <Button size="lg" asChild className="bg-accent hover:bg-accent/90 text-accent-foreground">
              <Link href="/properties">
                <Search className="mr-2 h-5 w-5" />
                Explore Properties
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
      
      <FeaturedListings properties={MOCK_PROPERTIES} />

      <section className="py-12">
        <div className="container text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Sell?</h2>
          <p className="text-lg text-muted-foreground mb-6 max-w-xl mx-auto">
            Leverage our AI to craft compelling property descriptions that attract buyers.
          </p>
          <Button size="lg" variant="outline" asChild>
            <Link href="/generate-description">
              Generate AI Description
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>
    </>
  );
}

import { GenerateDescriptionForm } from '@/components/ai/generate-description-form';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Property Description Generator - PropVerse',
  description: 'Generate compelling property descriptions using AI. Input property details and let our AI craft the perfect listing text.',
};

export default function GenerateDescriptionPage() {
  return (
    <div className="container py-8 md:py-12">
      <div className="text-center mb-10">
        <h1 className="text-3xl md:text-4xl font-bold">AI Property Description Generator</h1>
        <p className="text-lg text-muted-foreground mt-2 max-w-xl mx-auto">
          Craft compelling property descriptions effortlessly. Provide some details and let our AI do the rest.
        </p>
      </div>
      <GenerateDescriptionForm />
    </div>
  );
}

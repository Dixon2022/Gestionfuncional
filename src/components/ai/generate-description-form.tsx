'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Sparkles, Loader2 } from 'lucide-react';
import { generatePropertyDescription, type GeneratePropertyDescriptionInput } from '@/ai/flows/generate-property-description';
import { PROPERTY_TYPES } from '@/lib/constants';
import Image from 'next/image';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

const generateDescriptionSchema = z.object({
  photo: z
    .custom<FileList>()
    .refine((files) => files && files.length > 0, 'Property photo is required.')
    .refine((files) => files?.[0]?.size <= MAX_FILE_SIZE, `Max file size is 5MB.`)
    .refine(
      (files) => ACCEPTED_IMAGE_TYPES.includes(files?.[0]?.type),
      '.jpg, .jpeg, .png and .webp files are accepted.'
    ),
  propertyType: z.string().min(1, { message: 'Property type is required.' }),
  location: z.string().min(2, { message: 'Location must be at least 2 characters.' }),
  numberOfBedrooms: z.coerce.number().min(0, { message: 'Number of bedrooms cannot be negative.' }),
  numberOfBathrooms: z.coerce.number().min(0, { message: 'Number of bathrooms cannot be negative.' }),
  squareFootage: z.coerce.number().min(1, { message: 'Square footage must be greater than 0.' }),
  keyFeatures: z.string().min(5, { message: 'Please list at least one key feature.' }),
});

type GenerateDescriptionFormValues = z.infer<typeof generateDescriptionSchema>;

export function GenerateDescriptionForm() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [generatedDescription, setGeneratedDescription] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const form = useForm<GenerateDescriptionFormValues>({
    resolver: zodResolver(generateDescriptionSchema),
    defaultValues: {
      propertyType: '',
      location: '',
      numberOfBedrooms: 2,
      numberOfBathrooms: 1,
      squareFootage: 1000,
      keyFeatures: '',
    },
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      form.setValue('photo', event.target.files as FileList);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreviewImage(null);
    }
  };

  async function onSubmit(data: GenerateDescriptionFormValues) {
    setIsLoading(true);
    setGeneratedDescription(null);

    try {
      const photoFile = data.photo[0];
      const reader = new FileReader();

      reader.onload = async (e) => {
        const photoDataUri = e.target?.result as string;
        if (!photoDataUri) {
          toast({ title: 'Error reading file', description: 'Could not read the uploaded photo.', variant: 'destructive' });
          setIsLoading(false);
          return;
        }

        const input: GeneratePropertyDescriptionInput = {
          photoDataUri,
          propertyType: data.propertyType,
          location: data.location,
          numberOfBedrooms: data.numberOfBedrooms,
          numberOfBathrooms: data.numberOfBathrooms,
          squareFootage: data.squareFootage,
          keyFeatures: data.keyFeatures,
        };
        
        const result = await generatePropertyDescription(input);
        setGeneratedDescription(result.description);
        toast({
          title: 'Description Generated!',
          description: 'Your AI-powered property description is ready.',
        });
      };

      reader.onerror = () => {
        toast({ title: 'Error reading file', description: 'Failed to process the uploaded photo.', variant: 'destructive' });
        setIsLoading(false);
      };

      reader.readAsDataURL(photoFile);

    } catch (error) {
      console.error('Error generating description:', error);
      toast({
        title: 'Generation Failed',
        description: (error as Error).message || 'An unexpected error occurred.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6 border rounded-lg shadow-lg bg-card">
      <h2 className="text-2xl font-semibold mb-6 flex items-center">
        <Sparkles className="mr-2 h-6 w-6 text-primary" />
        AI Property Description Generator
      </h2>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="photo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Property Photo</FormLabel>
                <FormControl>
                  <Input 
                    type="file" 
                    accept={ACCEPTED_IMAGE_TYPES.join(',')}
                    onChange={handleFileChange}
                  />
                </FormControl>
                {previewImage && (
                  <div className="mt-2 relative w-full h-48 overflow-hidden rounded-md border">
                    <Image src={previewImage} alt="Preview" layout="fill" objectFit="cover" data-ai-hint="property photo" />
                  </div>
                )}
                <FormDescription>Upload a clear photo of the property (max 5MB).</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="propertyType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Property Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select property type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {PROPERTY_TYPES.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Location (City, Neighborhood)</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Sunnyvale, Willow Creek" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="numberOfBedrooms"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bedrooms</FormLabel>
                  <FormControl>
                    <Input type="number" min="0" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="numberOfBathrooms"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bathrooms</FormLabel>
                  <FormControl>
                    <Input type="number" min="0" step="0.5" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="squareFootage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Square Footage</FormLabel>
                  <FormControl>
                    <Input type="number" min="1" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="keyFeatures"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Key Features (comma-separated)</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="e.g., Renovated kitchen, Hardwood floors, Large backyard"
                    {...field}
                  />
                </FormControl>
                <FormDescription>Highlight the best aspects of the property.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Description
              </>
            )}
          </Button>
        </form>
      </Form>

      {generatedDescription && (
        <div className="mt-8 p-4 border rounded-md bg-secondary/30">
          <h3 className="text-lg font-semibold mb-2">Generated Description:</h3>
          <p className="text-sm whitespace-pre-line">{generatedDescription}</p>
        </div>
      )}
    </div>
  );
}

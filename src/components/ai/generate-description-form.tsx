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
import { Sparkles, Loader2, Save, CheckCircle } from 'lucide-react';
import { generatePropertyDescription, type GeneratePropertyDescriptionInput } from '@/ai/flows/generate-property-description';
import { PROPERTY_TYPES } from '@/lib/constants';
import Image from 'next/image';
import { useAuth } from '@/contexts/auth-context';
import { addProperty, sqmToSqft } from '@/lib/property-store';
import type { Property } from '@/lib/types';
import { useRouter } from 'next/navigation';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

const generateDescriptionSchema = z.object({
  photo: z
    .custom<FileList>()
    .refine((files) => files && files.length > 0, 'La foto de la propiedad es requerida.')
    .refine((files) => files?.[0]?.size <= MAX_FILE_SIZE, `El tamaño máximo del archivo es 5MB.`)
    .refine(
      (files) => ACCEPTED_IMAGE_TYPES.includes(files?.[0]?.type),
      'Se aceptan archivos .jpg, .jpeg, .png y .webp.'
    ),
  propertyType: z.string().min(1, { message: 'El tipo de propiedad es requerido.' }),
  location: z.string().min(2, { message: 'La ubicación debe tener al menos 2 caracteres.' }),
  numberOfBedrooms: z.coerce.number().min(0, { message: 'El número de habitaciones no puede ser negativo.' }),
  numberOfBathrooms: z.coerce.number().min(0, { message: 'El número de baños no puede ser negativo.' }),
  squareFootage: z.coerce.number().min(1, { message: 'Los metros cuadrados deben ser mayores que 0.' }), // Assuming input is in sqm now
  keyFeatures: z.string().min(5, { message: 'Por favor, lista al menos una característica clave.' }),
});

type GenerateDescriptionFormValues = z.infer<typeof generateDescriptionSchema>;

export function GenerateDescriptionForm() {
  const { toast } = useToast();
  const { user } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [generatedDescription, setGeneratedDescription] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [formDataForSave, setFormDataForSave] = useState<GenerateDescriptionFormValues | null>(null);
  const [photoDataUriForSave, setPhotoDataUriForSave] = useState<string | null>(null);


  const form = useForm<GenerateDescriptionFormValues>({
    resolver: zodResolver(generateDescriptionSchema),
    defaultValues: {
      propertyType: '',
      location: '',
      numberOfBedrooms: 2,
      numberOfBathrooms: 1,
      squareFootage: 100, // Default to 100 sqm
      keyFeatures: '',
    },
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      form.setValue('photo', event.target.files as FileList);
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setPreviewImage(result);
        setPhotoDataUriForSave(result); // Store for saving property
      };
      reader.readAsDataURL(file);
    } else {
      setPreviewImage(null);
      setPhotoDataUriForSave(null);
    }
  };

  async function onSubmit(data: GenerateDescriptionFormValues) {
    setIsLoading(true);
    setGeneratedDescription(null);
    setFormDataForSave(data); // Store form data for potential save

    try {
      if (!photoDataUriForSave) {
        toast({ title: 'Error al leer archivo', description: 'No se pudo leer la foto cargada.', variant: 'destructive' });
        setIsLoading(false);
        return;
      }
      
      const input: GeneratePropertyDescriptionInput = {
        photoDataUri: photoDataUriForSave,
        propertyType: data.propertyType,
        location: data.location,
        numberOfBedrooms: data.numberOfBedrooms,
        numberOfBathrooms: data.numberOfBathrooms,
        squareFootage: sqmToSqft(data.squareFootage), // Convert sqm to sqft for the AI
        keyFeatures: data.keyFeatures,
      };
      
      const result = await generatePropertyDescription(input);
      setGeneratedDescription(result.description);
      toast({
        title: '¡Descripción Generada!',
        description: 'Tu descripción de propiedad generada por IA está lista.',
      });

    } catch (error) {
      console.error('Error generando descripción:', error);
      toast({
        title: 'Falló la Generación',
        description: (error as Error).message || 'Ocurrió un error inesperado.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }

  const handleSaveProperty = async () => {
    if (!user || !formDataForSave || !generatedDescription || !photoDataUriForSave) {
      toast({
        title: 'Error',
        description: 'Faltan datos para guardar la propiedad o no has iniciado sesión.',
        variant: 'destructive',
      });
      return;
    }
    setIsSaving(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newPropertyId = Date.now().toString();
    const newProperty: Property = {
      id: newPropertyId,
      title: `Propiedad en ${formDataForSave.location}`, // Simple title
      address: formDataForSave.location, // Use location as address for simplicity
      city: formDataForSave.location.split(',')[0]?.trim() || formDataForSave.location, // Extract city
      price: Math.floor(Math.random() * (1000000 - 50000 + 1)) + 50000, // Random price
      bedrooms: formDataForSave.numberOfBedrooms,
      bathrooms: formDataForSave.numberOfBathrooms,
      area: formDataForSave.squareFootage, // Area in sqm
      type: formDataForSave.propertyType as Property['type'],
      description: generatedDescription,
      images: [photoDataUriForSave, 'https://placehold.co/600x400.png?text=Interior', 'https://placehold.co/600x400.png?text=Detalle'], // Use uploaded image and placeholders
      isFeatured: false,
      agent: { // Assign current user as agent (mock)
        name: user.name || user.email.split('@')[0],
        email: user.email,
        phone: 'N/A', // Placeholder
        avatarUrl: 'https://placehold.co/100x100.png?text=Agente'
      },
      features: formDataForSave.keyFeatures.split(',').map(f => f.trim()),
      yearBuilt: new Date().getFullYear() - Math.floor(Math.random() * 20), // Random year
      lotSize: formDataForSave.squareFootage + Math.floor(Math.random() * 50), // Slightly larger lot size
      ownerId: user.id,
      photoDataUri: photoDataUriForSave, // Store the original data URI
    };

    addProperty(newProperty);

    toast({
      title: '¡Propiedad Guardada!',
      description: 'Tu nueva propiedad ha sido añadida y está visible.',
      action: (
        <Button variant="outline" size="sm" onClick={() => router.push(`/properties/${newPropertyId}`)}>
          Ver Propiedad
        </Button>
      )
    });
    // Optionally reset form or redirect
    // form.reset();
    // setGeneratedDescription(null);
    // setPreviewImage(null);
    // setFormDataForSave(null);
    // setPhotoDataUriForSave(null);
    router.push(`/properties/${newPropertyId}`);

    setIsSaving(false);
  };


  return (
    <div className="max-w-2xl mx-auto p-6 border rounded-lg shadow-lg bg-card">
      <h2 className="text-2xl font-semibold mb-6 flex items-center">
        <Sparkles className="mr-2 h-6 w-6 text-primary" />
        Detalles de la Propiedad
      </h2>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="photo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Foto de la Propiedad</FormLabel>
                <FormControl>
                  <Input 
                    type="file" 
                    accept={ACCEPTED_IMAGE_TYPES.join(',')}
                    onChange={handleFileChange}
                  />
                </FormControl>
                {previewImage && (
                  <div className="mt-2 relative w-full h-48 overflow-hidden rounded-md border">
                    <Image src={previewImage} alt="Vista previa" layout="fill" objectFit="cover" data-ai-hint="foto propiedad" />
                  </div>
                )}
                <FormDescription>Sube una foto clara de la propiedad (máx 5MB).</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="propertyType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo de Propiedad</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona el tipo de propiedad" />
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
                <FormLabel>Ubicación (Ciudad, Barrio)</FormLabel>
                <FormControl>
                  <Input placeholder="Ej: Madrid, Salamanca" {...field} />
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
                  <FormLabel>Habitaciones</FormLabel>
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
                  <FormLabel>Baños</FormLabel>
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
                  <FormLabel>Superficie (m²)</FormLabel>
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
                <FormLabel>Características Clave (separadas por coma)</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Ej: Cocina renovada, Suelos de parquet, Amplio jardín"
                    {...field}
                  />
                </FormControl>
                <FormDescription>Destaca los mejores aspectos de la propiedad.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generando...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generar Descripción
              </>
            )}
          </Button>
        </form>
      </Form>

      {generatedDescription && (
        <div className="mt-8 p-4 border rounded-md bg-secondary/30">
          <h3 className="text-lg font-semibold mb-2">Descripción Generada:</h3>
          <p className="text-sm whitespace-pre-line">{generatedDescription}</p>
          {user && formDataForSave && (
             <Button onClick={handleSaveProperty} className="w-full mt-4 bg-accent hover:bg-accent/90" disabled={isSaving || isLoading}>
             {isSaving ? (
               <>
                 <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                 Guardando...
               </>
             ) : (
               <>
                 <Save className="mr-2 h-4 w-4" />
                 Guardar como Propiedad
               </>
             )}
           </Button>
          )}
        </div>
      )}
    </div>
  );
}


'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/hooks/use-toast';
import { getPropertyById, updateProperty, sqmToSqft } from '@/lib/property-store';
import type { Property, PropertyType, ListingType } from '@/lib/types';
import { PROPERTY_TYPES, LISTING_TYPES } from '@/lib/constants';
import { Loader2, Save, PencilLine, Sparkles } from 'lucide-react';
import Image from 'next/image';
import { generatePropertyDescription, type GeneratePropertyDescriptionInput } from '@/ai/flows/generate-property-description';

const editPropertySchema = z.object({
  title: z.string().min(5, { message: 'El título debe tener al menos 5 caracteres.' }),
  price: z.coerce.number().min(1, { message: 'El precio debe ser mayor que 0.' }),
  propertyType: z.string().min(1, { message: 'El tipo de propiedad es requerido.' }) as z.ZodType<PropertyType>,
  listingType: z.string().min(1, { message: 'El tipo de listado es requerido.'}) as z.ZodType<ListingType>,
  address: z.string().min(5, { message: 'La dirección debe tener al menos 5 caracteres.' }),
  city: z.string().min(2, { message: 'La ciudad debe tener al menos 2 caracteres.' }),
  numberOfBedrooms: z.coerce.number().min(0, { message: 'El número de habitaciones no puede ser negativo.' }),
  numberOfBathrooms: z.coerce.number().min(0, { message: 'El número de baños no puede ser negativo.' }),
  area: z.coerce.number().min(1, { message: 'Los metros cuadrados deben ser mayores que 0.' }), 
  keyFeatures: z.string().min(5, { message: 'Por favor, lista al menos una característica clave.' }),
  description: z.string().min(20, { message: 'La descripción debe tener al menos 20 caracteres.' }),
});

type EditPropertyFormValues = z.infer<typeof editPropertySchema>;

export default function EditPropertyPage() {
  const router = useRouter();
  const params = useParams();
  const id = typeof params.id === 'string' ? params.id : undefined;

  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const [property, setProperty] = useState<Property | null>(null);
  const [isLoading, setIsLoading] = useState(true); 
  const [isSaving, setIsSaving] = useState(false); 
  const [isGeneratingAIDescription, setIsGeneratingAIDescription] = useState(false);
  const [isClient, setIsClient] = useState(false);

  const form = useForm<EditPropertyFormValues>({
    resolver: zodResolver(editPropertySchema),
    defaultValues: {
        title: '',
        price: 0,
        propertyType: 'Casa',
        listingType: 'Venta',
        address: '',
        city: '',
        numberOfBedrooms: 0,
        numberOfBathrooms: 0,
        area: 0,
        keyFeatures: '',
        description: '',
    },
  });

  useEffect(() => {
    setIsClient(true);
  }, []);
  
  useEffect(() => {
    if (!isClient || authLoading) return;

    if (!user) {
      router.push(`/login?redirect=/properties/${id}/edit`);
      return;
    }

    if (id) {
      const fetchedProperty = getPropertyById(id);
      if (fetchedProperty) {
        if (fetchedProperty.ownerId !== user.id) {
          toast({ title: "Acceso Denegado", description: "No tienes permiso para editar esta propiedad.", variant: "destructive" });
          router.push(`/properties/${id}`);
          return;
        }
        setProperty(fetchedProperty);
        form.reset({
          title: fetchedProperty.title,
          price: fetchedProperty.price,
          propertyType: fetchedProperty.type,
          listingType: fetchedProperty.listingType,
          address: fetchedProperty.address,
          city: fetchedProperty.city,
          numberOfBedrooms: fetchedProperty.bedrooms,
          numberOfBathrooms: fetchedProperty.bathrooms,
          area: fetchedProperty.area,
          keyFeatures: fetchedProperty.features?.join(', ') || '',
          description: fetchedProperty.description,
        });
      } else {
        toast({ title: "Propiedad no encontrada", variant: "destructive" });
        router.push('/properties'); 
        return;
      }
    } else {
       toast({ title: "ID de propiedad no válido", variant: "destructive" });
       router.push('/properties');
       return;
    }
    setIsLoading(false);
  }, [id, user, authLoading, router, form, toast, isClient]);

  const handleGenerateAIDescription = async () => {
    if (!property) return;
    setIsGeneratingAIDescription(true);
    const currentValues = form.getValues();
    
    let photoUriToUse = property.photoDataUri;
    if (!photoUriToUse && property.images && property.images.length > 0) {
      photoUriToUse = property.images[0];
    }

    if (!photoUriToUse) {
        toast({ title: "Foto Requerida", description: "Se necesita una foto para generar la descripción con IA. Esta propiedad no tiene una foto principal adecuada.", variant: "destructive"});
        setIsGeneratingAIDescription(false);
        return;
    }

    if (!photoUriToUse.startsWith('data:')) {
        toast({ title: "Conversión de Foto Necesaria", description: "La foto principal es una URL. Para la generación con IA en edición, se prefiere una foto cargada directamente. Esta función puede no ser óptima.", variant: "default"});
    }

    try {
        const input: GeneratePropertyDescriptionInput = {
            photoDataUri: photoUriToUse, 
            propertyType: currentValues.propertyType,
            location: currentValues.city, 
            numberOfBedrooms: currentValues.numberOfBedrooms,
            numberOfBathrooms: currentValues.numberOfBathrooms,
            squareFootage: sqmToSqft(currentValues.area), 
            keyFeatures: currentValues.keyFeatures,
        };
        const result = await generatePropertyDescription(input);
        form.setValue('description', result.description);
        toast({ title: '¡Descripción Actualizada por IA!', description: 'La descripción ha sido re-generada.' });
    } catch (error) {
        console.error('Error generando descripción con IA en edición:', error);
        toast({ title: 'Falló la Generación', description: (error as Error).message || 'Ocurrió un error al generar la descripción con IA.', variant: 'destructive' });
    } finally {
        setIsGeneratingAIDescription(false);
    }
  };

  const onSubmit = async (data: EditPropertyFormValues) => {
    if (!property || !user || user.id !== property.ownerId) {
        toast({ title: "Error de autorización", description: "No puedes editar esta propiedad.", variant: "destructive" });
        return;
    }
    setIsSaving(true);
    
    const updatedPropertyData: Partial<Property> = {
        title: data.title,
        price: data.price,
        type: data.propertyType,
        listingType: data.listingType,
        address: data.address,
        city: data.city,
        bedrooms: data.numberOfBedrooms,
        bathrooms: data.numberOfBathrooms,
        area: data.area,
        features: data.keyFeatures.split(',').map(f => f.trim()).filter(f => f),
        description: data.description,
    };

    try {
        await new Promise(resolve => setTimeout(resolve, 1000)); 
        const success = updateProperty(property.id, updatedPropertyData, user.id);
        if (success) {
            toast({
                title: '¡Propiedad Actualizada!',
                description: 'Los cambios en la propiedad han sido guardados.',
            });
            router.push(`/properties/${property.id}`);
        } else {
            toast({
                title: 'Error al Actualizar',
                description: 'No se pudo guardar los cambios en la propiedad. Verifica que eres el propietario.',
                variant: 'destructive',
            });
        }
    } catch (error) {
        toast({
            title: 'Error Inesperado',
            description: 'Ocurrió un error al actualizar la propiedad.',
            variant: 'destructive',
        });
    } finally {
        setIsSaving(false);
    }
  };

  if (isLoading || authLoading || !isClient) {
    return (
      <div className="flex min-h-[calc(100vh-theme(spacing.16))] flex-1 items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <span className="sr-only">Cargando editor...</span>
      </div>
    );
  }

  if (!property) {
    return (
         <div className="container py-12 text-center">
            <p>No se pudo cargar la propiedad para editar.</p>
         </div>
    );
  }
  
  return (
    <div className="container py-8 md:py-12">
      <Card className="max-w-2xl mx-auto shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center text-2xl">
            <PencilLine className="mr-2 h-6 w-6 text-primary" />
            Editar Propiedad
          </CardTitle>
          <CardDescription>Actualiza los detalles de tu propiedad "{property.title}".</CardDescription>
        </CardHeader>
        <CardContent>
          {(property.photoDataUri || (property.images && property.images.length > 0)) && (
            <div className="mb-6 relative w-full h-48 overflow-hidden rounded-md border">
              <Image 
                src={property.photoDataUri || property.images[0]} 
                alt="Vista previa" 
                fill={true}
                style={{objectFit: "cover"}}
                data-ai-hint="foto propiedad"
              />
            </div>
          )}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Título de la Propiedad</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: Hermoso Apartamento con Vistas" {...field} disabled={isSaving || isGeneratingAIDescription} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Precio (CRC)</FormLabel>
                      <FormControl>
                        <Input type="number" min="1" placeholder="Ej: 50000000" {...field} disabled={isSaving || isGeneratingAIDescription} />
                      </FormControl>
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
                      <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isSaving || isGeneratingAIDescription}>
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder="Selecciona el tipo" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {PROPERTY_TYPES.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="listingType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Listado</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isSaving || isGeneratingAIDescription}>
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder="Selecciona Venta o Alquiler" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {LISTING_TYPES.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dirección Completa</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: Calle Principal 123, Residencial Los Robles" {...field} disabled={isSaving || isGeneratingAIDescription} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ciudad/Cantón</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: Escazú" {...field} disabled={isSaving || isGeneratingAIDescription} />
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
                        <Input type="number" min="0" {...field} disabled={isSaving || isGeneratingAIDescription} />
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
                        <Input type="number" min="0" step="0.5" {...field} disabled={isSaving || isGeneratingAIDescription} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="area"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Superficie (m²)</FormLabel>
                      <FormControl>
                        <Input type="number" min="1" {...field} disabled={isSaving || isGeneratingAIDescription} />
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
                        disabled={isSaving || isGeneratingAIDescription}
                      />
                    </FormControl>
                     <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descripción de la Propiedad</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe tu propiedad detalladamente..."
                        className="min-h-[120px]"
                        {...field}
                        disabled={isSaving || isGeneratingAIDescription}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleGenerateAIDescription} 
                disabled={isGeneratingAIDescription || isSaving}
                className="w-full"
                >
                {isGeneratingAIDescription ? (
                    <> <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Regenerando Descripción con IA... </>
                ) : (
                    <> <Sparkles className="mr-2 h-4 w-4" /> Regenerar Descripción con IA </>
                )}
              </Button>
              
              <div className="flex justify-end space-x-3 pt-4">
                  <Button type="button" variant="outline" onClick={() => router.back()} disabled={isSaving || isGeneratingAIDescription}>
                      Cancelar
                  </Button>
                  <Button type="submit" className="bg-primary hover:bg-primary/90" disabled={isSaving || isGeneratingAIDescription}>
                  {isSaving ? (
                      <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Guardando...
                      </>
                  ) : (
                      <>
                      <Save className="mr-2 h-4 w-4" /> Guardar Cambios
                      </>
                  )}
                  </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

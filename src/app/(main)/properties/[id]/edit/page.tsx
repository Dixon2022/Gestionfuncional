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
import { getPropertyById, updateProperty } from '@/lib/property-store';
import type { Property, PropertyType, ListingType } from '@/lib/types';
import { PROPERTY_TYPES, LISTING_TYPES } from '@/lib/constants';
import { Loader2, Save, PencilLine, Sparkles } from 'lucide-react';
import Image from 'next/image';
import { generatePropertyDescription, type GeneratePropertyDescriptionInput } from '@/ai/flows/generate-property-description';

const editPropertySchema = z.object({
  title: z.string().min(5, { message: 'El título debe tener al menos 5 caracteres.' }),
  price: z.coerce.number().min(1, { message: 'El precio debe ser mayor que 0.' }),
  propertyType: z.string().min(1, { message: 'El tipo de propiedad es requerido.' }) as z.ZodType<PropertyType>,
  listingType: z.string().min(1, { message: 'El tipo de listado es requerido.' }) as z.ZodType<ListingType>,
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
  const id = params && typeof params.id === 'string' ? params.id : undefined;

  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();

  // Explicitly type images as (string | { id: number; [key: string]: any })[]
  type PropertyWithTypedImages = Property & { images?: (string | { id: number; [key: string]: any })[] };
  const [property, setProperty] = useState<PropertyWithTypedImages | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isGeneratingAIDescription, setIsGeneratingAIDescription] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [imagesToDelete, setImagesToDelete] = useState<number[]>([]);

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

    const fetchProperty = async () => {
      if (!user) {
        router.push(`/login?redirect=/properties/${id}/edit`);
        return;
      }

      if (!id) {
        toast({ title: "ID de propiedad no válido", variant: "destructive" });
        router.push('/properties');
        return;
      }

      const fetchedProperty = await getPropertyById(id);
      if (!fetchedProperty) {
        toast({ title: "Propiedad no encontrada", variant: "destructive" });
        router.push('/properties');
        return;
      }

      if (fetchedProperty.owner.name !== user.name) {
        toast({
          title: "Acceso Denegado",
          description: "No tienes permiso para editar esta propiedad.",
          variant: "destructive",
        });
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
        keyFeatures: Array.isArray(fetchedProperty.features) ? fetchedProperty.features.join(', ') : '',
        description: fetchedProperty.description,
      });

      setIsLoading(false); // ✅ Solo se ejecuta si la propiedad fue cargada exitosamente
    };

    fetchProperty();
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
      toast({
        title: "Foto Requerida",
        description: "Se necesita una foto para generar la descripción con IA.",
        variant: "destructive",
      });
      setIsGeneratingAIDescription(false);
      return;
    }

    if (!photoUriToUse.startsWith('data:')) {
      toast({
        title: "Conversión de Foto Necesaria",
        description: "La foto principal es una URL. Esta función puede no ser óptima.",
        variant: "default",
      });
    }

    function sqmToSqft(sqm: number): number {
      return Math.round(sqm * 10.7639);
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
      toast({
        title: 'Falló la Generación',
        description: (error as Error).message || 'Ocurrió un error al generar la descripción.',
        variant: 'destructive',
      });
    } finally {
      setIsGeneratingAIDescription(false);
    }
  };

  const onSubmit = async (data: EditPropertyFormValues) => {
    if (
      !property ||
      !user ||
      // Cambia esta línea:
      // user.id !== property.ownerId
      ( user.name !== property.owner.name)
    ) {
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
      features: data.keyFeatures.split(',').map(f => f.trim()).filter(Boolean),
      description: data.description,
    };

    try {
      // Elimina primero las imágenes que se van a borrar
      for (const imageId of imagesToDelete) {
        await fetch(`/api/property/${property.id}/images/${imageId}`, { method: "DELETE" });
      }

      await new Promise(resolve => setTimeout(resolve, 1000));
      const success = await updateProperty(property.id, updatedPropertyData, user.id);
      if (success) {
        toast({
          title: '¡Propiedad Actualizada!',
          description: 'Los cambios han sido guardados.',
        });
        router.push(`/properties/${property.id}`);
      } else {
        toast({
          title: 'Error al Actualizar',
          description: 'No se pudo guardar los cambios.',
          variant: 'destructive',
        });
      }
    } catch {
      toast({
        title: 'Error Inesperado',
        description: 'Ocurrió un error al actualizar.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
      setImagesToDelete([]); // Limpia el array después de guardar
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
          <CardDescription>
            Actualiza los detalles de tu propiedad "{property.title}".
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Galería de imágenes arriba del formulario, estilo generate-description-form */}
          <div className="mb-8">
            <label className="block text-sm font-medium mb-2">Imágenes de la Propiedad (máx. 10)</label>
            <div className="flex flex-col gap-2">
              <label
                htmlFor="edit-photos-upload"
                className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-secondary/50 hover:bg-secondary/70 border-input transition"
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <svg className="w-8 h-8 mb-2 text-muted-foreground" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 16V4m0 0L8 8m4-4l4 4M20 16v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2" />
                  </svg>
                  <p className="mb-1 text-sm text-muted-foreground">
                    <span className="font-semibold">Haz clic para subir</span> o arrastra y suelta
                  </p>
                  <p className="text-xs text-muted-foreground">PNG, JPG, JPEG, WEBP (Máx. 5MB por imagen, 10 imágenes máx.)</p>
                </div>
                <Input
                  id="edit-photos-upload"
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  multiple
                  className="hidden"
                  onChange={async (e) => {
                    const files = Array.from(e.target.files ?? []);
                    const limitedFiles = files.slice(0, 10);
                    const fileReaders = await Promise.all(
                      limitedFiles.map(
                        (file) =>
                          new Promise<string>((resolve, reject) => {
                            if (file.size > 5 * 1024 * 1024) return resolve(""); // skip large files
                            const reader = new FileReader();
                            reader.onload = () => resolve(reader.result as string);
                            reader.onerror = reject;
                            reader.readAsDataURL(file);
                          })
                      )
                    );
                    setProperty({
                      ...property,
                      images: [
                        ...(property.images ?? []),
                        ...fileReaders.filter(Boolean),
                      ].slice(0, 10),
                    });
                  }}
                />
              </label>
              {property.images && property.images.length > 0 && (
                <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {property.images.map((img, idx) => (
                    <div key={idx} className="relative group aspect-square">
                      <Image
                        src={img}
                        alt={`Imagen ${idx + 1}`}
                        fill
                        style={{ objectFit: "cover" }}
                        className="rounded-md border"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-1 right-1 h-6 w-6 opacity-75 group-hover:opacity-100 transition-opacity"
                        onClick={async () => {
                          // Si img es un objeto con id, lo agregamos a imagesToDelete
                          if (typeof img === "object" && img !== null && "id" in img) {
                            setImagesToDelete((prev) => [...prev, (img as { id: number }).id]);
                            setProperty({
                              ...property,
                              images: property.images.filter((_, i) => i !== idx),
                            });
                          }
                        }}
                      >
                        <span className="sr-only">Eliminar imagen {idx + 1}</span>
                        ×
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                Sube fotos claras de la propiedad. La primera imagen será la principal.
              </p>
            </div>
          </div>
          {/* Fin galería de imágenes */}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Título</FormLabel>
                    <FormControl>
                      <Input placeholder="Título de la propiedad" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Precio</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Precio" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex gap-4">
                <FormField
                  control={form.control}
                  name="propertyType"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Tipo de Propiedad</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona tipo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {PROPERTY_TYPES.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
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
                    <FormItem className="flex-1">
                      <FormLabel>Tipo de Listado</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona listado" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {LISTING_TYPES.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
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
                    <FormLabel>Dirección</FormLabel>
                    <FormControl>
                      <Input placeholder="Dirección" {...field} />
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
                    <FormLabel>Ciudad</FormLabel>
                    <FormControl>
                      <Input placeholder="Ciudad" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex gap-4">
                <FormField
                  control={form.control}
                  name="numberOfBedrooms"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Habitaciones</FormLabel>
                      <FormControl>
                        <Input type="number" min={0} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="numberOfBathrooms"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Baños</FormLabel>
                      <FormControl>
                        <Input type="number" min={0} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="area"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Área (m²)</FormLabel>
                      <FormControl>
                        <Input type="number" min={1} {...field} />
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
                    <FormLabel>Características Clave</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: Piscina, Jardín, Garaje" {...field} />
                    </FormControl>
                    <FormDescription>
                      Separa las características con comas.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descripción</FormLabel>
                    <FormControl>
                      <Textarea rows={5} placeholder="Describe la propiedad..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex items-center gap-4">

                <Button type="submit" disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      <Save className="mr-2 h-4 w-4" />
                      Guardar Cambios
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Guardar Cambios
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

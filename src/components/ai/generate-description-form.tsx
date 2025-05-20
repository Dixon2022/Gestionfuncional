
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
import { Sparkles, Loader2, Save, UploadCloud, Trash2 } from 'lucide-react';
import { generatePropertyDescription, type GeneratePropertyDescriptionInput } from '@/ai/flows/generate-property-description';
import { PROPERTY_TYPES, LISTING_TYPES } from '@/lib/constants';
import Image from 'next/image';
import { useAuth } from '@/contexts/auth-context';
import { addProperty, sqmToSqft } from '@/lib/property-store';
import type { Property, PropertyType as PropertyTypeType, ListingType as ListingTypeType } from '@/lib/types';
import { useRouter } from 'next/navigation';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_IMAGES = 10;

const generateDescriptionSchema = z.object({
  photos: z
    .custom<FileList>()
    .refine((files) => files && files.length > 0, 'Se requiere al menos una foto de la propiedad.')
    .refine((files) => files && files.length <= MAX_IMAGES, `Puedes subir un máximo de ${MAX_IMAGES} imágenes.`)
    .refine(
      (files) => Array.from(files || []).every((file) => file.size <= MAX_FILE_SIZE),
      `Cada archivo no debe superar los 5MB.`
    )
    .refine(
      (files) => Array.from(files || []).every((file) => ACCEPTED_IMAGE_TYPES.includes(file.type)),
      'Solo se aceptan archivos .jpg, .jpeg, .png y .webp.'
    ),
  propertyType: z.string().min(1, { message: 'El tipo de propiedad es requerido.' }) as z.ZodType<PropertyTypeType>,
  listingType: z.string().min(1, {message: 'El tipo de listado es requerido.'}) as z.ZodType<ListingTypeType>,
  location: z.string().min(2, { message: 'La ubicación debe tener al menos 2 caracteres.' }),
  title: z.string().min(5, {message: 'El título debe tener al menos 5 caracteres.'}),
  price: z.coerce.number().min(1, {message: 'El precio debe ser mayor que 0.'}),
  numberOfBedrooms: z.coerce.number().min(0, { message: 'El número de habitaciones no puede ser negativo.' }),
  numberOfBathrooms: z.coerce.number().min(0, { message: 'El número de baños no puede ser negativo.' }),
  squareFootage: z.coerce.number().min(1, { message: 'Los metros cuadrados deben ser mayores que 0.' }),
  keyFeatures: z.string().min(5, { message: 'Por favor, lista al menos una característica clave.' }),
  description: z.string().min(20, { message: "La descripción debe tener al menos 20 caracteres."}),
});

type GenerateDescriptionFormValues = z.infer<typeof generateDescriptionSchema>;

export function GenerateDescriptionForm() {
  const { toast } = useToast();
  const { user } = useAuth();
  const router = useRouter();
  const [isAIGenerating, setIsAIGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [photoDataUrisForSave, setPhotoDataUrisForSave] = useState<string[]>([]);

  const form = useForm<GenerateDescriptionFormValues>({
    resolver: zodResolver(generateDescriptionSchema),
    defaultValues: {
      propertyType: 'Casa',
      listingType: 'Venta',
      location: '',
      title: '',
      price: 50000000, 
      numberOfBedrooms: 2,
      numberOfBathrooms: 1,
      squareFootage: 100, 
      keyFeatures: '',
      description: '',
    },
  });

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      form.setValue('photos', files);
      const fileArray = Array.from(files);
      
      if (fileArray.length > MAX_IMAGES) {
        toast({
          title: "Demasiadas Imágenes",
          description: `Has seleccionado ${fileArray.length} imágenes. Solo se procesarán las primeras ${MAX_IMAGES}.`,
          variant: "destructive",
        });
      }

      const limitedFiles = fileArray.slice(0, MAX_IMAGES);
      const newPreviewImages: string[] = [];
      const newPhotoDataUris: string[] = [];

      for (const file of limitedFiles) {
        if (file.size > MAX_FILE_SIZE) {
          toast({ title: 'Archivo Demasiado Grande', description: `El archivo "${file.name}" excede los 5MB y no será procesado.`, variant: 'destructive' });
          continue;
        }
        if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
          toast({ title: 'Tipo de Archivo No Soportado', description: `El archivo "${file.name}" tiene un formato no soportado y no será procesado.`, variant: 'destructive' });
          continue;
        }
        const reader = new FileReader();
        const promise = new Promise<string>((resolve, reject) => {
          reader.onloadend = () => {
            if (typeof reader.result === 'string') {
              resolve(reader.result);
            } else {
              reject(new Error('Error al leer el archivo.'));
            }
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        try {
          const result = await promise;
          newPreviewImages.push(result);
          newPhotoDataUris.push(result);
        } catch (error) {
          console.error("Error processing file:", error);
          toast({ title: 'Error al procesar imagen', description: `No se pudo procesar el archivo "${file.name}".`, variant: 'destructive' });
        }
      }
      setPreviewImages(newPreviewImages);
      setPhotoDataUrisForSave(newPhotoDataUris);
      if (newPhotoDataUris.length === 0 && files.length > 0) {
        form.resetField('photos');
      }
    } else {
      setPreviewImages([]);
      setPhotoDataUrisForSave([]);
      form.resetField('photos');
    }
  };
  
  const removeImage = (index: number) => {
    const newPreviews = [...previewImages];
    const newUris = [...photoDataUrisForSave];
    newPreviews.splice(index, 1);
    newUris.splice(index, 1);
    setPreviewImages(newPreviews);
    setPhotoDataUrisForSave(newUris);

    const currentFiles = form.getValues('photos');
    if (currentFiles) {
      const updatedFileList = Array.from(currentFiles);
      updatedFileList.splice(index, 1);
      
      const dataTransfer = new DataTransfer();
      updatedFileList.forEach(file => dataTransfer.items.add(file));
      form.setValue('photos', dataTransfer.files, { shouldValidate: true });

      if (dataTransfer.files.length === 0) {
        form.resetField('photos');
      }
    }
  };

  // This function is triggered by the "Generar Descripción con IA" button
  async function handleAIGenerateDescription(data: GenerateDescriptionFormValues) {
    setIsAIGenerating(true);
    try {
      if (photoDataUrisForSave.length === 0) {
        toast({ title: 'Fotos Requeridas', description: 'Por favor, sube al menos una foto de la propiedad.', variant: 'destructive' });
        setIsAIGenerating(false);
        return;
      }
      
      const input: GeneratePropertyDescriptionInput = {
        photoDataUri: photoDataUrisForSave[0],
        propertyType: data.propertyType,
        location: data.location,
        numberOfBedrooms: data.numberOfBedrooms,
        numberOfBathrooms: data.numberOfBathrooms,
        squareFootage: sqmToSqft(data.squareFootage), 
        keyFeatures: data.keyFeatures,
      };
      
      const result = await generatePropertyDescription(input);
      form.setValue('description', result.description); // Set AI description into the form field
      toast({
        title: '¡Descripción Generada por IA!',
        description: 'La descripción generada se ha añadido al formulario. Puedes editarla si lo deseas.',
      });

    } catch (error) {
      console.error('Error generando descripción con IA:', error);
      toast({
        title: 'Falló la Generación con IA',
        description: (error as Error).message || 'Ocurrió un error inesperado.',
        variant: 'destructive',
      });
    } finally {
      setIsAIGenerating(false);
    }
  }

  const handleSaveProperty = async () => {
    const isValid = await form.trigger(); // Validate all fields, including manual description
    if (!isValid) {
      toast({ title: "Formulario Inválido", description: "Por favor, completa todos los campos requeridos.", variant: "destructive" });
      return;
    }

    const currentFormData = form.getValues();

    if (!user || photoDataUrisForSave.length === 0) {
      toast({
        title: 'Error',
        description: 'Faltan fotos para guardar la propiedad o no has iniciado sesión.',
        variant: 'destructive',
      });
      return;
    }
    if (!currentFormData.description) {
        toast({
            title: 'Descripción Requerida',
            description: 'Por favor, ingresa una descripción para la propiedad o genérala con IA.',
            variant: 'destructive',
        });
        return;
    }

    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newPropertyId = Date.now().toString(); 
    const newProperty: Property = {
      id: newPropertyId,
      title: currentFormData.title, 
      address: currentFormData.location, 
      city: currentFormData.location.split(',')[0]?.trim() || currentFormData.location,
      price: currentFormData.price,
      bedrooms: currentFormData.numberOfBedrooms,
      bathrooms: currentFormData.numberOfBathrooms,
      area: currentFormData.squareFootage, 
      type: currentFormData.propertyType,
      listingType: currentFormData.listingType,
      description: currentFormData.description, // Use description from the form
      images: photoDataUrisForSave,
      isFeatured: Math.random() < 0.2, 
      agent: { 
        name: user.name,
        email: user.email,
        phone: user.phone, 
        avatarUrl: `https://placehold.co/100x100.png?text=${user.name ? user.name.substring(0,1) : 'U'}`
      },
      features: currentFormData.keyFeatures.split(',').map(f => f.trim()).filter(f => f),
      yearBuilt: new Date().getFullYear() - Math.floor(Math.random() * 20), 
      lotSize: currentFormData.squareFootage + Math.floor(Math.random() * 50), 
      ownerId: user.id,
      photoDataUri: photoDataUrisForSave[0],
      createdAt: Date.now(),
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
        {/* The form onSubmit now triggers AI generation */}
        <form onSubmit={form.handleSubmit(handleAIGenerateDescription)} className="space-y-6">
          <FormField
            control={form.control}
            name="photos"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fotos de la Propiedad (1-10 imágenes)</FormLabel>
                <FormControl>
                  <div className="flex items-center justify-center w-full">
                    <label
                      htmlFor="photos-upload"
                      className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-secondary/50 hover:bg-secondary/70 border-input"
                    >
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <UploadCloud className="w-8 h-8 mb-2 text-muted-foreground" />
                        <p className="mb-1 text-sm text-muted-foreground">
                          <span className="font-semibold">Haz clic para subir</span> o arrastra y suelta
                        </p>
                        <p className="text-xs text-muted-foreground">PNG, JPG, JPEG, WEBP (Máx. 5MB por imagen, {MAX_IMAGES} imágenes máx.)</p>
                      </div>
                      <Input 
                        id="photos-upload"
                        type="file" 
                        accept={ACCEPTED_IMAGE_TYPES.join(',')}
                        multiple
                        onChange={handleFileChange}
                        className="hidden"
                        disabled={isAIGenerating || isSaving}
                      />
                    </label>
                  </div>
                </FormControl>
                {previewImages.length > 0 && (
                  <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {previewImages.map((src, index) => (
                      <div key={index} className="relative group aspect-square">
                        <Image 
                            src={src} 
                            alt={`Vista previa ${index + 1}`} 
                            fill={true}
                            style={{objectFit: "cover"}}
                            className="rounded-md border"
                            data-ai-hint="foto propiedad"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-1 right-1 h-6 w-6 opacity-75 group-hover:opacity-100 transition-opacity"
                          onClick={() => removeImage(index)}
                          disabled={isAIGenerating || isSaving}
                        >
                          <Trash2 className="h-3 w-3" />
                          <span className="sr-only">Eliminar imagen {index + 1}</span>
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
                <FormDescription>
                  Sube fotos claras de la propiedad. La primera imagen será usada para generar la descripción con IA.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Título de la Propiedad</FormLabel>
                <FormControl>
                  <Input placeholder="Ej: Hermoso Apartamento con Vistas" {...field} disabled={isAIGenerating || isSaving}/>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
                control={form.control}
                name="propertyType"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Tipo de Propiedad</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isAIGenerating || isSaving}>
                    <FormControl>
                        <SelectTrigger>
                        <SelectValue placeholder="Selecciona el tipo" />
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
                name="listingType"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Tipo de Listado</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isAIGenerating || isSaving}>
                    <FormControl>
                        <SelectTrigger>
                        <SelectValue placeholder="Selecciona el listado" />
                        </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                        {LISTING_TYPES.map(type => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
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
            name="price"
            render={({ field }) => (
            <FormItem>
                <FormLabel>Precio (CRC)</FormLabel>
                <FormControl>
                <Input type="number" min="1" placeholder="Ej: 50000000" {...field} disabled={isAIGenerating || isSaving} />
                </FormControl>
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
                  <Input placeholder="Ej: San José, Escazú" {...field} disabled={isAIGenerating || isSaving} />
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
                    <Input type="number" min="0" {...field} disabled={isAIGenerating || isSaving}/>
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
                    <Input type="number" min="0" step="0.5" {...field} disabled={isAIGenerating || isSaving}/>
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
                    <Input type="number" min="1" {...field} disabled={isAIGenerating || isSaving}/>
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
                    disabled={isAIGenerating || isSaving}
                  />
                </FormControl>
                <FormDescription>Destaca los mejores aspectos de la propiedad.</FormDescription>
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
                    placeholder="Describe tu propiedad detalladamente o usa la IA para generarla y luego edítala aquí."
                    className="min-h-[120px]"
                    {...field}
                    disabled={isAIGenerating || isSaving}
                    />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
           />

          <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={isAIGenerating || isSaving || photoDataUrisForSave.length === 0}>
            {isAIGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generando Descripción...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generar/Regenerar Descripción con IA
              </>
            )}
          </Button>
        </form>
      </Form>

      <Button 
        onClick={handleSaveProperty} 
        className="w-full mt-4 bg-accent hover:bg-accent/90 text-accent-foreground" 
        disabled={isSaving || isAIGenerating}
      >
        {isSaving ? (
          <> <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Guardando Propiedad... </>
        ) : (
          <> <Save className="mr-2 h-4 w-4" /> Guardar Propiedad </>
        )}
      </Button>
    </div>
  );
}

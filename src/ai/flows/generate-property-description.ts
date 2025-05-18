
'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GeneratePropertyDescriptionInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "Una foto de la propiedad, como un URI de datos que debe incluir un tipo MIME y usar codificación Base64. Formato esperado: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  propertyType: z.string().describe('El tipo de propiedad (p.ej., casa, apartamento, condominio).'),
  location: z.string().describe('La ubicación de la propiedad (ciudad, vecindario).'),
  numberOfBedrooms: z.number().describe('El número de habitaciones en la propiedad.'),
  numberOfBathrooms: z.number().describe('El número de baños en la propiedad.'),
  squareFootage: z.number().describe('La superficie de la propiedad en pies cuadrados.'), 
  keyFeatures: z.string().describe('Una lista separada por comas de las características clave de la propiedad.'),
});
export type GeneratePropertyDescriptionInput = z.infer<typeof GeneratePropertyDescriptionInputSchema>;

const GeneratePropertyDescriptionOutputSchema = z.object({
  description: z.string().describe('Una descripción de propiedad convincente generada por IA EN ESPAÑOL.'),
});
export type GeneratePropertyDescriptionOutput = z.infer<typeof GeneratePropertyDescriptionOutputSchema>;

export async function generatePropertyDescription(
  input: GeneratePropertyDescriptionInput
): Promise<GeneratePropertyDescriptionOutput> {
  return generatePropertyDescriptionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generatePropertyDescriptionPrompt',
  input: {schema: GeneratePropertyDescriptionInputSchema},
  output: {schema: GeneratePropertyDescriptionOutputSchema},
  prompt: `Eres un experto en marketing inmobiliario. Genera una descripción de propiedad atractiva y convincente EN ESPAÑOL basada en la siguiente información:

Tipo de Propiedad: {{{propertyType}}}
Ubicación: {{{location}}}
Número de Habitaciones: {{{numberOfBedrooms}}}
Número de Baños: {{{numberOfBathrooms}}}
Superficie (pies cuadrados): {{{squareFootage}}}
Características Clave: {{{keyFeatures}}}
Foto: {{media url=photoDataUri}}

Escribe la descripción en ESPAÑOL. Debe resaltar las mejores características de la propiedad y atraer a posibles compradores. Concéntrate en crear una narrativa vívida y atractiva.
`,
});

const generatePropertyDescriptionFlow = ai.defineFlow(
  {
    name: 'generatePropertyDescriptionFlow',
    inputSchema: GeneratePropertyDescriptionInputSchema,
    outputSchema: GeneratePropertyDescriptionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

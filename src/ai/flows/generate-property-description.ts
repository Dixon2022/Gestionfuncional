
'use server';
/**
 * @fileOverview AI-powered property description generator.
 *
 * - generatePropertyDescription - A function that generates a property description.
 * - GeneratePropertyDescriptionInput - The input type for the generatePropertyDescription function.
 * - GeneratePropertyDescriptionOutput - The return type for the generatePropertyDescription function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GeneratePropertyDescriptionInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of the property, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  propertyType: z.string().describe('El tipo de propiedad (e.g., casa, apartamento, condominio).'),
  location: z.string().describe('La ubicación de la propiedad (ciudad, vecindario).'),
  numberOfBedrooms: z.number().describe('El número de habitaciones en la propiedad.'),
  numberOfBathrooms: z.number().describe('El número de baños en la propiedad.'),
  squareFootage: z.number().describe('La superficie de la propiedad en pies cuadrados.'), // Input to AI is in sqft
  keyFeatures: z.string().describe('Una lista separada por comas de las características clave de la propiedad.'),
});
export type GeneratePropertyDescriptionInput = z.infer<typeof GeneratePropertyDescriptionInputSchema>;

const GeneratePropertyDescriptionOutputSchema = z.object({
  description: z.string().describe('Una descripción de propiedad convincente generada por IA en ESPAÑOL.'),
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

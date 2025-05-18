
'use server';
/**
 * @fileOverview
 * @en AI-powered property description generator. This file defines a Genkit flow
 * that takes property details as input and generates a compelling description using an AI model.
 * @es Generador de descripciones de propiedades impulsado por IA. Este archivo define un flujo de Genkit
 * que toma detalles de la propiedad como entrada y genera una descripción convincente utilizando un modelo de IA.
 *
 * @exports generatePropertyDescription - @en Function to trigger the property description generation flow. @es Función para activar el flujo de generación de descripción de propiedad.
 * @exports GeneratePropertyDescriptionInput - @en Input type for the generatePropertyDescription function. @es Tipo de entrada para la función generatePropertyDescription.
 * @exports GeneratePropertyDescriptionOutput - @en Output type for the generatePropertyDescription function. @es Tipo de salida para la función generatePropertyDescription.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

/**
 * @en Zod schema for the input of the property description generation flow.
 * @es Esquema Zod para la entrada del flujo de generación de descripción de propiedad.
 */
const GeneratePropertyDescriptionInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "[EN] A photo of the property, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'. [ES] Una foto de la propiedad, como un URI de datos que debe incluir un tipo MIME y usar codificación Base64. Formato esperado: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  propertyType: z.string().describe('[EN] The type of property (e.g., house, apartment, condo). [ES] El tipo de propiedad (p.ej., casa, apartamento, condominio).'),
  location: z.string().describe('[EN] The location of the property (city, neighborhood). [ES] La ubicación de la propiedad (ciudad, vecindario).'),
  numberOfBedrooms: z.number().describe('[EN] The number of bedrooms in the property. [ES] El número de habitaciones en la propiedad.'),
  numberOfBathrooms: z.number().describe('[EN] The number of bathrooms in the property. [ES] El número de baños en la propiedad.'),
  squareFootage: z.number().describe('[EN] The square footage of the property. [ES] La superficie de la propiedad en pies cuadrados.'), // Input to AI is in sqft
  keyFeatures: z.string().describe('[EN] A comma-separated list of key features of the property. [ES] Una lista separada por comas de las características clave de la propiedad.'),
});
/**
 * @en TypeScript type inferred from the GeneratePropertyDescriptionInputSchema.
 * @es Tipo de TypeScript inferido desde GeneratePropertyDescriptionInputSchema.
 */
export type GeneratePropertyDescriptionInput = z.infer<typeof GeneratePropertyDescriptionInputSchema>;

/**
 * @en Zod schema for the output of the property description generation flow.
 * @es Esquema Zod para la salida del flujo de generación de descripción de propiedad.
 */
const GeneratePropertyDescriptionOutputSchema = z.object({
  description: z.string().describe('[EN] A compelling, AI-generated property description IN SPANISH. [ES] Una descripción de propiedad convincente generada por IA EN ESPAÑOL.'),
});
/**
 * @en TypeScript type inferred from the GeneratePropertyDescriptionOutputSchema.
 * @es Tipo de TypeScript inferido desde GeneratePropertyDescriptionOutputSchema.
 */
export type GeneratePropertyDescriptionOutput = z.infer<typeof GeneratePropertyDescriptionOutputSchema>;

/**
 * @en Asynchronously generates a property description using an AI model.
 * @es Genera asíncronamente una descripción de propiedad utilizando un modelo de IA.
 * @param {GeneratePropertyDescriptionInput} input - @en The input data for generating the description. @es Los datos de entrada para generar la descripción.
 * @returns {Promise<GeneratePropertyDescriptionOutput>} A promise that resolves to the generated description. @es Una promesa que se resuelve con la descripción generada.
 */
export async function generatePropertyDescription(
  input: GeneratePropertyDescriptionInput
): Promise<GeneratePropertyDescriptionOutput> {
  return generatePropertyDescriptionFlow(input);
}

/**
 * @en Genkit prompt definition for generating property descriptions.
 * @es Definición del prompt de Genkit para generar descripciones de propiedades.
 */
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

/**
 * @en Genkit flow definition for the property description generation process.
 * @es Definición del flujo de Genkit para el proceso de generación de descripción de propiedad.
 */
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


'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Mail, Send } from 'lucide-react';

const contactFormSchema = z.object({
  name: z.string().min(2, { message: 'El nombre debe tener al menos 2 caracteres.' }),
  email: z.string().email({ message: 'Por favor ingresa una dirección de email válida.' }),
  phone: z.string().optional(),
  message: z.string().min(10, { message: 'El mensaje debe tener al menos 10 caracteres.' }),
  propertyId: z.string(),
  propertyName: z.string(), // Added propertyName
  agentEmail: z.string().email(),
});

type ContactFormValues = z.infer<typeof contactFormSchema>;

interface ContactFormProps {
  propertyId: string;
  propertyName: string; // Added propertyName
  agentEmail: string;
  agentName: string;
}

export function ContactForm({ propertyId, propertyName, agentEmail, agentName }: ContactFormProps) {
  const { toast } = useToast();
  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      message: '',
      propertyId,
      propertyName, // Initialize propertyName
      agentEmail,
    },
  });

  async function onSubmit(data: ContactFormValues) {
    form.formState.isSubmitting = true; // Manually set submitting state, react-hook-form might not do it for async without `handleSubmit` managing it.
    try {
      const response = await fetch('/api/contact-agent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        toast({
          title: '¡Consulta Enviada!',
          description: result.message || `Tu mensaje sobre la propiedad "${data.propertyName}" ha sido enviado a ${agentName}.`,
        });
        form.reset();
      } else {
        toast({
          title: 'Error al Enviar Consulta',
          description: result.error || 'No se pudo enviar tu mensaje. Inténtalo de nuevo.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error submitting contact form:', error);
      toast({
        title: 'Error Inesperado',
        description: 'Ocurrió un error al enviar tu consulta. Por favor, inténtalo más tarde.',
        variant: 'destructive',
      });
    } finally {
      // react-hook-form's isSubmitting should reset automatically, but ensure it does.
      // For manual control: form.control.setIsSubmitting(false); // if not using form's own state for this
      // This is a bit of a hack, usually isSubmitting is handled by RHF directly if onSubmit is passed to handleSubmit
    }
  }

  return (
    <div className="p-6 border rounded-lg shadow-lg bg-card">
      <h3 className="text-xl font-semibold mb-4 flex items-center">
        <Mail className="mr-2 h-5 w-5 text-primary" />
        Contactar al Agente
      </h3>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre Completo</FormLabel>
                <FormControl>
                  <Input placeholder="Juan Pérez" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Dirección de Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="tu@ejemplo.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Número de Teléfono (Opcional)</FormLabel>
                <FormControl>
                  <Input type="tel" placeholder="555-123-4567" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="message"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mensaje</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder={`Estoy interesado/a en la propiedad "${propertyName}"...`}
                    className="min-h-[100px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? 'Enviando...' : <> <Send className="mr-2 h-4 w-4" /> Enviar Consulta </>}
          </Button>
        </form>
      </Form>
    </div>
  );
}

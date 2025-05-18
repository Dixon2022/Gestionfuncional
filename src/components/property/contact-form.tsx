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
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  phone: z.string().optional(),
  message: z.string().min(10, { message: 'Message must be at least 10 characters.' }),
  propertyId: z.string(),
  agentEmail: z.string().email(),
});

type ContactFormValues = z.infer<typeof contactFormSchema>;

interface ContactFormProps {
  propertyId: string;
  agentEmail: string;
  agentName: string;
}

export function ContactForm({ propertyId, agentEmail, agentName }: ContactFormProps) {
  const { toast } = useToast();
  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      message: '',
      propertyId,
      agentEmail,
    },
  });

  async function onSubmit(data: ContactFormValues) {
    // Here you would typically send the data to your backend or a service like Formspree
    // For demonstration, we'll just show a toast message.
    console.log('Contact form submitted:', data);
    toast({
      title: 'Inquiry Sent!',
      description: `Your message regarding property ID ${data.propertyId} has been sent to ${agentName}.`,
    });
    form.reset();
  }

  return (
    <div className="p-6 border rounded-lg shadow-lg bg-card">
      <h3 className="text-xl font-semibold mb-4 flex items-center">
        <Mail className="mr-2 h-5 w-5 text-primary" />
        Contact Agent
      </h3>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input placeholder="John Doe" {...field} />
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
                <FormLabel>Email Address</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="you@example.com" {...field} />
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
                <FormLabel>Phone Number (Optional)</FormLabel>
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
                <FormLabel>Message</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder={`I'm interested in property ID ${propertyId}...`}
                    className="min-h-[100px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? 'Sending...' : <> <Send className="mr-2 h-4 w-4" /> Send Inquiry </>}
          </Button>
        </form>
      </Form>
    </div>
  );
}

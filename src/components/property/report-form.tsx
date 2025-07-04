'use client';

import { useState } from 'react';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Input } from '../ui/input';
import { useToast } from '@/hooks/use-toast';

interface ReportFormProps {
  propertyId: string;
}

export function ReportForm({ propertyId }: ReportFormProps) {
  const [reason, setReason] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/report-property', {
        method: 'POST',
        body: JSON.stringify({ propertyId, reason, message }),
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Error al enviar el reporte');

      toast({
        title: 'Reporte enviado',
        description: '¡Reporte enviado con éxito!',
      });

      setReason('');
      setMessage('');
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Error al enviar el reporte',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        placeholder="Motivo del reporte (Ej. Información falsa)"
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        required
      />
      <Textarea
        placeholder="Mensaje opcional..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <Button type="submit" className="w-full sm:w-full bg-gradient-to-r from-green-400 to-blue-500 text-white shadow-lg hover:from-green-500 hover:to-blue-600 hover:scale-105 transition-transform duration-200" disabled={loading}>
        {loading ? 'Enviando...' : 'Reportar Propiedad'}
      </Button>
    </form>
  );
}

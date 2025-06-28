import React, { useEffect, useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarDays } from 'lucide-react';

interface PropertyAvailabilityCalendarProps {
  propertyId: string;
  listingType: string;
}

interface AvailabilityRange {
  id: number;
  startDate: string;
  endDate: string;
}

export function PropertyAvailabilityCalendar({ propertyId, listingType }: PropertyAvailabilityCalendarProps) {
  const [availability, setAvailability] = useState<AvailabilityRange[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

  useEffect(() => {
    async function fetchAvailability() {
      if (listingType !== 'Alquiler') {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/property/${propertyId}/availability`);
        if (response.ok) {
          const data = await response.json();
          setAvailability(data);
        }
      } catch (error) {
        console.error('Error fetching availability:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchAvailability();
  }, [propertyId, listingType]);

  // Only show for rental properties
  if (listingType !== 'Alquiler') {
    return null;
  }

  if (loading) {
    return (
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center">
            <CalendarDays className="mr-2 h-5 w-5" />
            Disponibilidad
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Cargando disponibilidad...</p>
        </CardContent>
      </Card>
    );
  }

  // Create a set of available dates for quick lookup
  const availableDates = new Set<string>();
  availability.forEach(range => {
    const start = new Date(range.startDate);
    const end = new Date(range.endDate);
    const current = new Date(start);
    
    while (current <= end) {
      availableDates.add(current.toDateString());
      current.setDate(current.getDate() + 1);
    }
  });

  // Function to check if a date is available
  const isDateAvailable = (date: Date) => {
    return availableDates.has(date.toDateString());
  };

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="flex items-center">
          <CalendarDays className="mr-2 h-5 w-5" />
          Disponibilidad para Alquiler
        </CardTitle>
        <CardDescription>
          Las fechas en verde están disponibles para alquiler.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {availability.length === 0 ? (
          <p className="text-muted-foreground">
            No hay fechas de disponibilidad configuradas para esta propiedad.
          </p>
        ) : (
          <div className="space-y-4">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md border"
              modifiers={{
                available: (date: Date) => isDateAvailable(date) && date >= new Date(new Date().toDateString())
              }}
              modifiersStyles={{
                available: { 
                  backgroundColor: '#dcfce7', 
                  color: '#166534',
                  fontWeight: 'bold'
                }
              }}
              disabled={(date) => date < new Date(new Date().toDateString())}
            />
            <div className="text-sm text-muted-foreground space-y-1">
              <p>📅 <span className="font-semibold text-green-600">Verde:</span> Disponible</p>
              <p>📅 <span className="font-semibold text-gray-500">Gris:</span> No disponible</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

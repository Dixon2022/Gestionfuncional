import React, { useEffect, useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, Clock } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface AvailabilityRange {
  id: number;
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
}

interface PropertyAvailabilityCalendarProps {
  propertyId: string;
  listingType: string;
}

export function PropertyAvailabilityCalendar({ propertyId, listingType }: PropertyAvailabilityCalendarProps) {
  const [availability, setAvailability] = useState<AvailabilityRange[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  // Only show calendar for rental properties
  if (listingType !== 'Alquiler') {
    return null;
  }

  useEffect(() => {
    fetchAvailability();
  }, [propertyId]);

  const fetchAvailability = async () => {
    try {
      const response = await fetch(`/api/property/${propertyId}/availability`);
      if (response.ok) {
        const data = await response.json();
        setAvailability(data);
      } else {
        console.error('Error fetching availability');
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Create a set of available dates for quick lookup
  const availableDates = new Set<string>();
  availability.forEach(range => {
    const start = new Date(range.startDate);
    const end = new Date(range.endDate);
    
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      availableDates.add(d.toISOString().split('T')[0]);
    }
  });

  // Custom day modifier function
  const modifiers = {
    available: (date: Date) => {
      const dateStr = date.toISOString().split('T')[0];
      return availableDates.has(dateStr);
    },
    unavailable: (date: Date) => {
      const dateStr = date.toISOString().split('T')[0];
      const today = new Date().toISOString().split('T')[0];
      return date.toISOString().split('T')[0] < today || !availableDates.has(dateStr);
    }
  };

  const modifiersStyles = {
    available: {
      backgroundColor: '#10b981',
      color: 'white',
      fontWeight: 'bold'
    },
    unavailable: {
      backgroundColor: '#f3f4f6',
      color: '#9ca3af',
      textDecoration: 'line-through'
    }
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5" />
            Disponibilidad
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarDays className="h-5 w-5 text-blue-600" />
          Disponibilidad para Alquiler
        </CardTitle>
        <CardDescription>
          Consulta las fechas disponibles para esta propiedad
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {availability.length === 0 ? (
          <div className="text-center py-6">
            <Clock className="h-12 w-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500">No hay disponibilidad configurada</p>
            <p className="text-sm text-gray-400">Contacta al propietario para más información</p>
          </div>
        ) : (
          <>
            <div className="flex flex-wrap gap-2 mb-4">
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                Disponible
              </Badge>
              <Badge variant="secondary" className="bg-gray-100 text-gray-600">
                <div className="w-3 h-3 bg-gray-400 rounded-full mr-2"></div>
                No disponible
              </Badge>
            </div>
            
            <div className="flex justify-center">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                modifiers={modifiers}
                modifiersStyles={modifiersStyles}
                className="rounded-md border"
                classNames={{
                  months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                  month: "space-y-4",
                  caption: "flex justify-center pt-1 relative items-center",
                  caption_label: "text-sm font-medium",
                  nav: "space-x-1 flex items-center",
                  nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
                  nav_button_previous: "absolute left-1",
                  nav_button_next: "absolute right-1",
                  table: "w-full border-collapse space-y-1",
                  head_row: "flex",
                  head_cell: "text-slate-500 rounded-md w-9 font-normal text-[0.8rem]",
                  row: "flex w-full mt-2",
                  cell: "h-9 w-9 text-center text-sm p-0 relative focus-within:relative focus-within:z-20",
                  day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100 hover:bg-slate-100 rounded-md",
                  day_range_end: "day-range-end",
                  day_selected: "bg-slate-900 text-slate-50 hover:bg-slate-900 hover:text-slate-50 focus:bg-slate-900 focus:text-slate-50",
                  day_today: "bg-slate-100 text-slate-900",
                  day_outside: "day-outside text-slate-500 opacity-50 aria-selected:bg-slate-100 aria-selected:text-slate-500 aria-selected:opacity-30",
                  day_disabled: "text-slate-500 opacity-50",
                  day_range_middle: "aria-selected:bg-slate-100 aria-selected:text-slate-900",
                  day_hidden: "invisible",
                }}
              />
            </div>

            {/* Available ranges list */}
            <div className="mt-6">
              <h4 className="font-semibold text-sm mb-3">Períodos Disponibles:</h4>
              <div className="space-y-2">
                {availability.map((range) => (
                  <div key={range.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center gap-2">
                      <CalendarDays className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium">
                        {new Date(range.startDate).toLocaleDateString('es-ES')} - {new Date(range.endDate).toLocaleDateString('es-ES')}
                      </span>
                    </div>
                    <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                      {Math.ceil((new Date(range.endDate).getTime() - new Date(range.startDate).getTime()) / (1000 * 60 * 60 * 24) + 1)} días
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

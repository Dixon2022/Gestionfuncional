import React, { useEffect, useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, Plus, Trash2, Save } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/auth-context';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { DateRange } from 'react-day-picker';

interface AvailabilityRange {
  id: number;
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
}

interface PropertyAvailabilityManagerProps {
  propertyId: string;
  ownerId: number;
  listingType: string;
}

export function PropertyAvailabilityManager({ propertyId, ownerId, listingType }: PropertyAvailabilityManagerProps) {
  const { user } = useAuth();
  const [availability, setAvailability] = useState<AvailabilityRange[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedRange, setSelectedRange] = useState<DateRange | undefined>();

  // Only show for rental properties and property owners
  if (listingType !== 'Alquiler' || !user || parseInt(user.id) !== ownerId) {
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

  const addAvailabilityRange = async () => {
    if (!selectedRange?.from || !selectedRange?.to) {
      toast({
        title: "Selecciona un rango de fechas",
        description: "Debes seleccionar una fecha de inicio y fin",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(`/api/property/${propertyId}/availability`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          startDate: selectedRange.from.toISOString(),
          endDate: selectedRange.to.toISOString(),
          ownerId: ownerId,
        }),
      });

      if (response.ok) {
        const newRange = await response.json();
        setAvailability(prev => [...prev, newRange].sort((a, b) => 
          new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
        ));
        setSelectedRange(undefined);
        toast({
          title: "Disponibilidad agregada",
          description: "El rango de fechas ha sido agregado exitosamente",
        });
      } else {
        const errorData = await response.json();
        toast({
          title: "Error",
          description: errorData.error || "Error al agregar disponibilidad",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Error de conexión. Intenta de nuevo.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const deleteAvailabilityRange = async (availabilityId: number) => {
    try {
      const response = await fetch(`/api/property/${propertyId}/availability`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          availabilityId,
          ownerId: ownerId,
        }),
      });

      if (response.ok) {
        setAvailability(prev => prev.filter(range => range.id !== availabilityId));
        toast({
          title: "Disponibilidad eliminada",
          description: "El rango de fechas ha sido eliminado exitosamente",
        });
      } else {
        const errorData = await response.json();
        toast({
          title: "Error",
          description: errorData.error || "Error al eliminar disponibilidad",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Error de conexión. Intenta de nuevo.",
        variant: "destructive",
      });
    }
  };

  // Create a set of available dates for calendar display
  const availableDates = new Set<string>();
  availability.forEach(range => {
    const start = new Date(range.startDate);
    const end = new Date(range.endDate);
    
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      availableDates.add(d.toISOString().split('T')[0]);
    }
  });

  const modifiers = {
    available: (date: Date) => {
      const dateStr = date.toISOString().split('T')[0];
      return availableDates.has(dateStr);
    },
  };

  const modifiersStyles = {
    available: {
      backgroundColor: '#10b981',
      color: 'white',
      fontWeight: 'bold'
    },
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5" />
            Gestionar Disponibilidad
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
          Gestionar Disponibilidad
        </CardTitle>
        <CardDescription>
          Configura las fechas en que tu propiedad estará disponible para alquiler
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Add New Availability */}
        <div className="space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="font-semibold text-blue-900">Agregar Nueva Disponibilidad</h4>
          <div className="flex flex-wrap gap-2 mb-4">
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
              Ya disponible
            </Badge>
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
              Seleccionando
            </Badge>
          </div>
          
          <div className="flex justify-center">
            <Calendar
              mode="range"
              selected={selectedRange}
              onSelect={setSelectedRange}
              modifiers={modifiers}
              modifiersStyles={modifiersStyles}
              disabled={(date) => date < new Date()}
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
                day_selected: "bg-blue-500 text-white hover:bg-blue-600 hover:text-white focus:bg-blue-600 focus:text-white",
                day_today: "bg-slate-100 text-slate-900",
                day_outside: "day-outside text-slate-500 opacity-50",
                day_disabled: "text-slate-500 opacity-50",
                day_range_middle: "aria-selected:bg-blue-100 aria-selected:text-blue-900",
                day_hidden: "invisible",
              }}
            />
          </div>

          {selectedRange?.from && selectedRange?.to && (
            <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
              <span className="text-sm">
                <strong>Rango seleccionado:</strong>{' '}
                {selectedRange.from.toLocaleDateString('es-ES')} - {selectedRange.to.toLocaleDateString('es-ES')}
                {' '}({Math.ceil((selectedRange.to.getTime() - selectedRange.from.getTime()) / (1000 * 60 * 60 * 24) + 1)} días)
              </span>
              <Button onClick={addAvailabilityRange} disabled={saving} className="flex items-center gap-2">
                <Save className="h-4 w-4" />
                {saving ? 'Guardando...' : 'Guardar'}
              </Button>
            </div>
          )}
        </div>

        {/* Current Availability List */}
        <div>
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            Disponibilidad Actual
            <Badge variant="secondary">{availability.length}</Badge>
          </h4>
          
          {availability.length === 0 ? (
            <div className="text-center py-6 bg-gray-50 rounded-lg">
              <CalendarDays className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">No hay disponibilidad configurada</p>
              <p className="text-sm text-gray-400">Agrega rangos de fechas para mostrar la disponibilidad</p>
            </div>
          ) : (
            <div className="space-y-3">
              {availability.map((range) => (
                <div key={range.id} className="flex items-center justify-between p-4 bg-white border rounded-lg shadow-sm">
                  <div className="flex items-center gap-3">
                    <CalendarDays className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium">
                        {new Date(range.startDate).toLocaleDateString('es-ES')} - {new Date(range.endDate).toLocaleDateString('es-ES')}
                      </p>
                      <p className="text-sm text-gray-500">
                        {Math.ceil((new Date(range.endDate).getTime() - new Date(range.startDate).getTime()) / (1000 * 60 * 60 * 24) + 1)} días disponibles
                      </p>
                    </div>
                  </div>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm" className="text-red-500 border-red-200 hover:bg-red-50">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Eliminar disponibilidad</AlertDialogTitle>
                        <AlertDialogDescription>
                          ¿Estás seguro de que quieres eliminar este rango de disponibilidad? Esta acción no se puede deshacer.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => deleteAvailabilityRange(range.id)}
                          className="bg-red-500 hover:bg-red-600"
                        >
                          Eliminar
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

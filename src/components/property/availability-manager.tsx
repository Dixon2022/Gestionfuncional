import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { CalendarDays, Plus, Trash2 } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { toast } from '@/hooks/use-toast';
import { DateRange } from 'react-day-picker';

interface AvailabilityManagerProps {
  propertyId: string;
  ownerId: number;
  listingType: string;
}

interface AvailabilityRange {
  id: number;
  startDate: string;
  endDate: string;
}

export function AvailabilityManager({ propertyId, ownerId, listingType }: AvailabilityManagerProps) {
  const { user } = useAuth();
  const [availability, setAvailability] = useState<AvailabilityRange[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRange, setSelectedRange] = useState<DateRange | undefined>();
  const [saving, setSaving] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [checkingOwnership, setCheckingOwnership] = useState(true);

  useEffect(() => {
    fetchAvailability();
    checkOwnership();
  }, [propertyId, user]);

  const checkOwnership = async () => {
    if (!user) {
      setIsOwner(false);
      setCheckingOwnership(false);
      return;
    }

    try {
      // Get the real user ID from the database
      const userResponse = await fetch(`/api/user/by-email?email=${encodeURIComponent(user.email)}`);
      if (userResponse.ok) {
        const userData = await userResponse.json();
        setIsOwner(userData.id === ownerId);
      } else {
        setIsOwner(false);
      }
    } catch (error) {
      console.error('Error checking ownership:', error);
      setIsOwner(false);
    } finally {
      setCheckingOwnership(false);
    }
  };

  const fetchAvailability = async () => {
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
  };

  const handleAddAvailability = async () => {
    if (!selectedRange?.from || !selectedRange?.to) {
      toast({
        title: "Error",
        description: "Selecciona un rango de fechas válido.",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      // Get the real user ID from the database
      const userResponse = await fetch(`/api/user/by-email?email=${encodeURIComponent(user!.email)}`);
      if (!userResponse.ok) {
        toast({
          title: "Error",
          description: "No se pudo obtener la información del usuario",
          variant: "destructive",
        });
        setSaving(false);
        return;
      }
      const userData = await userResponse.json();
      const realUserId = userData.id;

      const response = await fetch(`/api/property/${propertyId}/availability`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          startDate: selectedRange.from.toISOString(),
          endDate: selectedRange.to.toISOString(),
          ownerId: realUserId,
        }),
      });

      if (response.ok) {
        await fetchAvailability();
        setSelectedRange(undefined);
        toast({
          title: "Disponibilidad agregada",
          description: "El rango de fechas ha sido agregado exitosamente.",
        });
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.error || "No se pudo agregar la disponibilidad.",
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

  const handleDeleteAvailability = async (availabilityId: number) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este rango de disponibilidad?')) {
      return;
    }

    try {
      // Get the real user ID from the database
      const userResponse = await fetch(`/api/user/by-email?email=${encodeURIComponent(user!.email)}`);
      if (!userResponse.ok) {
        toast({
          title: "Error",
          description: "No se pudo obtener la información del usuario",
          variant: "destructive",
        });
        return;
      }
      const userData = await userResponse.json();
      const realUserId = userData.id;

      const response = await fetch(`/api/property/${propertyId}/availability`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          availabilityId,
          ownerId: realUserId,
        }),
      });

      if (response.ok) {
        setAvailability(availability.filter(range => range.id !== availabilityId));
        toast({
          title: "Disponibilidad eliminada",
          description: "El rango de fechas ha sido eliminado.",
        });
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.error || "No se pudo eliminar la disponibilidad.",
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

  const formatDateRange = (startDate: string, endDate: string) => {
    const start = new Date(startDate).toLocaleDateString('es-ES');
    const end = new Date(endDate).toLocaleDateString('es-ES');
    return `${start} - ${end}`;
  };

  // Only show for property owners and rental properties
  if (!user || !isOwner || listingType !== 'Alquiler') {
    return null;
  }

  if (loading || checkingOwnership) {
    return (
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center">
            <CalendarDays className="mr-2 h-5 w-5" />
            Gestionar Disponibilidad
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Cargando disponibilidad...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="flex items-center">
          <CalendarDays className="mr-2 h-5 w-5" />
          Gestionar Disponibilidad
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Add New Availability */}
        <div className="space-y-4">
          <h4 className="font-semibold">Agregar Nuevo Rango de Disponibilidad</h4>
          <Calendar
            mode="range"
            selected={selectedRange}
            onSelect={setSelectedRange}
            className="rounded-md border"
            disabled={(date) => date < new Date(new Date().toDateString())}
          />
          <Button 
            onClick={handleAddAvailability}
            disabled={!selectedRange?.from || !selectedRange?.to || saving}
            className="w-full"
          >
            {saving ? (
              <>Guardando...</>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Agregar Disponibilidad
              </>
            )}
          </Button>
        </div>

        {/* Current Availability */}
        <div className="space-y-4">
          <h4 className="font-semibold">Rangos de Disponibilidad Actuales</h4>
          {availability.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              No tienes rangos de disponibilidad configurados.
            </p>
          ) : (
            <div className="space-y-2">
              {availability.map((range) => (
                <div key={range.id} className="flex items-center justify-between p-3 border rounded-lg bg-card">
                  <span className="font-medium">
                    {formatDateRange(range.startDate, range.endDate)}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteAvailability(range.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

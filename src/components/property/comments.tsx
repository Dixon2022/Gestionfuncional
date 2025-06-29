import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { StarRating, AverageRating } from '@/components/ui/star-rating';
import { MessageCircle, Send, Trash2 } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { toast } from '@/hooks/use-toast';

interface PropertyCommentsProps {
  propertyId: string;
}

interface Comment {
  id: number;
  comment: string;
  rating: number | null;
  createdAt: string;
  user: {
    id: number;
    name: string;
  };
}

export function PropertyComments({ propertyId }: PropertyCommentsProps) {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [newRating, setNewRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchComments();
  }, [propertyId]);

  const fetchComments = async () => {
    try {
      const response = await fetch(`/api/property/${propertyId}/comments`);
      if (response.ok) {
        const data = await response.json();
        setComments(data);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Error",
        description: "Debes iniciar sesión para comentar.",
        variant: "destructive",
      });
      return;
    }

    if (newComment.trim().length < 10) {
      toast({
        title: "Error",
        description: "El comentario debe tener al menos 10 caracteres.",
        variant: "destructive",
      });
      return;
    }

    if (newRating === 0) {
      toast({
        title: "Error",
        description: "Por favor selecciona una calificación.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      // Get the real user ID from the database
      const userResponse = await fetch(`/api/user/by-email?email=${encodeURIComponent(user.email)}`);
      if (!userResponse.ok) {
        toast({
          title: "Error",
          description: "No se pudo obtener la información del usuario",
          variant: "destructive",
        });
        setSubmitting(false);
        return;
      }
      const userData = await userResponse.json();
      const realUserId = userData.id;

      const response = await fetch(`/api/property/${propertyId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          comment: newComment.trim(),
          rating: newRating,
          userId: realUserId,
        }),
      });

      if (response.ok) {
        const newCommentData = await response.json();
        setComments([newCommentData, ...comments]);
        setNewComment('');
        setNewRating(0);
        toast({
          title: "Comentario publicado",
          description: "Tu comentario ha sido publicado exitosamente.",
        });
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.error || "No se pudo publicar el comentario.",
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
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!user) return;

    if (!confirm('¿Estás seguro de que quieres eliminar este comentario?')) {
      return;
    }

    try {
      // Get the real user ID from the database
      const userResponse = await fetch(`/api/user/by-email?email=${encodeURIComponent(user.email)}`);
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

      const response = await fetch(`/api/property/${propertyId}/comments`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          commentId,
          userId: realUserId,
        }),
      });

      if (response.ok) {
        setComments(comments.filter(comment => comment.id !== commentId));
        toast({
          title: "Comentario eliminado",
          description: "El comentario ha sido eliminado.",
        });
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.error || "No se pudo eliminar el comentario.",
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center">
            <MessageCircle className="mr-2 h-5 w-5" />
            Comentarios
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Cargando comentarios...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-8">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <MessageCircle className="mr-2 h-5 w-5" />
            Comentarios ({comments.length})
          </CardTitle>
          {comments.length > 0 && (
            <AverageRating 
              ratings={comments.map(c => c.rating).filter((rating): rating is number => rating !== null)} 
              size="sm"
              showCount={false}
            />
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Add Comment Form */}
        {user ? (
          <form onSubmit={handleSubmitComment} className="space-y-4">
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Calificación
                </label>
                <StarRating 
                  rating={newRating}
                  onRatingChange={setNewRating}
                  interactive={true}
                  size="lg"
                />
              </div>
              <Textarea
                placeholder="Comparte tu opinión sobre esta propiedad..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="min-h-[100px]"
                maxLength={1000}
              />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">
                {newComment.length}/1000 caracteres
              </span>
              <Button 
                type="submit" 
                disabled={submitting || newComment.trim().length < 10 || newRating === 0}
                className="flex items-center"
              >
                {submitting ? (
                  <>Publicando...</>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Publicar Comentario
                  </>
                )}
              </Button>
            </div>
          </form>
        ) : (
          <div className="p-4 bg-muted rounded-lg text-center">
            <p className="text-muted-foreground">
              <a href="/login" className="text-primary hover:underline">
                Inicia sesión
              </a>{' '}
              para dejar un comentario sobre esta propiedad.
            </p>
          </div>
        )}

        {/* Comments List */}
        {comments.length === 0 ? (
          <div className="text-center py-8">
            <MessageCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              Sé el primero en comentar sobre esta propiedad.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {comments.map((comment) => (
              <div key={comment.id} className="border rounded-lg p-4 bg-card">
                <div className="flex items-start space-x-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>
                      {comment.user.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="font-semibold text-sm">{comment.user.name}</p>
                        <div className="flex items-center gap-2">
                          {comment.rating !== null ? (
                            <StarRating rating={comment.rating} size="sm" />
                          ) : (
                            <span className="text-xs text-muted-foreground">Sin calificación</span>
                          )}
                          <p className="text-xs text-muted-foreground">
                            {formatDate(comment.createdAt)}
                          </p>
                        </div>
                      </div>
                      {(Number(user?.id) === comment.user.id || user?.role === 'admin') && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteComment(comment.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <p className="mt-2 text-sm whitespace-pre-line">
                      {comment.comment}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

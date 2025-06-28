import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Send, Trash2, UserCircle } from 'lucide-react';
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

interface Comment {
  id: number;
  comment: string;
  createdAt: string;
  user: {
    id: number;
    name: string;
  };
}

interface PropertyCommentsProps {
  propertyId: string;
}

export function PropertyComments({ propertyId }: PropertyCommentsProps) {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
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
      } else {
        console.error('Error fetching comments');
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const submitComment = async () => {
    if (!user) {
      toast({
        title: "Inicia sesión",
        description: "Debes iniciar sesión para comentar",
        variant: "destructive",
      });
      return;
    }

    if (newComment.trim().length < 10) {
      toast({
        title: "Comentario muy corto",
        description: "El comentario debe tener al menos 10 caracteres",
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
          userId: realUserId,
        }),
      });

      if (response.ok) {
        const newCommentData = await response.json();
        setComments(prev => [newCommentData, ...prev]);
        setNewComment('');
        toast({
          title: "Comentario enviado",
          description: "Tu comentario ha sido publicado exitosamente",
        });
      } else {
        const errorData = await response.json();
        toast({
          title: "Error",
          description: errorData.error || "Error al enviar comentario",
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

  const deleteComment = async (commentId: number) => {
    if (!user) return;

    try {
      const response = await fetch(`/api/property/${propertyId}/comments`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          commentId,
          userId: parseInt(user.id),
        }),
      });

      if (response.ok) {
        setComments(prev => prev.filter(comment => comment.id !== commentId));
        toast({
          title: "Comentario eliminado",
          description: "El comentario ha sido eliminado exitosamente",
        });
      } else {
        const errorData = await response.json();
        toast({
          title: "Error",
          description: errorData.error || "Error al eliminar comentario",
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

  const canDeleteComment = (comment: Comment) => {
    if (!user) return false;
    return comment.user.id === parseInt(user.id) || user.role === 'admin';
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Comentarios
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
          <MessageSquare className="h-5 w-5 text-blue-600" />
          Comentarios
          <Badge variant="secondary" className="ml-2">
            {comments.length}
          </Badge>
        </CardTitle>
        <CardDescription>
          Opiniones y comentarios sobre esta propiedad
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Add Comment Form */}
        {user ? (
          <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-start gap-3">
              <Avatar className="w-8 h-8">
                <AvatarFallback>
                  <UserCircle className="h-5 w-5" />
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="text-sm font-medium">{user.name}</p>
                <p className="text-xs text-gray-500">Agregar comentario</p>
              </div>
            </div>
            <Textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Comparte tu opinión sobre esta propiedad..."
              className="min-h-[100px] resize-none"
              maxLength={1000}
            />
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500">
                {newComment.length}/1000 caracteres (mínimo 10)
              </span>
              <Button
                onClick={submitComment}
                disabled={submitting || newComment.trim().length < 10}
                className="flex items-center gap-2"
              >
                <Send className="h-4 w-4" />
                {submitting ? 'Enviando...' : 'Comentar'}
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-6 bg-gray-50 rounded-lg">
            <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600 mb-2">Inicia sesión para comentar</p>
            <p className="text-sm text-gray-500">
              Comparte tu opinión sobre esta propiedad
            </p>
          </div>
        )}

        {/* Comments List */}
        <div className="space-y-4">
          {comments.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">Aún no hay comentarios</p>
              <p className="text-sm text-gray-400">
                Sé el primero en compartir tu opinión
              </p>
            </div>
          ) : (
            comments.map((comment) => (
              <div
                key={comment.id}
                className="p-4 bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <Avatar className="w-10 h-10">
                      <AvatarFallback>
                        {comment.user.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-sm">{comment.user.name}</p>
                        <span className="text-xs text-gray-500">
                          {new Date(comment.createdAt).toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                      <p className="text-gray-700 text-sm leading-relaxed">
                        {comment.comment}
                      </p>
                    </div>
                  </div>
                  
                  {canDeleteComment(comment) && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Eliminar comentario</AlertDialogTitle>
                          <AlertDialogDescription>
                            ¿Estás seguro de que quieres eliminar este comentario? Esta acción no se puede deshacer.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteComment(comment.id)}
                            className="bg-red-500 hover:bg-red-600"
                          >
                            Eliminar
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}

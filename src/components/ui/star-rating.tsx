import React from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  onRatingChange?: (rating: number) => void;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  showValue?: boolean;
}

export function StarRating({ 
  rating, 
  onRatingChange, 
  size = 'md', 
  interactive = false,
  showValue = false 
}: StarRatingProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  };

  const handleStarClick = (starNumber: number) => {
    if (interactive && onRatingChange) {
      onRatingChange(starNumber);
    }
  };

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => handleStarClick(star)}
          disabled={!interactive}
          className={`
            ${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'}
            transition-all duration-200
            ${interactive ? 'focus:outline-none focus:ring-2 focus:ring-yellow-400 rounded' : ''}
          `}
          title={interactive ? `Calificar con ${star} estrella${star > 1 ? 's' : ''}` : `${rating} de 5 estrellas`}
        >
          <Star
            className={`
              ${sizeClasses[size]}
              ${star <= rating 
                ? 'fill-yellow-400 text-yellow-400' 
                : 'fill-gray-200 text-gray-300'
              }
              ${interactive && star <= rating ? 'hover:fill-yellow-500 hover:text-yellow-500' : ''}
              transition-colors duration-200
            `}
          />
        </button>
      ))}
      {showValue && (
        <span className="ml-2 text-sm text-muted-foreground">
          ({rating}/5)
        </span>
      )}
    </div>
  );
}

interface AverageRatingProps {
  ratings: number[];
  size?: 'sm' | 'md' | 'lg';
  showCount?: boolean;
}

export function AverageRating({ ratings, size = 'md', showCount = true }: AverageRatingProps) {
  if (ratings.length === 0) {
    return (
      <div className="flex items-center gap-2">
        <StarRating rating={0} size={size} />
        <span className="text-sm text-muted-foreground">Sin calificaciones</span>
      </div>
    );
  }

  const average = ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;
  const roundedAverage = Math.round(average * 10) / 10; // Round to 1 decimal

  return (
    <div className="flex items-center gap-2">
      <StarRating rating={Math.round(average)} size={size} />
      <span className="text-sm font-medium">
        {roundedAverage.toFixed(1)}
      </span>
      {showCount && (
        <span className="text-sm text-muted-foreground">
          ({ratings.length} {ratings.length === 1 ? 'calificación' : 'calificaciones'})
        </span>
      )}
    </div>
  );
}

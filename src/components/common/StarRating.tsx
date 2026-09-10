import { Star, StarHalf } from '@phosphor-icons/react';

interface StarRatingProps {
  rating: number;
  count?: number;
  size?: number;
}

export function StarRating({ rating, count, size = 12 }: StarRatingProps) {
  const full  = Math.floor(rating);
  const half  = rating % 1 >= 0.5 ? 1 : 0;
  const empty = 5 - full - half;

  return (
    <span className="stars" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: full }).map((_, i) => (
        <Star key={`f${i}`} size={size} weight="fill" color="var(--phosphor)" aria-hidden="true" />
      ))}
      {half === 1 && (
        <StarHalf size={size} weight="fill" color="var(--phosphor)" aria-hidden="true" />
      )}
      {Array.from({ length: empty }).map((_, i) => (
        <Star key={`e${i}`} size={size} weight="regular" color="var(--dead)" aria-hidden="true" />
      ))}
      {count != null && (
        <span className="star-count">({count})</span>
      )}
    </span>
  );
}

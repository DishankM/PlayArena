// client/src/components/common/StarRating.jsx

export const StarRating = ({ rating, count, color = 'text-arena-gold', size = 'sm' }) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  const sizeClasses = {
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-0.5">
        {[...Array(fullStars)].map((_, i) => (
          <i key={`full-${i}`} className={`ti ti-star-filled ${color} ${sizeClasses[size]}`} />
        ))}
        {hasHalfStar && (
          <i className={`ti ti-star-half-filled ${color} ${sizeClasses[size]}`} />
        )}
        {[...Array(emptyStars)].map((_, i) => (
          <i key={`empty-${i}`} className={`ti ti-star ${color} opacity-30 ${sizeClasses[size]}`} />
        ))}
      </div>
      {count > 0 && (
        <span className="text-xs text-gray-400">({count.toLocaleString()})</span>
      )}
    </div>
  );
};
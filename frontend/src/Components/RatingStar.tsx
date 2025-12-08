import { Star } from "lucide-react";

export const StarRating = ({
  rating,
  size = 16,
}: {
  rating: number;
  size?: number;
}) => {
  const clamped = Math.max(0, Math.min(5, rating));
  const full = Math.floor(clamped);
  const frac = clamped - full;

  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => {
        const fill = i < full ? 100 : i === full ? frac * 100 : 0;
        return (
          <span
            key={i}
            className="relative inline-block"
            style={{ width: size, height: size }}
          >
            <Star width={size} height={size} className="text-gray-300" />
            {fill > 0 && (
              <span
                className="absolute left-0 top-0 h-full overflow-hidden text-yellow-400 pointer-events-none"
                style={{ width: `${fill}%` }}
              >
                <Star
                  width={size}
                  height={size}
                  fill="currentColor"
                  stroke="currentColor"
                />
              </span>
            )}
          </span>
        );
      })}
    </div>
  );
};

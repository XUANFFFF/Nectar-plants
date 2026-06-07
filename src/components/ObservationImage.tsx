import type { Observation } from "../lib/types";
import { getPrimaryMediaUrl } from "../lib/observations";

type ObservationImageProps = {
  record: Observation;
  alt?: string;
  className?: string;
  fallbackClassName?: string;
  fallback: string;
};

export function ObservationImage({
  record,
  alt,
  className,
  fallbackClassName,
  fallback,
}: ObservationImageProps) {
  const src = getPrimaryMediaUrl(record);

  if (!src) {
    return <span className={fallbackClassName ?? className}>{fallback}</span>;
  }

  return (
    <img
      className={className}
      src={src}
      alt={alt ?? record.chineseName ?? "观察照片"}
      loading="lazy"
      onError={(event) => {
        const fallbackNode = document.createElement("span");
        fallbackNode.className = fallbackClassName ?? className ?? "";
        fallbackNode.textContent = fallback;
        event.currentTarget.replaceWith(fallbackNode);
      }}
    />
  );
}

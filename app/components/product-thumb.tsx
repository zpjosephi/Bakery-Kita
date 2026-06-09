import Image from "next/image";

// product image — local file, remote URL, or emoji fallback
export default function ProductThumb({
  image,
  emoji,
  name,
  sizes,
  priority,
  className,
  emojiClassName = "text-3xl",
}: {
  image: string;
  emoji: string;
  name: string;
  sizes?: string;
  priority?: boolean;
  className?: string;
  emojiClassName?: string;
}) {
  if (image && image.startsWith("/")) {
    return (
      <Image
        src={image}
        alt={name}
        fill
        sizes={sizes}
        priority={priority}
        className={className ?? "object-cover"}
      />
    );
  }

  if (image && /^https?:\/\//i.test(image)) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={image}
        alt={name}
        className={`absolute inset-0 h-full w-full ${className ?? "object-cover"}`}
      />
    );
  }

  return (
    <div
      className="flex h-full w-full items-center justify-center bg-brand-50 dark:bg-brand-950/30"
      role="img"
      aria-label={name}
    >
      <span className={emojiClassName}>{emoji || "🍞"}</span>
    </div>
  );
}

import { useState } from 'react'
import { cn } from '../../lib/utils'

type SmartImageProps = {
  src: string
  alt: string
  className?: string
  wrapperClassName?: string
  sizes?: string
  priority?: boolean
  aspect?: string
}

const SKELETON =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"><rect width="16" height="16" fill="#eef4f3"/></svg>`,
  )

/**
 * Image with a graceful fallback: remote photos are unreliable offline, so any
 * load error swaps in a branded teal placeholder rather than a broken icon.
 */
export function SmartImage({
  src,
  alt,
  className,
  wrapperClassName,
  sizes,
  priority = false,
  aspect,
}: SmartImageProps) {
  const [failed, setFailed] = useState(false)

  return (
    <div
      className={cn('relative overflow-hidden bg-muted', wrapperClassName)}
      style={aspect ? { aspectRatio: aspect } : undefined}
    >
      {failed ? (
        <div
          role="img"
          aria-label={alt}
          className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-teal-100 via-teal-50 to-muted"
        >
          <span className="px-4 text-center text-xs font-semibold text-accent-foreground/80">{alt}</span>
        </div>
      ) : null}
      <img
        src={failed ? SKELETON : src}
        alt={alt}
        sizes={sizes}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        onError={() => setFailed(true)}
        className={cn(
          'h-full w-full object-cover transition-opacity duration-500',
          failed ? 'opacity-0' : 'opacity-100',
          className,
        )}
      />
    </div>
  )
}

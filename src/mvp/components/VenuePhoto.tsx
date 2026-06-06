export function unsplashPhotoUrl(imageId: string, w: number, h: number): string {
  return `https://images.unsplash.com/photo-${imageId}?w=${w}&h=${h}&fit=crop&auto=format`
}

export function VenuePhoto({
  imageId,
  alt,
  className = 'h-full w-full object-cover',
  width = 480,
  height = 320,
  loading = 'lazy',
}: {
  imageId: string
  alt: string
  className?: string
  width?: number
  height?: number
  loading?: 'lazy' | 'eager'
}) {
  return (
    <img
      src={unsplashPhotoUrl(imageId, width, height)}
      alt={alt}
      className={className}
      loading={loading}
    />
  )
}

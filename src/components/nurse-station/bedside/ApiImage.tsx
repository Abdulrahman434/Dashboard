/**
 * ApiImage (dashboard shim)
 * --------------------------------------------------------------------------
 * The kiosk app proxied remote images through a backend. In the dashboard the
 * bedside images are local bundled assets or https URLs, so a plain <img> with
 * graceful fallback is sufficient.
 */
import { useState, useEffect, ImgHTMLAttributes } from "react";

interface ApiImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, "src"> {
  src: string;
  fallback?: React.ReactNode;
  showFallbackWhileLoading?: boolean;
}

export function ApiImage({
  src,
  fallback,
  showFallbackWhileLoading = false,
  alt = "",
  ...rest
}: ApiImageProps) {
  const [error, setError] = useState(false);

  useEffect(() => {
    setError(false);
  }, [src]);

  if (error || !src) {
    return fallback ? <>{fallback}</> : null;
  }

  return <img src={src} alt={alt} onError={() => setError(true)} {...rest} />;
}
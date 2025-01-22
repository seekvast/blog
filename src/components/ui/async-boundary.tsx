import { Loading } from './loading'

interface AsyncBoundaryProps {
  children: React.ReactNode
  loading?: boolean
  error?: Error | null
  fallback?: React.ReactNode
  loadingFallback?: React.ReactNode
  fullscreen?: boolean
}

export function AsyncBoundary({
  children,
  loading,
  error,
  fallback,
  loadingFallback,
  fullscreen
}: AsyncBoundaryProps) {
  if (error) {
    return fallback || <div>Error: {error.message}</div>
  }

  if (loading) {
    return loadingFallback || <Loading fullscreen={fullscreen} />
  }

  return children;
}

interface AsyncBoundaryWithQueryProps<T> {
  children: React.ReactNode
  data: T | undefined | null
  isLoading: boolean
  error: Error | null
  fallback?: React.ReactNode
  loadingFallback?: React.ReactNode
  fullscreen?: boolean
}

export function AsyncBoundaryWithQuery<T>({
  children,
  data,
  isLoading,
  error,
  fallback,
  loadingFallback,
  fullscreen
}: AsyncBoundaryWithQueryProps<T>) {
  return (
    <AsyncBoundary
      loading={isLoading}
      error={error}
      fallback={fallback}
      loadingFallback={loadingFallback}
      fullscreen={fullscreen}
    >
      {data ? children : null}
    </AsyncBoundary>
  )
}

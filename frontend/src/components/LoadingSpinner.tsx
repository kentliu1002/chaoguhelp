export default function LoadingSpinner({ size = 24 }: { size?: number }) {
  return (
    <div className="flex items-center justify-center">
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        className="animate-spin"
      >
        <circle cx="12" cy="12" r="10" stroke="#FFD6E0" strokeWidth="3" />
        <path
          d="M12 2a10 10 0 0 1 10 10"
          stroke="#FF6B8A"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>
    </div>
  )
}

export function PageLoader() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
      <LoadingSpinner size={36} />
      <p className="text-sm text-gray-400">加载中...</p>
    </div>
  )
}

export function SkeletonCard() {
  return (
    <div className="card space-y-3">
      <div className="flex items-center gap-3">
        <div className="skeleton h-5 w-24 rounded" />
        <div className="skeleton h-4 w-16 rounded" />
      </div>
      <div className="skeleton h-4 w-full rounded" />
      <div className="skeleton h-4 w-2/3 rounded" />
    </div>
  )
}

export function LoadingSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-5 bg-gray-200 rounded w-32 animate-pulse" />
          <div className="h-3 bg-gray-100 rounded w-48 animate-pulse" />
        </div>
        <div className="h-10 bg-gray-200 rounded-lg w-28 animate-pulse" />
      </div>

      {/* Table skeleton */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        {/* Header row */}
        <div className="flex items-center gap-4 px-5 py-3 border-b border-gray-200 bg-gray-50/50">
          {[80, 60, 60, 70, 50].map((w, i) => (
            <div key={i} className={`h-3 bg-gray-200 rounded animate-pulse`} style={{ width: `${w}px` }} />
          ))}
        </div>
        {/* Data rows */}
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-5 py-3.5 border-b border-gray-50 last:border-0">
            <div className="flex items-center gap-3 flex-1">
              <div className="w-9 h-9 rounded-full bg-gray-200 animate-pulse shrink-0" />
              <div className="space-y-1.5 flex-1">
                <div className="h-3.5 bg-gray-200 rounded w-24 animate-pulse" />
                <div className="h-2.5 bg-gray-100 rounded w-36 animate-pulse" />
              </div>
            </div>
            <div className="h-5 bg-gray-100 rounded w-14 animate-pulse" />
            <div className="h-3 bg-gray-100 rounded w-16 animate-pulse" />
            <div className="h-3 bg-gray-100 rounded w-20 animate-pulse" />
            <div className="h-5 bg-gray-100 rounded-full w-10 animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}

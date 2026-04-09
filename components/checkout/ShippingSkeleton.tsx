export function ShippingSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={index}
          className="rounded-[1.35rem] border border-border/70 bg-card/80 p-4 backdrop-blur-xl"
        >
          <div className="flex items-start gap-4">
            <div className="shimmer-surface h-14 w-14 rounded-full" />
            <div className="min-w-0 flex-1 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 space-y-2">
                  <div className="shimmer-surface h-4 w-36 rounded-full" />
                  <div className="shimmer-surface h-3 w-24 rounded-full" />
                </div>
                <div className="shimmer-surface h-6 w-28 rounded-full" />
              </div>
              <div className="flex items-end justify-between gap-4">
                <div className="shimmer-surface h-4 w-40 rounded-full" />
                <div className="shimmer-surface h-5 w-20 rounded-full" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

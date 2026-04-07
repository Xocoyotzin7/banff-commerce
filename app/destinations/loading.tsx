export default function Loading() {
  return (
    <main className="mx-auto min-h-screen max-w-7xl px-4 pb-16 pt-28 sm:px-6">
      <div className="shimmer-surface h-14 w-56 rounded-full" />
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="overflow-hidden rounded-[2rem] border border-border/70 bg-surface/60 p-4">
            <div className="shimmer-surface aspect-[4/5] rounded-[1.5rem]" />
            <div className="mt-4 space-y-3">
              <div className="shimmer-surface h-4 w-4/5 rounded-full" />
              <div className="shimmer-surface h-3 w-2/3 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}

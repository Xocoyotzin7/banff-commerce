export default function Loading() {
  return (
    <main className="mx-auto min-h-screen max-w-7xl px-4 pb-16 pt-24 sm:px-6">
      <div className="shimmer-surface h-[62vh] rounded-[2.5rem] border border-border/70" />
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="overflow-hidden rounded-[1.8rem] border border-border/70 bg-surface/60 p-4">
            <div className="shimmer-surface aspect-[4/3] rounded-[1.35rem]" />
            <div className="mt-4 space-y-3">
              <div className="shimmer-surface h-4 w-2/3 rounded-full" />
              <div className="shimmer-surface h-3 w-full rounded-full" />
              <div className="shimmer-surface h-3 w-5/6 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}

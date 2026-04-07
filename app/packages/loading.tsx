export default function Loading() {
  return (
    <main className="mx-auto min-h-screen max-w-7xl px-4 pb-16 pt-28 sm:px-6">
      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <aside className="rounded-[2rem] border border-border/70 bg-surface/60 p-5">
          <div className="shimmer-surface h-6 w-40 rounded-full" />
          <div className="mt-4 space-y-3">
            <div className="shimmer-surface h-4 w-full rounded-full" />
            <div className="shimmer-surface h-4 w-5/6 rounded-full" />
            <div className="shimmer-surface h-4 w-2/3 rounded-full" />
            <div className="shimmer-surface h-10 w-full rounded-full" />
            <div className="shimmer-surface h-10 w-full rounded-full" />
          </div>
        </aside>

        <section>
          <div className="shimmer-surface h-12 w-64 rounded-full" />
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="overflow-hidden rounded-[2rem] border border-border/70 bg-surface/60 p-4">
                <div className="shimmer-surface aspect-[4/5] rounded-[1.5rem]" />
                <div className="mt-4 space-y-3">
                  <div className="shimmer-surface h-4 w-3/4 rounded-full" />
                  <div className="shimmer-surface h-3 w-1/2 rounded-full" />
                  <div className="shimmer-surface h-10 w-full rounded-full" />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}

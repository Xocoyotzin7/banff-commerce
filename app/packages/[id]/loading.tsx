export default function Loading() {
  return (
    <main className="mx-auto min-h-screen max-w-6xl px-4 pb-16 pt-28 sm:px-6">
      <div className="shimmer-surface h-[62vh] rounded-[2.5rem] border border-border/70" />
      <section className="mt-8 grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
        <div className="space-y-4">
          <div className="shimmer-surface h-8 w-1/2 rounded-full" />
          <div className="shimmer-surface h-4 w-full rounded-full" />
          <div className="shimmer-surface h-4 w-5/6 rounded-full" />
          <div className="shimmer-surface h-4 w-2/3 rounded-full" />
          <div className="mt-6 space-y-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="shimmer-surface h-20 rounded-[1.35rem]" />
            ))}
          </div>
        </div>
        <aside className="rounded-[2rem] border border-border/70 bg-surface/60 p-5">
          <div className="shimmer-surface h-6 w-40 rounded-full" />
          <div className="mt-4 space-y-3">
            <div className="shimmer-surface h-4 w-full rounded-full" />
            <div className="shimmer-surface h-4 w-2/3 rounded-full" />
            <div className="shimmer-surface h-12 w-full rounded-full" />
          </div>
        </aside>
      </section>
    </main>
  )
}

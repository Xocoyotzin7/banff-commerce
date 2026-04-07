export default function Loading() {
  return (
    <main className="mx-auto min-h-screen max-w-7xl px-4 pb-16 pt-24 sm:px-6">
      <div className="shimmer-surface h-[72vh] rounded-[2.5rem] border border-border/70" />
      <section className="mt-8 grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
        <div className="space-y-4">
          <div className="shimmer-surface h-8 w-1/2 rounded-full" />
          <div className="shimmer-surface h-4 w-full rounded-full" />
          <div className="shimmer-surface h-4 w-5/6 rounded-full" />
          <div className="shimmer-surface h-4 w-2/3 rounded-full" />
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="shimmer-surface h-24 rounded-[1.5rem]" />
            ))}
          </div>
        </div>
        <div className="space-y-4 rounded-[2rem] border border-border/70 bg-surface/60 p-5">
          <div className="shimmer-surface h-6 w-40 rounded-full" />
          <div className="shimmer-surface h-32 rounded-[1.5rem]" />
          <div className="shimmer-surface h-32 rounded-[1.5rem]" />
        </div>
      </section>
    </main>
  )
}

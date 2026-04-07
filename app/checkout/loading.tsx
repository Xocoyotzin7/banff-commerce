export default function Loading() {
  return (
    <main className="mx-auto min-h-screen max-w-7xl px-4 pb-16 pt-28 sm:px-6">
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <section className="rounded-[2rem] border border-border/70 bg-surface/60 p-5">
          <div className="shimmer-surface h-6 w-36 rounded-full" />
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="shimmer-surface h-14 rounded-full" />
            ))}
          </div>
          <div className="mt-6 space-y-3">
            <div className="shimmer-surface h-4 w-1/2 rounded-full" />
            <div className="shimmer-surface h-12 w-full rounded-[1.2rem]" />
            <div className="shimmer-surface h-12 w-full rounded-[1.2rem]" />
            <div className="shimmer-surface h-12 w-full rounded-[1.2rem]" />
          </div>
        </section>

        <aside className="rounded-[2rem] border border-border/70 bg-surface/60 p-5">
          <div className="shimmer-surface h-6 w-44 rounded-full" />
          <div className="mt-5 space-y-3">
            <div className="shimmer-surface h-4 w-full rounded-full" />
            <div className="shimmer-surface h-4 w-5/6 rounded-full" />
            <div className="shimmer-surface h-4 w-2/3 rounded-full" />
            <div className="shimmer-surface h-12 w-full rounded-full" />
          </div>
        </aside>
      </div>
    </main>
  )
}

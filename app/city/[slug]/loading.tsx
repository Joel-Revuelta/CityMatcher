export default function CityLoading() {
  return (
    <div className="mx-auto w-full max-w-[1360px] px-5 py-8 sm:px-8 lg:px-12 lg:py-12" aria-label="Loading city">
      <div className="h-3 w-40 animate-pulse bg-muted" />
      <div className="mt-8 border-b border-border pb-8">
        <div className="flex flex-wrap gap-2">
          <div className="h-6 w-24 animate-pulse bg-muted" />
          <div className="h-6 w-28 animate-pulse bg-muted" />
          <div className="h-6 w-20 animate-pulse bg-muted" />
        </div>
        <div className="mt-5 h-16 w-72 animate-pulse bg-muted" />
        <div className="mt-3 h-4 w-44 animate-pulse bg-muted" />
        <div className="mt-5 h-5 w-1/2 animate-pulse bg-muted" />
      </div>
      <div className="mt-8 grid gap-10 lg:grid-cols-[1.55fr_0.8fr]">
        <div className="space-y-10">
          <div className="h-24 animate-pulse bg-muted" />
          <div>
            <div className="h-6 w-48 animate-pulse bg-muted" />
            <div className="mt-4 h-32 animate-pulse bg-muted" />
          </div>
          <div>
            <div className="h-6 w-64 animate-pulse bg-muted" />
            <div className="mt-4 h-64 animate-pulse bg-muted" />
          </div>
        </div>
        <div className="space-y-4">
          <div className="h-80 animate-pulse bg-muted" />
          <div className="h-56 animate-pulse bg-muted" />
        </div>
      </div>
    </div>
  );
}
